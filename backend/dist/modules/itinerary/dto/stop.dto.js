"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateCommentDto = exports.ReorderStopsDto = exports.PatchStopDto = exports.CreateStopDto = void 0;
const zod_1 = require("zod");
exports.CreateStopDto = zod_1.z.object({
    dayIndex: zod_1.z.number().int().nonnegative(),
    orderIndex: zod_1.z.number().int().nonnegative(),
    name: zod_1.z.string().min(1).max(160),
    category: zod_1.z.enum(['flight', 'stay', 'eat', 'see', 'move']).default('see'),
    city: zod_1.z.string().max(120).nullable().optional(),
    country: zod_1.z.string().max(120).nullable().optional(),
    booked: zod_1.z.boolean().default(false),
    lat: zod_1.z.number().min(-90).max(90).nullable().optional(),
    lng: zod_1.z.number().min(-180).max(180).nullable().optional(),
    startTime: zod_1.z.string().datetime().nullable().optional(),
    endTime: zod_1.z.string().datetime().nullable().optional(),
    cost: zod_1.z.number().nonnegative().default(0),
    currency: zod_1.z.string().length(3).default('USD'),
    notes: zod_1.z.string().max(2000).nullable().optional(),
});
exports.PatchStopDto = exports.CreateStopDto.partial();
exports.ReorderStopsDto = zod_1.z.object({
    // full ordering for one day: [{id, orderIndex}] — sent as one batch so a
    // drag-to-reorder gesture is a single atomic write, never a half state.
    order: zod_1.z.array(zod_1.z.object({ id: zod_1.z.string().uuid(), orderIndex: zod_1.z.number().int().nonnegative() })).min(1),
});
exports.CreateCommentDto = zod_1.z.object({ body: zod_1.z.string().min(1).max(2000) });
