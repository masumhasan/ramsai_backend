"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
class UserController {
    static async getProfile(req, res) {
        try {
            const user = await user_model_1.default.findById(req.userId).select('-password');
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            return res.json(user);
        }
        catch (error) {
            console.error('Get Profile Error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
    static async updateProfile(req, res) {
        try {
            const updates = req.body;
            // Prevent updating password through this route
            delete updates.password;
            delete updates.email;
            const user = await user_model_1.default.findByIdAndUpdate(req.userId, { $set: updates }, { returnDocument: 'after', runValidators: true }).select('-password');
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            if (updates.currentWeight || updates.targetWeight) {
                console.log(`[USER] ⚖️ Weight Update: Current: ${user.currentWeight}, Target: ${user.targetWeight} for user ${req.userId}`);
            }
            else {
                console.log(`[USER] 👤 Profile updated for user ${req.userId}`);
            }
            return res.json({
                message: 'Profile updated successfully',
                user
            });
        }
        catch (error) {
            console.error(`[USER ERROR] Profile update failed: ${error.message}`);
            return res.status(500).json({ error: error.message || 'Internal server error' });
        }
    }
}
exports.UserController = UserController;
