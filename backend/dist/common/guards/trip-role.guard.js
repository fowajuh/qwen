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
exports.TripRoleGuard = exports.RequireTripRole = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const prisma_service_1 = require("../../prisma/prisma.service");
const RequireTripRole = (...roles) => (0, common_1.SetMetadata)('tripRoles', roles);
exports.RequireTripRole = RequireTripRole;
/**
 * Enforces the owner/editor/viewer model from §4/§6 on any route with a
 * `:tripId` (or `:id` for the trip itself) param. Editors can write,
 * viewers can only read — checked here once instead of in every service.
 */
let TripRoleGuard = class TripRoleGuard {
    constructor(reflector, prisma) {
        this.reflector = reflector;
        this.prisma = prisma;
    }
    async canActivate(context) {
        const required = this.reflector.get('tripRoles', context.getHandler()) ?? [];
        if (required.length === 0)
            return true;
        const req = context.switchToHttp().getRequest();
        const tripId = req.params.tripId ?? req.params.id;
        const userId = req.user?.id;
        if (!tripId || !userId)
            throw new common_1.ForbiddenException('trip context missing');
        const trip = await this.prisma.trip.findUnique({ where: { id: tripId } });
        if (!trip)
            throw new common_1.ForbiddenException('trip not found');
        if (trip.ownerId === userId)
            return true; // owner always allowed
        const collab = await this.prisma.tripCollaborator.findUnique({
            where: { tripId_userId: { tripId, userId } },
        });
        if (!collab)
            throw new common_1.ForbiddenException('not a collaborator on this trip');
        if (required.includes('editor') && collab.role === 'viewer') {
            throw new common_1.ForbiddenException('viewer role cannot perform this action');
        }
        return true;
    }
};
exports.TripRoleGuard = TripRoleGuard;
exports.TripRoleGuard = TripRoleGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector, prisma_service_1.PrismaService])
], TripRoleGuard);
