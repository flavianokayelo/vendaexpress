import { type ReactNode, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import { modal } from '../../lib/animations';

export function Modal({
  open,
  onClose,
  title,
  children,
  size = 'md',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const width = size === 'sm' ? 'max-w-md' : size === 'lg' ? 'max-w-3xl' : 'max-w-xl';

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            variants={modal}
            initial="initial"
            animate="animate"
            exit="exit"
            className={`relative w-full ${width} max-h-[90vh] overflow-y-auto bg-paper shadow-xl`}
            style={{ borderRadius: '2px' }}
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-[15px]">
              <h2 className="font-heading text-[17px] font-bold text-ink">{title}</h2>
              <button onClick={onClose} className="flex h-7 w-7 items-center justify-center text-ink-2 hover:bg-black/5 hover:text-ink transition-colors" style={{ borderRadius: '2px' }}>
                <X size={18} />
              </button>
            </div>
            <div className="px-5 py-[18px]">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}