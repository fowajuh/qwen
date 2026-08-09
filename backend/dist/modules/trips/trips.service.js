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
exports.TripsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
/**
 * Owns `trips` + `trip_collaborators` exclusively (§5 Stage 2: this becomes
 * half of the Itinerary Service, the other half is StopsService below).
 */
let TripsService = class TripsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    /** Cursor-paginated from day one per §7, so it never needs to change shape in Stage 3. */
    async list(userId, query) {
        const rows = await this.prisma.trip.findMany({
            where: { OR: [{ ownerId: userId }, { collaborators: { some: { userId } } }] },
            orderBy: { startDate: 'desc' },
            take: query.limit + 1,
            ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
        });
        const hasMore = rows.length > query.limit;
        const items = hasMore ? rows.slice(0, -1) : rows;
        return { items, nextCursor: hasMore ? items[items.length - 1].id : null };
    }
    async create(userId, dto) {
        return this.prisma.trip.create({
            data: {
                ownerId: userId,
                name: dto.name,
                subtitle: dto.subtitle ?? null,
                coverPhotoUrl: dto.coverPhotoUrl ?? null,
                originCode: dto.originCode ?? null,
                destinationCode: dto.destinationCode ?? null,
                startDate: new Date(dto.startDate),
                endDate: new Date(dto.endDate),
                budgetPlanned: dto.budgetPlanned,
            },
        });
    }
    async getById(tripId) {
        const trip = await this.prisma.trip.findUnique({
            where: { id: tripId },
            include: {
                stops: { orderBy: [{ dayIndex: 'asc' }, { orderIndex: 'asc' }] },
                collaborators: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } },
            },
        });
        if (!trip)
            throw new common_1.NotFoundException('trip not found');
        return trip;
    }
    async update(tripId, dto) {
        const data = { ...dto };
        if (dto.startDate)
            data.startDate = new Date(dto.startDate);
        if (dto.endDate)
            data.endDate = new Date(dto.endDate);
        return this.prisma.trip.update({ where: { id: tripId }, data });
    }
    async remove(tripId, requesterId) {
        const trip = await this.prisma.trip.findUnique({ where: { id: tripId } });
        if (!trip)
            throw new common_1.NotFoundException('trip not found');
        if (trip.ownerId !== requesterId)
            throw new common_1.ForbiddenException('only the owner can delete a trip');
        await this.prisma.trip.delete({ where: { id: tripId } });
        return { ok: true };
    }
    async duplicate(tripId, requesterId) {
        const original = await this.getById(tripId);
        const copy = await this.prisma.trip.create({
            data: {
                ownerId: requesterId,
                name: `${original.name} (copy)`,
                subtitle: original.subtitle,
                coverPhotoUrl: original.coverPhotoUrl,
                originCode: original.originCode,
                destinationCode: original.destinationCode,
                startDate: original.startDate,
                endDate: original.endDate,
                budgetPlanned: original.budgetPlanned,
                status: 'draft',
                stops: {
                    create: original.stops.map((s) => ({
                        dayIndex: s.dayIndex,
                        orderIndex: s.orderIndex,
                        name: s.name,
                        category: s.category,
                        city: s.city,
                        country: s.country,
                        booked: s.booked,
                        lat: s.lat,
                        lng: s.lng,
                        startTime: s.startTime,
                        endTime: s.endTime,
                        cost: s.cost,
                        currency: s.currency,
                        notes: s.notes,
                    })),
                },
            },
        });
        return copy;
    }
    async addCollaborator(tripId, dto) {
        const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (!user)
            throw new common_1.NotFoundException('no account with that email');
        return this.prisma.tripCollaborator.upsert({
            where: { tripId_userId: { tripId, userId: user.id } },
            update: { role: dto.role },
            create: { tripId, userId: user.id, role: dto.role },
        });
    }
};
exports.TripsService = TripsService;
exports.TripsService = TripsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TripsService);
