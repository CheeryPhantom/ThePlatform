const API_BASE = import.meta.env.VITE_API_URL || '/api';

export async function apiFetch(path, opts = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(opts.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}/${path}`, {
    credentials: 'include',
    ...opts,
    headers,
  });

  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || 'Request failed');
  }

  return res.json();
}
