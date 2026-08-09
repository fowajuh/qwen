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
exports.RealtimeGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const jwt_1 = require("@nestjs/jwt");
const ws_1 = require("ws");
const itinerary_service_1 = require("../itinerary/itinerary.service");
const prisma_service_1 = require("../../prisma/prisma.service");
/**
 * Presence + live comment/stop updates for a trip (§3.6, §7 `WS /ws/trips/:id`).
 * Stage 1: in-process, single instance. Stage 4: swap the room registry for
 * Redis pub/sub so presence works across multiple gateway instances —
 * nothing above this class needs to change.
 *
 * The access token travels as a query param (`?token=...&tripId=...`)
 * because browser WebSocket clients can't set an Authorization header.
 * Same secret/verification path as JwtAuthGuard, so a token good for REST
 * is good here too.
 */
let RealtimeGateway = class RealtimeGateway {
    constructor(jwt, itinerary, prisma) {
        this.jwt = jwt;
        this.itinerary = itinerary;
        this.prisma = prisma;
        this.presence = new Map(); // tripId -> socketId->user
    }
    async handleConnection(client, req) {
        try {
            const url = new URL(req.url ?? '', 'ws://localhost');
            const token = url.searchParams.get('token');
            const tripId = url.searchParams.get('tripId');
            if (!token || !tripId)
                throw new Error('missing token or tripId');
            const payload = this.jwt.verify(token, { secret: process.env.JWT_ACCESS_SECRET });
            const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
            if (!user)
                throw new Error('unknown user');
            client.userId = user.id;
            client.tripId = tripId;
            client.__socketId = Math.random().toString(36).slice(2);
            if (!this.presence.has(tripId))
                this.presence.set(tripId, new Map());
            this.presence.get(tripId).set(client.__socketId, { userId: user.id, name: user.name });
            this.broadcastPresence(tripId);
        }
        catch {
            client.close(4001, 'unauthorized');
        }
    }
    handleDisconnect(client) {
        if (!client.tripId)
            return;
        const room = this.presence.get(client.tripId);
        room?.delete(client.__socketId);
        this.broadcastPresence(client.tripId);
    }
    async onComment(client, payload) {
        if (!client.userId || !client.tripId)
            return;
        try {
            const saved = await this.itinerary.addComment(payload.stopId, client.userId, { body: payload.body });
            this.broadcastToTrip(client.tripId, { type: 'comment', tripId: client.tripId, stopId: payload.stopId, comment: saved });
        }
        catch (err) {
            client.send(JSON.stringify({ type: 'error', message: err.message }));
        }
    }
    /** Fired by ItineraryService writes (stop create/patch/reorder) so every
     * collaborator's manifest strip stays live without polling. */
    broadcastTripUpdated(tripId) {
        this.broadcastToTrip(tripId, { type: 'trip.updated', tripId });
    }
    broadcastPresence(tripId) {
        const room = this.presence.get(tripId);
        const users = room ? Array.from(room.values()) : [];
        this.broadcastToTrip(tripId, { type: 'presence', tripId, users });
    }
    broadcastToTrip(tripId, message) {
        const payload = JSON.stringify(message);
        this.server.clients.forEach((c) => {
            if (c.tripId === tripId && c.readyState === ws_1.WebSocket.OPEN)
                c.send(payload);
        });
    }
};
exports.RealtimeGateway = RealtimeGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", ws_1.Server)
], RealtimeGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('comment'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RealtimeGateway.prototype, "onComment", null);
exports.RealtimeGateway = RealtimeGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({ path: '/ws/trips' }),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        itinerary_service_1.ItineraryService,
        prisma_service_1.PrismaService])
], RealtimeGateway);
