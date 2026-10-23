import jwt from 'jsonwebtoken';

// ---------------------------------------------------------------------------
// verifyToken — extracts and validates the Bearer JWT from Authorization header
// Sets req.user = { id, name, email, role } on success
// ---------------------------------------------------------------------------
export function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication token required.' });
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    const message = err.name === 'TokenExpiredError'
      ? 'Session expired. Please log in again.'
      : 'Invalid authentication token.';
    return res.status(401).json({ success: false, message });
  }
}

// ---------------------------------------------------------------------------
// requireRole — role-based access guard, must come after verifyToken
// Usage: router.get('/admin/stats', verifyToken, requireRole('admin'), handler)
// ---------------------------------------------------------------------------
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied. Insufficient permissions.' });
    }
    next();
  };
}
