"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClerkDto = void 0;
const zod_1 = require("zod");
exports.ClerkDto = zod_1.z.object({
    token: zod_1.z.string(),
});
