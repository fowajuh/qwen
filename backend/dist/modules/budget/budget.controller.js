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
exports.BudgetController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const trip_role_guard_1 = require("../../common/guards/trip-role.guard");
const budget_service_1 = require("./budget.service");
let BudgetController = class BudgetController {
    constructor(budget) {
        this.budget = budget;
    }
    summary(id) {
        return this.budget.summary(id);
    }
};
exports.BudgetController = BudgetController;
__decorate([
    (0, common_1.Get)(':id/budget-summary'),
    (0, trip_role_guard_1.RequireTripRole)('viewer'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BudgetController.prototype, "summary", null);
exports.BudgetController = BudgetController = __decorate([
    (0, common_1.Controller)('trips'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, trip_role_guard_1.TripRoleGuard),
    __metadata("design:paramtypes", [budget_service_1.BudgetService])
], BudgetController);
