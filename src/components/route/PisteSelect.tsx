import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { DIFFICULTY_META, type Difficulty } from '@/data/skiArea';

export interface PisteOption {
  id: string;
  name: string;
  difficulty: Difficulty;
  disabled?: boolean;
  note?: string;
}

interface PisteSelectProps {
  label: string;
  emptyLabel: string;
  options: PisteOption[];
  value: string;
  onChange: (id: string) => void;
}

function PisteRow({ option }: { option: PisteOption }) {
  const meta = DIFFICULTY_META[option.difficulty];
  return (
    <span className="flex min-w-0 items-center gap-3">
      <span className="h-3 w-3 shrink-0 rounded-full ring-1 ring-black/10" style={{ backgroundColor: meta.color }} aria-hidden="true" />
      <span className="sr-only">{meta.colourWord} pálya</span>
      <span className="w-10 shrink-0 font-mono text-sm font-bold text-slate-900">{option.id}</span>
      <span className="min-w-0 truncate text-sm text-slate-900">
        {option.name}
        {option.note ? <span className="ml-1 text-slate-600">{option.note}</span> : null}
      </span>
    </span>
  );
}

export default function PisteSelect({ label, emptyLabel, options, value, onChange }: PisteSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const selected = options.find((option) => option.id === value);
  const search = query.trim().toLowerCase();
  const visible = search
    ? options.filter((option) => option.id.toLowerCase().includes(search) || option.name.toLowerCase().includes(search))
    : options;

  const choose = (id: string) => {
    onChange(id);
    setOpen(false);
    setQuery('');
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className="flex min-h-12 items-center justify-between gap-3 rounded-xl border border-slate-300 bg-white px-4 py-2 text-left transition hover:border-slate-400 focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-600/20"
      >
        {selected ? <PisteRow option={selected} /> : <span className="text-sm text-slate-600">{emptyLabel}</span>}
        <ChevronDown className={`h-4 w-4 shrink-0 text-slate-700 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>

      {open && (
        <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg shadow-slate-900/5">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Keresés szám vagy név szerint"
            aria-label={`${label} keresése`}
            className="h-11 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-sky-600 focus:bg-white focus:ring-2 focus:ring-sky-600/20"
          />
          <ul role="listbox" aria-label={label} className="flex max-h-72 flex-col gap-1 overflow-y-auto overscroll-contain">
            {visible.map((option) => {
              const isSelected = option.id === value;
              return (
                <li key={option.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    disabled={option.disabled}
                    onClick={() => choose(option.id)}
                    className={`flex w-full min-h-11 items-center rounded-xl px-3 py-2 text-left transition duration-150 ${
                      isSelected ? 'bg-sky-50 ring-1 ring-sky-600' : 'hover:bg-slate-100'
                    } disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent`}
                  >
                    <PisteRow option={option} />
                  </button>
                </li>
              );
            })}
            {visible.length === 0 && <li className="px-3 py-2 text-sm text-slate-600">Nincs találat.</li>}
          </ul>
        </div>
      )}
    </div>
  );
}
