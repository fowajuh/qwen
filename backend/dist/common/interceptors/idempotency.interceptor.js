"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var IdempotencyInterceptor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdempotencyInterceptor = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
/**
 * Honors the `Idempotency-Key` header on mutating endpoints (§7). Stage 1:
 * process-local Map. Stage 4: swap `store` for a Redis-backed one so retries
 * are safe across multiple backend replicas — the interceptor contract
 * (get/set by key) doesn't change, only where it's stored.
 */
let IdempotencyInterceptor = IdempotencyInterceptor_1 = class IdempotencyInterceptor {
    intercept(context, next) {
        const req = context.switchToHttp().getRequest();
        const res = context.switchToHttp().getResponse();
        const method = req.method;
        if (!['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) {
            return next.handle();
        }
        const key = req.headers['idempotency-key'];
        if (!key)
            return next.handle();
        const cacheKey = `${req.user?.id ?? 'anon'}:${req.method}:${req.originalUrl}:${key}`;
        const cached = IdempotencyInterceptor_1.store.get(cacheKey);
        if (cached && cached.expiresAt > Date.now()) {
            res.status(cached.status);
            return (0, rxjs_1.of)(cached.body);
        }
        return next.handle().pipe((0, operators_1.tap)((body) => {
            IdempotencyInterceptor_1.store.set(cacheKey, {
                body,
                status: res.statusCode ?? 200,
                expiresAt: Date.now() + IdempotencyInterceptor_1.TTL_MS,
            });
        }));
    }
};
exports.IdempotencyInterceptor = IdempotencyInterceptor;
IdempotencyInterceptor.store = new Map();
IdempotencyInterceptor.TTL_MS = 24 * 60 * 60 * 1000;
exports.IdempotencyInterceptor = IdempotencyInterceptor = IdempotencyInterceptor_1 = __decorate([
    (0, common_1.Injectable)()
], IdempotencyInterceptor);
