const API_BASE = import.meta.env.VITE_API_URL || '/api';

export async function apiFetch(path, opts = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(opts.headers || {})
  };

  const res = await fetch(API_BASE + '/' + path, {
    credentials: 'include',
    headers,
    ...opts,
  });

  if(!res.ok) {
    let errorMessage = 'Request failed';
    try {
      const payload = await res.json();
      errorMessage = payload.error || payload.message || errorMessage;
    } catch {
      errorMessage = await res.text();
    }
    throw new Error(errorMessage);
  }
  return res.json();
}
