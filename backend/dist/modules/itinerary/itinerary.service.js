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
exports.ItineraryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
/**
 * Owns `stops` + `comments`. Split out of TripsService deliberately (§5:
 * "Itinerary Service — trips, stops, collaborators, comments") — both
 * classes together are the whole future Itinerary Service, unchanged.
 */
let ItineraryService = class ItineraryService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    /** Editors/owner only. Viewers get ForbiddenException — checked here since
     * stop routes are addressed by stopId, not tripId, so TripRoleGuard can't
     * resolve the trip on its own. */
    async assertCanEdit(tripId, userId) {
        const trip = await this.prisma.trip.findUnique({ where: { id: tripId } });
        if (!trip)
            throw new common_1.NotFoundException('trip not found');
        if (trip.ownerId === userId)
            return;
        const collab = await this.prisma.tripCollaborator.findUnique({
            where: { tripId_userId: { tripId, userId } },
        });
        if (!collab || collab.role === 'viewer') {
            throw new common_1.ForbiddenException('editor access required');
        }
    }
    async stopWithTrip(stopId) {
        const stop = await this.prisma.stop.findUnique({ where: { id: stopId } });
        if (!stop)
            throw new common_1.NotFoundException('stop not found');
        return stop;
    }
    async createStop(tripId, userId, dto) {
        await this.assertCanEdit(tripId, userId);
        return this.prisma.stop.create({
            data: {
                tripId,
                dayIndex: dto.dayIndex,
                orderIndex: dto.orderIndex,
                name: dto.name,
                category: dto.category,
                city: dto.city ?? null,
                country: dto.country ?? null,
                booked: dto.booked,
                lat: dto.lat ?? null,
                lng: dto.lng ?? null,
                startTime: dto.startTime ? new Date(dto.startTime) : null,
                endTime: dto.endTime ? new Date(dto.endTime) : null,
                cost: dto.cost,
                currency: dto.currency,
                notes: dto.notes ?? null,
            },
        });
    }
    async patchStop(stopId, userId, dto) {
        const stop = await this.stopWithTrip(stopId);
        await this.assertCanEdit(stop.tripId, userId);
        const data = { ...dto };
        if (dto.startTime !== undefined)
            data.startTime = dto.startTime ? new Date(dto.startTime) : null;
        if (dto.endTime !== undefined)
            data.endTime = dto.endTime ? new Date(dto.endTime) : null;
        return this.prisma.stop.update({ where: { id: stopId }, data });
    }
    async deleteStop(stopId, userId) {
        const stop = await this.stopWithTrip(stopId);
        await this.assertCanEdit(stop.tripId, userId);
        await this.prisma.stop.delete({ where: { id: stopId } });
        return { ok: true };
    }
    /** Atomic drag-to-reorder write — a transaction so the manifest strip
     * never renders a half-reordered day mid-drag (§3.3). */
    async reorder(stopId, userId, dto) {
        const stop = await this.stopWithTrip(stopId);
        await this.assertCanEdit(stop.tripId, userId);
        await this.prisma.$transaction(dto.order.map((o) => this.prisma.stop.update({ where: { id: o.id }, data: { orderIndex: o.orderIndex } })));
        return { ok: true };
    }
    async listComments(stopId) {
        await this.stopWithTrip(stopId);
        return this.prisma.comment.findMany({
            where: { stopId },
            orderBy: { createdAt: 'asc' },
            include: { user: { select: { id: true, name: true, avatarUrl: true } } },
        });
    }
    async addComment(stopId, userId, dto) {
        const stop = await this.stopWithTrip(stopId);
        // any collaborator (including viewers) can comment — only edits are gated
        const trip = await this.prisma.trip.findUnique({ where: { id: stop.tripId } });
        if (!trip)
            throw new common_1.NotFoundException('trip not found');
        const isMember = trip.ownerId === userId ||
            (await this.prisma.tripCollaborator.findUnique({ where: { tripId_userId: { tripId: stop.tripId, userId } } }));
        if (!isMember)
            throw new common_1.ForbiddenException('not a member of this trip');
        return this.prisma.comment.create({
            data: { stopId, userId, body: dto.body },
            include: { user: { select: { id: true, name: true, avatarUrl: true } } },
        });
    }
};
exports.ItineraryService = ItineraryService;
exports.ItineraryService = ItineraryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ItineraryService);
