import jwt from 'jsonwebtoken';

// Sets req.user from "Authorization: Bearer <token>"
export function auth(req, res, next) {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  try { req.user = jwt.verify(token, process.env.JWT_SECRET); next(); }
  catch { res.status(401).json({ error: 'Please log in.' }); }
}

// Role-based access, e.g. role('official', 'admin')
export const role = (...allowed) => (req, res, next) =>
  allowed.includes(req.user?.role) ? next() : res.status(403).json({ error: 'Not allowed.' });
