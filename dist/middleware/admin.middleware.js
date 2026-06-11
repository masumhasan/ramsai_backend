"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireSuperAdmin = exports.requireAdmin = void 0;
const requireAdmin = (req, res, next) => {
    const role = req.userRole;
    if (role !== 'admin' && role !== 'superadmin') {
        return res.status(403).json({ error: 'Access denied: admin privileges required' });
    }
    next();
};
exports.requireAdmin = requireAdmin;
const requireSuperAdmin = (req, res, next) => {
    if (req.userRole !== 'superadmin') {
        return res.status(403).json({ error: 'Access denied: superadmin privileges required' });
    }
    next();
};
exports.requireSuperAdmin = requireSuperAdmin;
