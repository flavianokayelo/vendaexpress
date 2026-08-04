import { useEffect, useState } from 'react';
import { MessageCircle, Share2, UserPlus, UserCheck, Package, Layers, CalendarDays } from 'lucide-react';
import { resolveMediaUrl } from '../../lib/api';
import type { Store } from '../../lib/types';
import { useStorefrontTheme } from '../../storefrontTheme/ThemeProvider';
import { themeButton } from './themeButton';

const FOLLOWED_KEY = 've_followed_stores';

function getFollowed(): string[] {
  try {
    return JSON.parse(localStorage.getItem(FOLLOWED_KEY) || '[]');
  } catch {
    return [];
  }
}

/** Cartão de identidade da loja tipo "shop page" da Shopee — avatar, seguir,
 * conversar, partilhar e estatísticas reais (produtos/categorias/antiguidade).
 * "Seguir" é só local (localStorage) por agora; sem contagem de seguidores
 * porque não existe esse conceito no backend ainda — não inventamos números. */

export function ShopProfileBar({
  store,
  productCount,
  categoryCount,
}: {
  store: Store;
  productCount: number;
  categoryCount: number;
}) {
  const [following, setFollowing] = useState(false);
  const { buttons } = useStorefrontTheme();

  useEffect(() => {
    setFollowing(getFollowed().includes(store.id));
  }, [store.id]);

  const toggleFollow = () => {
    const list = getFollowed();
    const next = following ? list.filter((id) => id !== store.id) : [...list, store.id];
    localStorage.setItem(FOLLOWED_KEY, JSON.stringify(next));
    setFollowing(!following);
  };

  const waDigits = store.whatsapp ? store.whatsapp.replace(/\D/g, '') : '';
  const joinedYear = new Date(store.created_at).getFullYear();

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: store.name, url });
      } catch {
        /* utilizador cancelou a partilha */
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      /* clipboard indisponível */
    }
  };

  return (
    <section
      className="relative overflow-hidden border-b border-[var(--sf-line)]"
      style={{ background: 'linear-gradient(180deg, color-mix(in srgb, var(--sf-primary) 5%, transparent), transparent)' }}
    >
      <div className="mx-auto w-full max-w-[1240px] px-2 py-4 sm:px-4">
        <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3.5">
            {store.logo_url ? (
              <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--sf-surface)] p-1.5 shadow-[var(--sf-shadow-md)] ring-1 ring-[var(--sf-line)]">
                <img
                  src={resolveMediaUrl(store.logo_url) ?? ''}
                  alt={store.name}
                  className="h-full w-full object-contain"
                />
              </span>
            ) : (
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-[var(--sf-primary)] text-xl font-bold text-white shadow-[var(--sf-shadow-md)]">
                {store.name[0]}
              </div>
            )}
            <div className="min-w-0">
              <h1 className="truncate font-display text-[17px] font-extrabold tracking-[-0.01em] text-[var(--sf-ink)]">{store.name}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11.5px] text-[var(--sf-ink-secondary)]">
                <span className="inline-flex items-center gap-1">
                  <Package size={12} strokeWidth={1.8} /> {productCount} produtos
                </span>
                {categoryCount > 0 && (
                  <>
                    <span className="h-2.5 w-px bg-[var(--sf-line)]" />
                    <span className="inline-flex items-center gap-1">
                      <Layers size={12} strokeWidth={1.8} /> {categoryCount} categorias
                    </span>
                  </>
                )}
                <span className="h-2.5 w-px bg-[var(--sf-line)]" />
                <span className="inline-flex items-center gap-1">
                  <CalendarDays size={12} strokeWidth={1.8} /> Desde {joinedYear}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={toggleFollow}
              className={`inline-flex h-9 items-center gap-1.5 px-3.5 text-[12.5px] font-semibold transition-[transform,box-shadow,background-color] duration-200 hover:-translate-y-0.5 hover:shadow-[var(--sf-shadow-sm)] active:translate-y-0 ${
                following ? themeButton(buttons, 'secondary') : themeButton(buttons)
              }`}
            >
              {following ? <UserCheck size={14} strokeWidth={2} /> : <UserPlus size={14} strokeWidth={2} />}
              {following ? 'A seguir' : 'Seguir'}
            </button>
            {waDigits && (
              <a
                href={`https://wa.me/${waDigits}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex h-9 items-center gap-1.5 px-3.5 text-[12.5px] font-semibold transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[var(--sf-shadow-sm)] active:translate-y-0 ${themeButton(buttons, 'secondary')}`}
              >
                <MessageCircle size={14} strokeWidth={2} />
                Conversar
              </a>
            )}
            <button
              type="button"
              onClick={share}
              title="Partilhar loja"
              className={`flex h-9 w-9 flex-shrink-0 items-center justify-center transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[var(--sf-shadow-sm)] active:translate-y-0 ${themeButton(buttons, 'secondary')}`}
            >
              <Share2 size={14} strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
