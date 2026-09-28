import { BookableresourcecharacteristicsService } from '../generated/services/BookableresourcecharacteristicsService';
import { CharacteristicsService } from '../generated/services/CharacteristicsService';
import { RatingvaluesService } from '../generated/services/RatingvaluesService';

const CHARACTERISTIC_TYPE_SKILL = 1;

export interface SkillVM {
  id: string;
  characteristicId?: string;
  ratingValueId?: string;
}

export interface SkillOption {
  id: string;
  name: string;
}

export interface RatingOption {
  id: string;
  name: string;
  value: number;
}

/** Skills (bookableresourcecharacteristic) linked to the current user's resource. */
export async function getMySkills(bookableResourceId?: string): Promise<SkillVM[]> {
  if (!bookableResourceId) return [];
  const res = await BookableresourcecharacteristicsService.getAll({
    select: [
      'bookableresourcecharacteristicid',
      '_characteristic_value',
      '_ratingvalue_value',
    ],
    filter: `_resource_value eq ${bookableResourceId} and statecode eq 0`,
    top: 200,
  });
  return (res.data ?? []).map((r) => ({
    id: r.bookableresourcecharacteristicid as string,
    characteristicId: r._characteristic_value,
    ratingValueId: r._ratingvalue_value,
  }));
}

/** All active skills the user can pick from. */
export async function getAvailableSkills(): Promise<SkillOption[]> {
  const res = await CharacteristicsService.getAll({
    select: ['characteristicid', 'name'],
    filter: `statecode eq 0 and characteristictype eq ${CHARACTERISTIC_TYPE_SKILL}`,
    orderBy: ['name asc'],
    top: 1000,
  });
  return (res.data ?? []).map((c) => ({ id: c.characteristicid as string, name: c.name ?? '—' }));
}

/** Proficiency rating options. */
export async function getRatingOptions(): Promise<RatingOption[]> {
  const res = await RatingvaluesService.getAll({
    select: ['ratingvalueid', 'name', 'value'],
    filter: 'statecode eq 0',
    orderBy: ['value asc'],
    top: 50,
  });
  return (res.data ?? []).map((r) => ({
    id: r.ratingvalueid as string,
    name: r.name ?? String(r.value ?? ''),
    value: r.value ?? 0,
  }));
}

/** Adds a skill to the current user's resource, with an optional proficiency rating. */
export async function addMySkill(
  bookableResourceId: string,
  characteristicId: string,
  ratingValueId?: string,
): Promise<void> {
  const record: Record<string, unknown> = {
    'Resource@odata.bind': `/bookableresources(${bookableResourceId})`,
    'Characteristic@odata.bind': `/characteristics(${characteristicId})`,
  };
  if (ratingValueId) {
    record['RatingValue@odata.bind'] = `/ratingvalues(${ratingValueId})`;
  }
  const res = await BookableresourcecharacteristicsService.create(record as never);
  if (!res.success) {
    throw new Error(res.error?.message ?? 'Failed to add skill');
  }
}
