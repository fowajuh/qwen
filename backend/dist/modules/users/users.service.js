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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let UsersService = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async me(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true, email: true, name: true, avatarUrl: true,
                travelStyle: true, homeCurrency: true, createdAt: true,
            },
        });
        if (!user)
            throw new common_1.NotFoundException('user not found');
        return user;
    }
    async updateProfile(userId, dto) {
        return this.prisma.user.update({ where: { id: userId }, data: dto });
    }
    async getSubscription(userId) {
        const subscription = await this.prisma.subscription.findUnique({
            where: { userId },
        });
        // If no subscription exists, default to explorer plan
        if (!subscription) {
            return {
                plan: 'explorer',
                billingCycle: 'monthly',
                status: 'active',
            };
        }
        return subscription;
    }
    async updateSubscription(userId, plan, billingCycle) {
        const now = new Date();
        const periodEnd = new Date(now);
        periodEnd.setMonth(periodEnd.getMonth() + 1);
        return this.prisma.subscription.upsert({
            where: { userId },
            update: {
                plan,
                billingCycle,
                currentPeriodStart: now,
                currentPeriodEnd: periodEnd,
                status: 'active',
            },
            create: {
                userId,
                plan,
                billingCycle,
                currentPeriodStart: now,
                currentPeriodEnd: periodEnd,
                status: 'active',
            },
        });
    }
    async cancelSubscription(userId) {
        return this.prisma.subscription.update({
            where: { userId },
            data: {
                status: 'canceled',
                canceledAt: new Date(),
            },
        });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
