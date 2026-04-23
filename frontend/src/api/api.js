const API_BASE = import.meta.env.VITE_API_URL || '/api';

const buildHeaders = (opts, body) => {
  const token = localStorage.getItem('token');
  const headers = { ...(opts.headers || {}) };
  // Don't force Content-Type on FormData — the browser sets the multipart boundary.
  if (body !== undefined && !(body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
};

const readError = async (res) => {
  const text = await res.text();
  try {
    const parsed = JSON.parse(text);
    const msg =
      parsed.error ||
      (parsed.details && parsed.details.map((d) => d.message).join('; ')) ||
      text ||
      'Request failed';
    const err = new Error(msg);
    err.status = res.status;
    err.details = parsed.details;
    return err;
  } catch {
    const err = new Error(text || 'Request failed');
    err.status = res.status;
    return err;
  }
};

export async function apiFetch(path, opts = {}) {
  const res = await fetch(`${API_BASE}/${path}`, {
    credentials: 'include',
    ...opts,
    headers: buildHeaders(opts, opts.body)
  });
  if (!res.ok) throw await readError(res);
  if (res.status === 204) return null;
  const ct = res.headers.get('content-type') || '';
  return ct.includes('application/json') ? res.json() : res.text();
}

export async function apiUpload(path, file, { field = 'file', extra = {} } = {}) {
  const fd = new FormData();
  fd.append(field, file);
  for (const [k, v] of Object.entries(extra)) fd.append(k, v);
  return apiFetch(path, { method: 'POST', body: fd });
}
