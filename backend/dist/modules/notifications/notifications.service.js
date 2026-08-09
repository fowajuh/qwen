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
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
/**
 * Stage 1: synchronous read/write against Postgres. Stage 4: Itinerary
 * Service publishes `trip.updated`/`comment.created` events, this service
 * becomes a queue consumer that fans notifications out from those events
 * instead of being called inline (§5 Stage 4) — the `create()` method
 * signature doesn't need to change for that swap.
 */
let NotificationsService = class NotificationsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list(userId, unreadOnly = false) {
        return this.prisma.notification.findMany({
            where: { userId, ...(unreadOnly ? { readAt: null } : {}) },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
    }
    async markRead(userId, id) {
        return this.prisma.notification.updateMany({
            where: { id, userId },
            data: { readAt: new Date() },
        });
    }
    async create(userId, type, payload) {
        return this.prisma.notification.create({
            data: { userId, type, payloadJson: payload },
        });
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificationsService);
