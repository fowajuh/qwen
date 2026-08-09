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
exports.TripsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const trip_role_guard_1 = require("../../common/guards/trip-role.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const trips_service_1 = require("./trips.service");
const trip_dto_1 = require("./dto/trip.dto");
let TripsController = class TripsController {
    constructor(trips) {
        this.trips = trips;
    }
    list(user, query) {
        const parsed = trip_dto_1.ListTripsQuery.safeParse(query);
        if (!parsed.success)
            throw new common_1.UnauthorizedException(parsed.error.issues);
        return this.trips.list(user.id, parsed.data);
    }
    create(user, body) {
        const parsed = trip_dto_1.CreateTripDto.safeParse(body);
        if (!parsed.success)
            throw new common_1.UnauthorizedException(parsed.error.issues);
        return this.trips.create(user.id, parsed.data);
    }
    get(id) {
        return this.trips.getById(id);
    }
    update(id, body) {
        const parsed = trip_dto_1.PatchTripDto.safeParse(body);
        if (!parsed.success)
            throw new common_1.UnauthorizedException(parsed.error.issues);
        return this.trips.update(id, parsed.data);
    }
    remove(id, user) {
        return this.trips.remove(id, user.id);
    }
    duplicate(id, user) {
        return this.trips.duplicate(id, user.id);
    }
    addCollaborator(id, body) {
        const parsed = trip_dto_1.AddCollaboratorDto.safeParse(body);
        if (!parsed.success)
            throw new common_1.UnauthorizedException(parsed.error.issues);
        return this.trips.addCollaborator(id, parsed.data);
    }
};
exports.TripsController = TripsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], TripsController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], TripsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, trip_role_guard_1.RequireTripRole)('viewer'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TripsController.prototype, "get", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, trip_role_guard_1.RequireTripRole)('editor'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TripsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TripsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/duplicate'),
    (0, trip_role_guard_1.RequireTripRole)('viewer'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TripsController.prototype, "duplicate", null);
__decorate([
    (0, common_1.Post)(':id/collaborators'),
    (0, trip_role_guard_1.RequireTripRole)('editor'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TripsController.prototype, "addCollaborator", null);
exports.TripsController = TripsController = __decorate([
    (0, common_1.Controller)('trips'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, trip_role_guard_1.TripRoleGuard),
    __metadata("design:paramtypes", [trips_service_1.TripsService])
], TripsController);
