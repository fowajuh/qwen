"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateProfileDto = void 0;
const zod_1 = require("zod");
exports.UpdateProfileDto = zod_1.z.object({
    name: zod_1.z.string().min(1).max(80).optional(),
    avatarUrl: zod_1.z.string().url().nullable().optional(),
    travelStyle: zod_1.z.enum(['shoestring', 'comfort', 'luxury']).optional(),
    homeCurrency: zod_1.z.string().length(3).optional(),
});
