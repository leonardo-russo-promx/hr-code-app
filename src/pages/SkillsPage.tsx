import { useEffect, useMemo, useState } from 'react';
import { FloatingAgentChat } from '../components/FloatingAgentChat';
import { SearchableSelect } from '../components/SearchableSelect';
import { Loader, EmptyState, ErrorState } from '../components/States';
import { getCurrentUser } from '../lib/currentUser';
import {
  getMySkills,
  getAvailableSkills,
  getRatingOptions,
  addMySkill,
  type SkillVM,
  type SkillOption,
  type RatingOption,
} from '../lib/skillsData';

export function SkillsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [resourceId, setResourceId] = useState<string | undefined>();
  const [skills, setSkills] = useState<SkillVM[]>([]);
  const [available, setAvailable] = useState<SkillOption[]>([]);
  const [ratings, setRatings] = useState<RatingOption[]>([]);

  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedRating, setSelectedRating] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | undefined>();
  const [search, setSearch] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const user = await getCurrentUser();
        const [mine, all, rats] = await Promise.all([
          getMySkills(user.bookableResourceId),
          getAvailableSkills(),
          getRatingOptions(),
        ]);
        if (!active) return;
        setResourceId(user.bookableResourceId);
        setSkills(mine);
        setAvailable(all);
        setRatings(rats);
      } catch (err) {
        console.error(err);
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const ownedIds = useMemo(
    () => new Set(skills.map((s) => s.characteristicId).filter(Boolean) as string[]),
    [skills],
  );
  const selectable = useMemo(
    () => available.filter((s) => !ownedIds.has(s.id)),
    [available, ownedIds],
  );

  const skillNameById = useMemo(
    () => new Map(available.map((s) => [s.id, s.name])),
    [available],
  );
  const ratingById = useMemo(
    () => new Map(ratings.map((r) => [r.id, r])),
    [ratings],
  );
  const mySkills = useMemo(
    () =>
      skills
        .map((s) => ({
          id: s.id,
          name: (s.characteristicId && skillNameById.get(s.characteristicId)) || 'Unknown skill',
          rating: s.ratingValueId ? ratingById.get(s.ratingValueId) : undefined,
        }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [skills, skillNameById, ratingById],
  );

  const filteredSkills = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return mySkills;
    return mySkills.filter((s) => s.name.toLowerCase().includes(q));
  }, [mySkills, search]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setFormError(undefined);
    if (!resourceId) {
      setFormError('Your employee record could not be found, so skills cannot be saved.');
      return;
    }
    if (!selectedSkill) return;
    setSaving(true);
    try {
      await addMySkill(resourceId, selectedSkill, selectedRating || undefined);
      const mine = await getMySkills(resourceId);
      setSkills(mine);
      setSelectedSkill('');
      setSelectedRating('');
    } catch (err) {
      console.error(err);
      setFormError('Could not add the skill. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <main className="page"><Loader message="Loading your skills…" /></main>;
  if (error) return <main className="page"><ErrorState /></main>;

  return (
    <main className="page">
      <div className="page__header">
        <h1>My Skills</h1>
        <div className="page__subtitle">View the skills on your profile and add new ones.</div>
      </div>

      <div className="card">
        <div className="card__title">Add a skill</div>
        {!resourceId ? (
          <EmptyState message="Your employee record could not be found, so skills cannot be added." />
        ) : (
          <form className="skill-form" onSubmit={handleAdd}>
            <label className="skill-form__field">
              <span>Skill</span>
              <SearchableSelect
                options={selectable}
                value={selectedSkill}
                onChange={setSelectedSkill}
                placeholder="Type to search a skill…"
                disabled={saving}
                ariaLabel="Skill"
              />
            </label>
            <label className="skill-form__field">
              <span>Proficiency (optional)</span>
              <select
                value={selectedRating}
                onChange={(e) => setSelectedRating(e.target.value)}
                disabled={saving}
                aria-label="Proficiency"
              >
                <option value="">Not rated</option>
                {ratings.map((r) => (
                  <option key={r.id} value={r.id}>{`${r.value} — ${r.name}`}</option>
                ))}
              </select>
            </label>
            <button type="submit" className="btn" disabled={saving || !selectedSkill}>
              {saving ? 'Adding…' : 'Add skill'}
            </button>
          </form>
        )}
        {formError && <div className="form-error">{formError}</div>}
      </div>

      <div className="card">
        <div className="card__title card__title--with-action">
          <span>Your skills ({mySkills.length})</span>
          {mySkills.length > 0 && (
            <input
              type="search"
              className="skill-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search skills…"
              aria-label="Search skills"
            />
          )}
        </div>
        {mySkills.length === 0 ? (
          <EmptyState message="You have no skills on your profile yet." />
        ) : filteredSkills.length === 0 ? (
          <EmptyState message={`No skills match “${search}”.`} />
        ) : (
          <ul className="skill-list">
            {filteredSkills.map((s) => {
              const level = s.rating?.value ?? 0;
              return (
                <li key={s.id} className="skill-row">
                  <div className="skill-row__head">
                    <span className="skill-row__name">{s.name}</span>
                    <span className="skill-row__level">
                      {level > 0 ? `${level}/5` : 'Not rated'}
                    </span>
                  </div>
                  <div
                    className="skill-bar"
                    role="progressbar"
                    aria-valuenow={level}
                    aria-valuemin={0}
                    aria-valuemax={5}
                    aria-label={`${s.name} proficiency`}
                  >
                    <span
                      className="skill-bar__fill"
                      style={{ width: `${(level / 5) * 100}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <FloatingAgentChat
        agentSchemaName="crf8e_agent"
        title="Skill Finder"
        greeting="Hi! I'm the Skill Finder. Ask me about skills or who has a particular expertise."
        starters={['Suggest learning paths for me based on my skills']}
        placeholder="Ask about skills or expertise…"
      />
    </main>
  );
}
