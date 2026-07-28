import { type ReactNode } from 'react';

type DeviceMode = 'desktop' | 'tablet' | 'mobile';

interface BlockWrapperProps {
  id: string;
  isSelected: boolean;
  isEditing: boolean;
  onSelect: (id: string) => void;
  onDragHandle?: boolean;
  children: ReactNode;
  device?: DeviceMode;
}

const deviceWidths: Record<DeviceMode, string> = {
  desktop: 'w-full',
  tablet: 'w-[768px] mx-auto',
  mobile: 'w-[375px] mx-auto',
};

export function BlockWrapper({ id, isSelected, isEditing, onSelect, children, device = 'desktop' }: BlockWrapperProps) {
  return (
    <div
      onClick={() => onSelect(id)}
      className={`group relative transition-all duration-200 ${
        isEditing ? 'cursor-pointer' : ''
      } ${deviceWidths[device]}`}
    >
      {isEditing && (
        <div
          className={`pointer-events-none absolute inset-0 z-10 rounded-lg border-2 transition-all duration-150 ${
            isSelected
              ? 'border-blue-500 bg-blue-500/5 shadow-[0_0_0_1px_rgba(59,130,246,0.3)]'
              : 'border-transparent group-hover:border-blue-300/50 group-hover:bg-blue-50/30'
          }`}
        />
      )}
      <div className={`relative ${isSelected && isEditing ? 'ring-2 ring-blue-500 rounded-lg' : ''}`}>
        {children}
      </div>
      {isSelected && isEditing && (
        <div className="absolute -top-3 left-3 z-20 flex items-center gap-1 rounded-md bg-blue-600 px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm">
          <span>{id.slice(0, 12)}</span>
        </div>
      )}
    </div>
  );
}
