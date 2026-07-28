import { useRef, useState, useEffect, useCallback } from 'react';

interface EditableTextProps {
  value: string;
  onChange?: (value: string) => void;
  isEditing?: boolean;
  className?: string;
  tag?: 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p';
  style?: React.CSSProperties;
  placeholder?: string;
}

export function EditableText({
  value,
  onChange,
  isEditing,
  className = '',
  tag: Tag = 'span',
  style,
  placeholder,
}: EditableTextProps) {
  const [active, setActive] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!active && ref.current && ref.current.textContent !== value) {
      ref.current.textContent = value;
    }
  }, [value, active]);

  useEffect(() => {
    if (!isEditing) setActive(false);
  }, [isEditing]);

  const finish = useCallback(() => {
    const text = ref.current?.textContent || '';
    if (text !== value) onChange?.(text);
    setActive(false);
  }, [value, onChange]);

  if (!isEditing) {
    return <Tag className={className} style={style}>{value || placeholder}</Tag>;
  }

  if (active) {
    return (
      <Tag
        ref={ref as any}
        className={className}
        style={style}
        contentEditable
        suppressContentEditableWarning
        onBlur={finish}
        onKeyDown={(e) => {
          if (e.key === 'Enter') { e.preventDefault(); finish(); }
          if (e.key === 'Escape') {
            if (ref.current) ref.current.textContent = value;
            finish();
          }
        }}
        dangerouslySetInnerHTML={{ __html: value }}
      />
    );
  }

  return (
    <Tag
      ref={ref as any}
      className={`${className} cursor-text rounded-sm -mx-0.5 px-0.5 hover:bg-blue-50 hover:ring-1 hover:ring-blue-200/50 transition-all`}
      style={style}
      onClick={(e) => {
        e.stopPropagation();
        setActive(true);
        requestAnimationFrame(() => ref.current?.focus());
      }}
    >
      {value || placeholder}
    </Tag>
  );
}
