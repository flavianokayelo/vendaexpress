import { useEffect, useState } from 'react';

export type Route = {
  path: string;
  params: Record<string, string>;
  query: URLSearchParams;
};

function parseHash(): Route {
  const raw = window.location.hash.replace(/^#/, '') || '/';
  const [path, qs] = raw.split('?');
  return {
    path: path || '/',
    params: {},
    query: new URLSearchParams(qs || ''),
  };
}

export function useHashRoute(): [Route, (to: string) => void] {
  const [route, setRoute] = useState<Route>(parseHash());

  useEffect(() => {
    const onChange = () => setRoute(parseHash());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  const navigate = (to: string) => {
    window.location.hash = to;
  };

  return [route, navigate];
}

export function matchRoute(
  pattern: string,
  path: string
): Record<string, string> | null {
  const pParts = pattern.split('/').filter(Boolean);
  const aParts = path.split('/').filter(Boolean);
  if (pParts.length !== aParts.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < pParts.length; i++) {
    if (pParts[i].startsWith(':')) {
      params[pParts[i].slice(1)] = decodeURIComponent(aParts[i]);
    } else if (pParts[i] !== aParts[i]) {
      return null;
    }
  }
  return params;
}
