import { useEffect, useState } from 'react';
import { MessageCircle, Share2, UserPlus, UserCheck, Package, Layers, CalendarDays } from 'lucide-react';
import { resolveMediaUrl } from '../../lib/api';
import type { Store } from '../../lib/types';

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
    <section className="mx-auto w-full max-w-[1240px] border-b border-[var(--sf-line)] px-2 py-3 sm:px-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          {store.logo_url ? (
            <img
              src={resolveMediaUrl(store.logo_url) ?? ''}
              alt={store.name}
              className="h-12 w-12 flex-shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[var(--sf-primary)] text-lg font-semibold text-white">
              {store.name[0]}
            </div>
          )}
          <div className="min-w-0">
            <h1 className="truncate text-[15px] font-semibold text-[var(--sf-ink)]">{store.name}</h1>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-[var(--sf-ink-secondary)]">
              <span className="flex items-center gap-1">
                <Package size={11} strokeWidth={1.8} /> {productCount} produtos
              </span>
              {categoryCount > 0 && (
                <span className="flex items-center gap-1">
                  <Layers size={11} strokeWidth={1.8} /> {categoryCount} categorias
                </span>
              )}
              <span className="flex items-center gap-1">
                <CalendarDays size={11} strokeWidth={1.8} /> Desde {joinedYear}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={toggleFollow}
            className={`inline-flex h-8 items-center gap-1 rounded-[var(--sf-radius-sm)] px-3 text-[12px] font-semibold transition-colors ${
              following
                ? 'border border-[var(--sf-line)] text-[var(--sf-ink-secondary)]'
                : 'bg-[var(--sf-primary)] text-white hover:bg-[var(--sf-primary-hover)]'
            }`}
          >
            {following ? <UserCheck size={13} strokeWidth={2} /> : <UserPlus size={13} strokeWidth={2} />}
            {following ? 'A seguir' : 'Seguir'}
          </button>
          {waDigits && (
            <a
              href={`https://wa.me/${waDigits}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-8 items-center gap-1 rounded-[var(--sf-radius-sm)] border border-[var(--sf-line)] px-3 text-[12px] font-semibold text-[var(--sf-ink)]"
            >
              <MessageCircle size={13} strokeWidth={2} />
              Conversar
            </a>
          )}
          <button
            type="button"
            onClick={share}
            title="Partilhar loja"
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[var(--sf-radius-sm)] border border-[var(--sf-line)] text-[var(--sf-ink)]"
          >
            <Share2 size={13} strokeWidth={2} />
          </button>
        </div>
      </div>
    </section>
  );
}
