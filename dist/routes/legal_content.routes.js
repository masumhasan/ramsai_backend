"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const legal_content_controller_1 = require("../controllers/legal_content.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const admin_middleware_1 = require("../middleware/admin.middleware");
const router = (0, express_1.Router)();
// Public route to fetch legal content
router.get('/legal/:type', legal_content_controller_1.getLegalContent);
// Admin route to update legal content
router.put('/admin/legal/:type', auth_middleware_1.authenticate, admin_middleware_1.requireAdmin, legal_content_controller_1.updateLegalContent);
exports.default = router;
