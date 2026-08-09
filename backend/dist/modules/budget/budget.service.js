"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BudgetService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
/**
 * GET /trips/:id/budget-summary (§7). Returns both "by day" and "by
 * category" views in one payload so the frontend's morph between chart
 * modes (§3.5) is a client-side transition, not two round trips.
 */
let BudgetService = class BudgetService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async summary(tripId) {
        const trip = await this.prisma.trip.findUnique({ where: { id: tripId }, include: { stops: true } });
        if (!trip)
            throw new common_1.NotFoundException('trip not found');
        const spent = trip.stops.reduce((sum, s) => sum + Number(s.cost), 0);
        const planned = Number(trip.budgetPlanned);
        const byDay = new Map();
        for (const s of trip.stops)
            byDay.set(s.dayIndex, (byDay.get(s.dayIndex) ?? 0) + Number(s.cost));
        // No dedicated category column in Stage 1 — bucket by the leading word
        // of the stop name as a lightweight proxy until a real `category` field
        // ships; swap this line for a real GROUP BY once that column exists.
        const byCategory = new Map();
        for (const s of trip.stops) {
            const key = s.name.split(' ')[0].toLowerCase();
            byCategory.set(key, (byCategory.get(key) ?? 0) + Number(s.cost));
        }
        return {
            tripId,
            currency: trip.stops[0]?.currency ?? 'USD',
            planned,
            spent,
            remaining: planned - spent,
            overBudget: spent > planned,
            byDay: Array.from(byDay.entries()).map(([dayIndex, total]) => ({ dayIndex, total })),
            byCategory: Array.from(byCategory.entries()).map(([category, total]) => ({ category, total })),
        };
    }
};
exports.BudgetService = BudgetService;
exports.BudgetService = BudgetService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BudgetService);
