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
      <div className="flex flex-wrap gap-[7px]">
        {COLOR_PALETTE.map((c) => {
          const selected = value === c.name;
          const iconDark = LIGHT_HEXES.has(c.hex);
          return (
            <button
              key={c.name}
              type="button"
              title={c.name}
              onClick={() => onChange(c.name, c.hex)}
              className={`relative h-8 w-8 border transition-all hover:scale-110 ${
                selected ? 'ring-1 ring-ink ring-offset-1 ring-offset-paper' : ''
              }`}
              style={{ backgroundColor: c.hex, borderColor: c.hex === '#FFFFFF' ? '#e3e1d7' : c.hex, borderRadius: '2px' }}
            >
              {selected && (
                <Check size={14} className="absolute inset-0 m-auto" style={{ color: iconDark ? '#15150e' : '#fff' }} />
              )}
            </button>
          );
        })}

        <label
          title="Cor personalizada"
          className="relative flex h-8 w-8 cursor-pointer items-center justify-center border border-dashed border-border-2 bg-paper font-mono text-sm text-ink-2 hover:border-ink hover:text-ink"
          style={{ borderRadius: '2px' }}
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
        <div className="mt-2 flex items-center gap-2 font-mono text-[11px] text-ink-2">
          <span className="h-3 w-3 border border-border" style={{ backgroundColor: valueHex || '#ccc', borderRadius: '2px' }} />
          {value}
          <button type="button" onClick={() => onChange('', '')} className="ml-1 flex items-center gap-0.5 text-ink-2 hover:text-danger transition-colors">
            <X size={12} /> limpar
          </button>
        </div>
      )}
    </div>
  );
}