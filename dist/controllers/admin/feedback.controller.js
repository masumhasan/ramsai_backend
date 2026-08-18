"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminFeedbackController = void 0;
const feedback_model_1 = __importDefault(require("../../models/feedback.model"));
const user_model_1 = __importDefault(require("../../models/user.model"));
class AdminFeedbackController {
    static async getFeedbacks(req, res) {
        try {
            const { page = '1', limit = '20', search = '', } = req.query;
            const pageNum = Math.max(1, parseInt(page, 10));
            const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
            const skip = (pageNum - 1) * limitNum;
            const filter = {};
            if (search.trim()) {
                const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                // Find users matching name or email
                const matchingUsers = await user_model_1.default.find({
                    $or: [
                        { name: { $regex: escaped, $options: 'i' } },
                        { email: { $regex: escaped, $options: 'i' } },
                    ],
                }).select('_id');
                const userIds = matchingUsers.map((u) => u._id);
                // Match feedback fields or matching user IDs
                filter.$or = [
                    { title: { $regex: escaped, $options: 'i' } },
                    { description: { $regex: escaped, $options: 'i' } },
                    { userId: { $in: userIds } },
                ];
            }
            const [feedbacks, total] = await Promise.all([
                feedback_model_1.default.find(filter)
                    .populate('userId', 'name email role')
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limitNum)
                    .lean(),
                feedback_model_1.default.countDocuments(filter),
            ]);
            return res.json({
                feedbacks,
                pagination: {
                    total,
                    page: pageNum,
                    limit: limitNum,
                    totalPages: Math.ceil(total / limitNum),
                },
            });
        }
        catch (error) {
            console.error('[ADMIN FEEDBACK] Get feedbacks error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
}
exports.AdminFeedbackController = AdminFeedbackController;
