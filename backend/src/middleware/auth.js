const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be set in the environment and be at least 32 characters long.');
}

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    // 401 (not 403) so the frontend interceptor clears the session and redirects to /login
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Requires one of [${roles.join(', ')}] permissions.`,
      });
    }
    next();
  };
};

// Permission-based check so custom roles (HOD, EXAM_CONTROLLER, ...) work.
// ADMIN always passes. Permissions come from the JWT (refreshed on next login).
const requirePermission = (...permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated.' });
    }
    if (req.user.role === 'ADMIN') return next();

    const granted = req.user.permissions || [];
    if (!permissions.some((p) => granted.includes(p))) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Requires one of [${permissions.join(', ')}] permissions.`,
      });
    }
    next();
  };
};

module.exports = {
  authenticateToken,
  authorizeRoles,
  requirePermission,
};