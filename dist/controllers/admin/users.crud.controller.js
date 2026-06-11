"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminUsersCrudController = void 0;
const user_model_1 = __importDefault(require("../../models/user.model"));
const SAFE_USER_FIELDS = 'name email role createdAt lastActiveAt subscriptionStatus hasCompletedOnboarding age gender';
// Fields that admins may update (excludes password, role - role has its own endpoint)
const ALLOWED_UPDATE_FIELDS = [
    'name', 'age', 'gender', 'valueType', 'height', 'entryWeight',
    'currentWeight', 'targetWeight', 'goal', 'activityLevel', 'timezone',
    'weekStart', 'dietaryPreference', 'language', 'hasCompletedOnboarding',
    'subscriptionStatus',
];
class AdminUsersCrudController {
    static async getUser(req, res) {
        try {
            const { id } = req.params;
            const user = await user_model_1.default.findById(id).select(SAFE_USER_FIELDS).lean();
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            return res.json({ user });
        }
        catch (error) {
            console.error('[ADMIN USERS] GetUser error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
    static async updateUser(req, res) {
        try {
            const { id } = req.params;
            // Build update object from only allowed fields
            const updates = {};
            for (const field of ALLOWED_UPDATE_FIELDS) {
                if (req.body[field] !== undefined) {
                    updates[field] = req.body[field];
                }
            }
            // Admins can update email, but superadmin only
            if (req.userRole === 'superadmin' && req.body.email !== undefined) {
                const emailInUse = await user_model_1.default.findOne({ email: req.body.email, _id: { $ne: id } }).lean();
                if (emailInUse) {
                    return res.status(400).json({ error: 'Email already in use' });
                }
                updates.email = req.body.email;
            }
            if (Object.keys(updates).length === 0) {
                return res.status(400).json({ error: 'No valid fields provided for update' });
            }
            const user = await user_model_1.default.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true }).select(SAFE_USER_FIELDS);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            console.log(`[ADMIN USERS] User ${id} updated by admin ${req.userId}`);
            return res.json({ message: 'User updated successfully', user });
        }
        catch (error) {
            console.error('[ADMIN USERS] UpdateUser error:', error);
            return res.status(500).json({ error: error.message || 'Internal server error' });
        }
    }
    static async deleteUser(req, res) {
        try {
            const { id } = req.params;
            // Prevent self-deletion
            if (id === req.userId) {
                return res.status(400).json({ error: 'Cannot delete your own account' });
            }
            const target = await user_model_1.default.findById(id).select('role email name').lean();
            if (!target) {
                return res.status(404).json({ error: 'User not found' });
            }
            // Only superadmin can delete other admins
            if ((target.role === 'admin' || target.role === 'superadmin') && req.userRole !== 'superadmin') {
                return res.status(403).json({ error: 'Only superadmin can delete admin accounts' });
            }
            await user_model_1.default.findByIdAndDelete(id);
            console.log(`[ADMIN USERS] User deleted: ${target.email} (${target.role}) by admin ${req.userId}`);
            return res.json({ message: 'User deleted successfully' });
        }
        catch (error) {
            console.error('[ADMIN USERS] DeleteUser error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
}
exports.AdminUsersCrudController = AdminUsersCrudController;
