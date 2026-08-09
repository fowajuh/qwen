"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllExceptionsFilter = void 0;
const common_1 = require("@nestjs/common");
/**
 * One JSON error shape for every failure mode, so the frontend's error
 * states (§3, "every screen ships with an error state") never have to
 * special-case a raw stack trace or a bare NestJS default body.
 */
let AllExceptionsFilter = class AllExceptionsFilter {
    constructor() {
        this.logger = new common_1.Logger('ExceptionFilter');
    }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const res = ctx.getResponse();
        const req = ctx.getRequest();
        const isHttp = exception instanceof common_1.HttpException;
        const status = isHttp ? exception.getStatus() : common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        const body = isHttp ? exception.getResponse() : null;
        const message = typeof body === 'string'
            ? body
            : body?.message ?? 'Something went wrong on our end.';
        if (status >= 500) {
            this.logger.error(`${req.method} ${req.url} -> ${status}`, exception?.stack);
        }
        res.status(status).json({
            error: {
                status,
                message: Array.isArray(message) ? message[0] : message,
                details: Array.isArray(message) ? message : undefined,
                path: req.url,
                timestamp: new Date().toISOString(),
            },
        });
    }
};
exports.AllExceptionsFilter = AllExceptionsFilter;
exports.AllExceptionsFilter = AllExceptionsFilter = __decorate([
    (0, common_1.Catch)()
], AllExceptionsFilter);
