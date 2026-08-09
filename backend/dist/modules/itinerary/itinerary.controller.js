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
exports.ItineraryController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const itinerary_service_1 = require("./itinerary.service");
const stop_dto_1 = require("./dto/stop.dto");
let ItineraryController = class ItineraryController {
    constructor(itinerary) {
        this.itinerary = itinerary;
    }
    createStop(tripId, user, body) {
        const parsed = stop_dto_1.CreateStopDto.safeParse(body);
        if (!parsed.success)
            throw new common_1.UnauthorizedException(parsed.error.issues);
        return this.itinerary.createStop(tripId, user.id, parsed.data);
    }
    patchStop(id, user, body) {
        const parsed = stop_dto_1.PatchStopDto.safeParse(body);
        if (!parsed.success)
            throw new common_1.UnauthorizedException(parsed.error.issues);
        return this.itinerary.patchStop(id, user.id, parsed.data);
    }
    deleteStop(id, user) {
        return this.itinerary.deleteStop(id, user.id);
    }
    reorder(id, user, body) {
        const parsed = stop_dto_1.ReorderStopsDto.safeParse(body);
        if (!parsed.success)
            throw new common_1.UnauthorizedException(parsed.error.issues);
        return this.itinerary.reorder(id, user.id, parsed.data);
    }
    listComments(id) {
        return this.itinerary.listComments(id);
    }
    addComment(id, user, body) {
        const parsed = stop_dto_1.CreateCommentDto.safeParse(body);
        if (!parsed.success)
            throw new common_1.UnauthorizedException(parsed.error.issues);
        return this.itinerary.addComment(id, user.id, parsed.data);
    }
};
exports.ItineraryController = ItineraryController;
__decorate([
    (0, common_1.Post)('trips/:tripId/stops'),
    __param(0, (0, common_1.Param)('tripId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], ItineraryController.prototype, "createStop", null);
__decorate([
    (0, common_1.Patch)('stops/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], ItineraryController.prototype, "patchStop", null);
__decorate([
    (0, common_1.Delete)('stops/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ItineraryController.prototype, "deleteStop", null);
__decorate([
    (0, common_1.Patch)('stops/:id/reorder'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], ItineraryController.prototype, "reorder", null);
__decorate([
    (0, common_1.Get)('stops/:id/comments'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ItineraryController.prototype, "listComments", null);
__decorate([
    (0, common_1.Post)('stops/:id/comments'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], ItineraryController.prototype, "addComment", null);
exports.ItineraryController = ItineraryController = __decorate([
    (0, common_1.Controller)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [itinerary_service_1.ItineraryService])
], ItineraryController);
