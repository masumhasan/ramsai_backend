"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminUsersRoleController = void 0;
const user_model_1 = __importDefault(require("../../models/user.model"));
const VALID_ROLES = ['superadmin', 'admin', 'user'];
class AdminUsersRoleController {
    static async updateRole(req, res) {
        try {
            const { id } = req.params;
            const { role } = req.body;
            if (!role || !VALID_ROLES.includes(role)) {
                return res.status(400).json({ error: `Role must be one of: ${VALID_ROLES.join(', ')}` });
            }
            // Prevent self-role modification
            if (id === req.userId) {
                return res.status(400).json({ error: 'Cannot modify your own role' });
            }
            const target = await user_model_1.default.findById(id).select('role email name').lean();
            if (!target) {
                return res.status(404).json({ error: 'User not found' });
            }
            // Only superadmin can assign or revoke admin/superadmin roles
            const isElevatedRole = (r) => r === 'admin' || r === 'superadmin';
            if ((isElevatedRole(role) || isElevatedRole(target.role)) &&
                req.userRole !== 'superadmin') {
                return res.status(403).json({
                    error: 'Only superadmin can assign or revoke administrative roles',
                });
            }
            const updated = await user_model_1.default.findByIdAndUpdate(id, { role }, { new: true }).select('name email role');
            console.log(`[ADMIN USERS] Role changed: ${target.email} ${target.role} → ${role} by ${req.userId}`);
            return res.json({ message: 'User role updated', user: updated });
        }
        catch (error) {
            console.error('[ADMIN USERS] UpdateRole error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
}
exports.AdminUsersRoleController = AdminUsersRoleController;
