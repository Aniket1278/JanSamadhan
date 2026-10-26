// Small fetch wrapper: adds the JWT and throws readable errors
export const getUser = () => JSON.parse(localStorage.getItem('user') || 'null');

export async function api(path, { method = 'GET', body } = {}) {
  const token = localStorage.getItem('token');
  const res = await fetch('/api' + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
    body: body && JSON.stringify(body),
  }).catch(() => null);
  if (!res) throw new Error('Cannot reach the server. Start the backend: cd backend, then npm run dev.');
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || (res.status >= 500
    ? 'The backend is not running or crashed. Look at the backend terminal for the error.'
    : 'Request failed'));
  return data;
}
