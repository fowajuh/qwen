"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshDto = exports.LoginDto = exports.SignupDto = void 0;
const zod_1 = require("zod");
exports.SignupDto = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8).max(72),
    name: zod_1.z.string().min(1).max(80),
});
exports.LoginDto = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(1),
});
exports.RefreshDto = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1),
});
