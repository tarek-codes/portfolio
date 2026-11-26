const KEY = 'pf-admin-token';

export const getToken = () => sessionStorage.getItem(KEY) || '';
export const setToken = (t: string) => (t ? sessionStorage.setItem(KEY, t) : sessionStorage.removeItem(KEY));

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) { super(message); this.status = status; }
}

export async function api<T = unknown>(path: string, init: {method?: string; body?: unknown; auth?: boolean} = {}): Promise<T> {
  const headers: Record<string, string> = {};
  if (init.body !== undefined) headers['Content-Type'] = 'application/json';
  if (init.auth !== false && getToken()) headers.Authorization = `Bearer ${getToken()}`;
  let res: Response;
  try {
    res = await fetch(path, {method: init.method || 'GET', headers, body: init.body !== undefined ? JSON.stringify(init.body) : undefined});
  } catch {
    throw new ApiError(0, 'Could not reach the server.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, (data as {error?: string}).error || `Request failed (${res.status}).`);
  return data as T;
}
