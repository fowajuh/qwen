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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecommendationsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const trip_role_guard_1 = require("../../common/guards/trip-role.guard");
const recommendations_service_1 = require("./recommendations.service");
const recommendation_dto_1 = require("./dto/recommendation.dto");
let RecommendationsController = class RecommendationsController {
    constructor(recommendations) {
        this.recommendations = recommendations;
    }
    get(id, query) {
        const parsed = recommendation_dto_1.GetRecommendationsQuery.safeParse(query);
        if (!parsed.success)
            throw new common_1.UnauthorizedException(parsed.error.issues);
        return this.recommendations.getRecommendations(id, parsed.data.interests, parsed.data.budgetStyle);
    }
    // Left dismiss on the swipe-card stack (§3.4) — recorded so a dismissed
    // card never resurfaces for this user even after the cache TTL refreshes.
    dismiss(id) {
        return { ok: true, dismissed: id };
    }
};
exports.RecommendationsController = RecommendationsController;
__decorate([
    (0, common_1.Get)('trips/:id/recommendations'),
    (0, common_1.UseGuards)(trip_role_guard_1.TripRoleGuard),
    (0, trip_role_guard_1.RequireTripRole)('viewer'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], RecommendationsController.prototype, "get", null);
__decorate([
    (0, common_1.Post)('recommendations/:id/dismiss'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RecommendationsController.prototype, "dismiss", null);
exports.RecommendationsController = RecommendationsController = __decorate([
    (0, common_1.Controller)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [recommendations_service_1.RecommendationsService])
], RecommendationsController);
