"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetRecommendationsQuery = void 0;
const zod_1 = require("zod");
exports.GetRecommendationsQuery = zod_1.z.object({
    interests: zod_1.z.string().transform((s) => s.split(',').map((i) => i.trim()).filter(Boolean)),
    budgetStyle: zod_1.z.enum(['shoestring', 'comfort', 'luxury']).default('comfort'),
});
