"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminUsersListController = void 0;
const user_model_1 = __importDefault(require("../../models/user.model"));
const SAFE_USER_FIELDS = 'name email role createdAt lastActiveAt subscriptionStatus hasCompletedOnboarding age gender isBanned';
class AdminUsersListController {
    static async getUsers(req, res) {
        try {
            const { page = '1', limit = '20', search = '', role, sortBy = 'createdAt', sortOrder = 'desc', } = req.query;
            const pageNum = Math.max(1, parseInt(page, 10));
            const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
            const skip = (pageNum - 1) * limitNum;
            const filter = {};
            if (search.trim()) {
                const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                filter.$or = [
                    { name: { $regex: escaped, $options: 'i' } },
                    { email: { $regex: escaped, $options: 'i' } },
                ];
            }
            if (role && ['superadmin', 'admin', 'user'].includes(role)) {
                filter.role = role;
            }
            const allowedSortFields = ['createdAt', 'lastActiveAt', 'role', 'name'];
            const sortField = allowedSortFields.includes(sortBy)
                ? sortBy
                : 'createdAt';
            const sortDir = sortOrder === 'asc' ? 'asc' : 'desc';
            const [users, total] = await Promise.all([
                user_model_1.default.find(filter)
                    .select(SAFE_USER_FIELDS)
                    .sort({ [sortField]: sortDir === 'asc' ? 1 : -1 })
                    .skip(skip)
                    .limit(limitNum)
                    .lean(),
                user_model_1.default.countDocuments(filter),
            ]);
            return res.json({
                users,
                pagination: {
                    total,
                    page: pageNum,
                    limit: limitNum,
                    totalPages: Math.ceil(total / limitNum),
                },
            });
        }
        catch (error) {
            console.error('[ADMIN USERS] GetUsers error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
}
exports.AdminUsersListController = AdminUsersListController;
