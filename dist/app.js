"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const ai_routes_1 = __importDefault(require("./routes/ai.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const log_routes_1 = __importDefault(require("./routes/log.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const subscription_routes_1 = __importDefault(require("./routes/subscription.routes"));
const legal_content_routes_1 = __importDefault(require("./routes/legal_content.routes"));
const app = (0, express_1.default)();
// Security & Logging
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: false,
    crossOriginEmbedderPolicy: false,
}));
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)('dev'));
// Body Parser for JSON (Limited for security)
app.use(express_1.default.json({ limit: '10mb' }));
// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'UP', timestamp: new Date().toISOString() });
});
// API Routes
app.use('/api/ai', ai_routes_1.default);
app.use('/api/auth', auth_routes_1.default);
app.use('/api/user', user_routes_1.default);
app.use('/api/logs', log_routes_1.default);
app.use('/api/admin', admin_routes_1.default);
app.use('/api/subscription', subscription_routes_1.default);
app.use('/api', legal_content_routes_1.default);
// Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong on the server!' });
});
exports.default = app;
