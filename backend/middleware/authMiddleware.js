/**
 * middleware/authMiddleware.js — JWT verification
 *
 * Verifies JWT from Authorization: Bearer <token> header.
 * Admin middleware additionally checks the admin role flag.
 */
'use strict';
const jwt    = require('jsonwebtoken');
const logger = require('../utils/logger');

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Not authenticated. Token missing.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, email, roles, iat, exp }
    next();
  } catch (err) {
    logger.warn(`[AUTH] Invalid token attempt: ${err.message} from IP ${req.ip}`);
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

/**
 * Admin gate — verifies PIN from X-Admin-Pin header against env var
 */
const adminGate = (req, res, next) => {
  const pin = req.headers['x-admin-pin'];
  if (!pin || pin !== process.env.ADMIN_PIN) {
    logger.warn(`[ADMIN] Unauthorized admin access attempt from IP ${req.ip}`);
    return res.status(403).json({ error: 'Admin access denied.' });
  }
  next();
};

/**
 * Role check — ensures authenticated user has one of the required roles
 */
const requireRole = (...roles) => (req, res, next) => {
  const userRoles = req.user?.roles || [];
  if (!roles.some(r => userRoles.includes(r))) {
    return res.status(403).json({ error: `Access requires one of: ${roles.join(', ')}` });
  }
  next();
};

module.exports = { protect, adminGate, requireRole };
