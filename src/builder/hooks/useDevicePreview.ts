import type { DeviceMode } from '../types/editor';

export function useDevicePreview(device: DeviceMode): { width: string; scale: number; label: string } {
  switch (device) {
    case 'desktop':
      return { width: '100%', scale: 1, label: 'Desktop' };
    case 'tablet':
      return { width: '768px', scale: 0.9, label: 'Tablet' };
    case 'mobile':
      return { width: '375px', scale: 0.85, label: 'Mobile' };
  }
}
