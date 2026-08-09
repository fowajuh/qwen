"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const trips_module_1 = require("./modules/trips/trips.module");
const itinerary_module_1 = require("./modules/itinerary/itinerary.module");
const recommendations_module_1 = require("./modules/recommendations/recommendations.module");
const budget_module_1 = require("./modules/budget/budget.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
const realtime_module_1 = require("./modules/realtime/realtime.module");
const prisma_module_1 = require("./prisma/prisma.module");
const health_controller_1 = require("./common/health/health.controller");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            trips_module_1.TripsModule,
            itinerary_module_1.ItineraryModule,
            recommendations_module_1.RecommendationsModule,
            budget_module_1.BudgetModule,
            notifications_module_1.NotificationsModule,
            realtime_module_1.RealtimeModule,
        ],
        controllers: [health_controller_1.HealthController],
    })
], AppModule);
