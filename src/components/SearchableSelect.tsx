import { useEffect, useMemo, useRef, useState } from 'react';

interface Option {
  id: string;
  name: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
  disabled?: boolean;
  ariaLabel?: string;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Search…',
  disabled,
  ariaLabel,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlight, setHighlight] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  const selectedName = useMemo(
    () => options.find((o) => o.id === value)?.name ?? '',
    [options, value],
  );

  // Keep the input text in sync with the selected value when closed.
  useEffect(() => {
    if (!open) setQuery(selectedName);
  }, [selectedName, open]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || q === selectedName.toLowerCase()) return options;
    return options.filter((o) => o.name.toLowerCase().includes(q));
  }, [options, query, selectedName]);

  function select(opt: Option) {
    onChange(opt.id);
    setQuery(opt.name);
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!open) setOpen(true);
      setHighlight((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      if (open && filtered[highlight]) {
        e.preventDefault();
        select(filtered[highlight]);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  return (
    <div className="combo" ref={rootRef}>
      <input
        type="text"
        className="combo__input"
        value={query}
        placeholder={placeholder}
        disabled={disabled}
        aria-label={ariaLabel}
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setHighlight(0);
          if (e.target.value === '') onChange('');
        }}
        onKeyDown={onKeyDown}
      />
      {open && (
        <ul className="combo__list" role="listbox">
          {filtered.length === 0 ? (
            <li className="combo__empty">No matches</li>
          ) : (
            filtered.map((o, i) => (
              <li
                key={o.id}
                role="option"
                aria-selected={o.id === value}
                className={`combo__option${i === highlight ? ' combo__option--active' : ''}${
                  o.id === value ? ' combo__option--selected' : ''
                }`}
                onMouseEnter={() => setHighlight(i)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  select(o);
                }}
              >
                {o.name}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
