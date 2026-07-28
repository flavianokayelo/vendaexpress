import type { ThemeConfig } from '../../storefrontTheme/types';

export function AnnouncementBar({ theme }: { theme: ThemeConfig }) {
  if (!theme.header.showAnnouncementBar || !theme.header.announcementText) return null;

  return (
    <div className="bg-[var(--sf-primary)] px-4 py-1.5 text-center text-xs font-medium text-white">
      {theme.header.announcementText}
    </div>
  );
}
