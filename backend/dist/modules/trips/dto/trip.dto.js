"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListTripsQuery = exports.AddCollaboratorDto = exports.PatchTripDto = exports.CreateTripDto = void 0;
const zod_1 = require("zod");
exports.CreateTripDto = zod_1.z.object({
    name: zod_1.z.string().min(1).max(120),
    subtitle: zod_1.z.string().max(160).nullable().optional(),
    coverPhotoUrl: zod_1.z.string().url().nullable().optional(),
    originCode: zod_1.z.string().max(8).nullable().optional(),
    destinationCode: zod_1.z.string().max(8).nullable().optional(),
    startDate: zod_1.z.string().datetime(),
    endDate: zod_1.z.string().datetime(),
    budgetPlanned: zod_1.z.number().nonnegative().default(0),
});
exports.PatchTripDto = exports.CreateTripDto.partial().extend({
    status: zod_1.z.enum(['draft', 'upcoming', 'active', 'past']).optional(),
});
exports.AddCollaboratorDto = zod_1.z.object({
    email: zod_1.z.string().email(),
    role: zod_1.z.enum(['editor', 'viewer']),
});
exports.ListTripsQuery = zod_1.z.object({
    cursor: zod_1.z.string().uuid().optional(),
    limit: zod_1.z.coerce.number().int().min(1).max(50).default(20),
});
