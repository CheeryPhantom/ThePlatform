const API_BASE = import.meta.env.VITE_API_URL || '/api';

export async function apiFetch(path, opts = {}) {
  const res = await fetch(API_BASE + '/' + path, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  if(!res.ok) throw new Error(await res.text());
  return res.json();
}
