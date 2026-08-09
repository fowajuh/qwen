"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const platform_ws_1 = require("@nestjs/platform-ws");
const idempotency_interceptor_1 = require("./common/interceptors/idempotency.interceptor");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
/**
 * Stage 1 entrypoint. Every module below (auth/users/trips/itinerary/
 * recommendations/budget/notifications) owns its own DTOs and service
 * layer and never reaches into another module's repository directly —
 * that boundary is what makes the Stage 2 microservice split a copy/paste
 * of a folder instead of a rewrite.
 */
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useWebSocketAdapter(new platform_ws_1.WsAdapter(app));
    app.setGlobalPrefix('api/v1');
    app.enableCors();
    app.useGlobalFilters(new http_exception_filter_1.AllExceptionsFilter());
    app.useGlobalInterceptors(new idempotency_interceptor_1.IdempotencyInterceptor());
    await app.listen(process.env.PORT ?? 4000);
    // eslint-disable-next-line no-console
    console.log(`GlobeTrotter API on :${process.env.PORT ?? 4000}`);
}
bootstrap();
