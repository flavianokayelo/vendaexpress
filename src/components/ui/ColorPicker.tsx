import { Check, X } from 'lucide-react';
import { COLOR_PALETTE, LIGHT_HEXES, nearestColorName } from '../../lib/colors';

type Props = {
  value: string;
  valueHex: string;
  onChange: (name: string, hex: string) => void;
};

export function ColorPicker({ value, valueHex, onChange }: Props) {
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {COLOR_PALETTE.map((c) => {
          const selected = value === c.name;
          const iconDark = LIGHT_HEXES.has(c.hex);
          return (
            <button
              key={c.name}
              type="button"
              title={c.name}
              onClick={() => onChange(c.name, c.hex)}
              className={`relative h-8 w-8 rounded-full border transition-transform hover:scale-110 ${
                selected ? 'ring-2 ring-blue-600 ring-offset-2' : ''
              }`}
              style={{ backgroundColor: c.hex, borderColor: c.hex === '#FFFFFF' ? '#e2e8f0' : c.hex }}
            >
              {selected && (
                <Check size={14} className="absolute inset-0 m-auto" style={{ color: iconDark ? '#111827' : '#fff' }} />
              )}
            </button>
          );
        })}

        <label
          title="Cor personalizada"
          className="relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-dashed border-slate-300 bg-white text-sm text-slate-400 hover:border-blue-400 hover:text-blue-600"
        >
          +
          <input
            type="color"
            value={valueHex || '#888888'}
            onChange={(e) => {
              const hex = e.target.value;
              const nearest = nearestColorName(hex);
              onChange(nearest.name, hex);
            }}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
        </label>
      </div>

      {value && (
        <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
          <span className="h-3 w-3 rounded-full border border-slate-200" style={{ backgroundColor: valueHex || '#ccc' }} />
          {value}
          <button type="button" onClick={() => onChange('', '')} className="ml-1 flex items-center gap-0.5 text-slate-400 hover:text-red-500">
            <X size={12} /> limpar
          </button>
        </div>
      )}
    </div>
  );
}