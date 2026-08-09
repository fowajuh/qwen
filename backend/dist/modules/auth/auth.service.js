"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const argon2 = __importStar(require("argon2"));
const crypto_1 = require("crypto");
const prisma_service_1 = require("../../prisma/prisma.service");
const backend_1 = require("@clerk/backend");
function ttlToMs(ttl) {
    const match = ttl.match(/^(\d+)([smhd])$/);
    if (!match)
        return 15 * 60 * 1000;
    const n = Number(match[1]);
    const mult = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[match[2]];
    return n * mult;
}
/**
 * Owns the `users`/`sessions` tables exclusively (§5 Stage 2: this whole
 * file — and only this file — becomes the Users Service later, unchanged).
 * Refresh tokens are stored hashed, never in plaintext, so a leaked DB
 * doesn't hand out live sessions.
 */
let AuthService = class AuthService {
    constructor(prisma, jwt) {
        this.prisma = prisma;
        this.jwt = jwt;
    }
    async signup(dto) {
        const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (existing)
            throw new common_1.ConflictException('an account with this email already exists');
        const passwordHash = await argon2.hash(dto.password);
        const user = await this.prisma.user.create({
            data: { email: dto.email, passwordHash, name: dto.name },
        });
        return this.issueTokens(user.id, user.email);
    }
    async login(dto) {
        const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (!user?.passwordHash || !(await argon2.verify(user.passwordHash, dto.password))) {
            throw new common_1.UnauthorizedException('invalid email or password');
        }
        return this.issueTokens(user.id, user.email);
    }
    /** Magic-link / OAuth land here after upstream verification — same token issuance path. */
    async issueForVerifiedIdentity(email, name) {
        let user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) {
            user = await this.prisma.user.create({ data: { email, name, passwordHash: null } });
        }
        return this.issueTokens(user.id, user.email);
    }
    async loginWithClerk(token) {
        try {
            const verified = await (0, backend_1.verifyToken)(token, { secretKey: process.env.CLERK_SECRET_KEY });
            const clerk = (0, backend_1.createClerkClient)({ secretKey: process.env.CLERK_SECRET_KEY });
            const clerkUser = await clerk.users.getUser(verified.sub);
            const email = clerkUser.emailAddresses[0]?.emailAddress;
            const name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'User';
            if (!email)
                throw new Error('No email found in Clerk user');
            return this.issueForVerifiedIdentity(email, name);
        }
        catch (e) {
            console.error('Clerk login failed:', e);
            throw new common_1.UnauthorizedException('invalid clerk token');
        }
    }
    async refresh(refreshToken) {
        let payload;
        try {
            payload = this.jwt.verify(refreshToken, { secret: process.env.JWT_REFRESH_SECRET });
        }
        catch {
            throw new common_1.UnauthorizedException('invalid refresh token');
        }
        const hash = (0, crypto_1.createHash)('sha256').update(refreshToken).digest('hex');
        const session = await this.prisma.session.findFirst({
            where: { userId: payload.sub, refreshTokenHash: hash, expiresAt: { gt: new Date() } },
        });
        if (!session)
            throw new common_1.UnauthorizedException('session expired or revoked');
        // rotate: kill the old session, issue a fresh pair
        await this.prisma.session.delete({ where: { id: session.id } });
        return this.issueTokens(payload.sub, payload.email);
    }
    async logout(userId, refreshToken) {
        const hash = (0, crypto_1.createHash)('sha256').update(refreshToken).digest('hex');
        await this.prisma.session.deleteMany({ where: { userId, refreshTokenHash: hash } });
        return { ok: true };
    }
    async issueTokens(userId, email) {
        const accessToken = this.jwt.sign({ sub: userId, email }, { secret: process.env.JWT_ACCESS_SECRET, expiresIn: process.env.JWT_ACCESS_TTL ?? '15m' });
        const refreshToken = this.jwt.sign({ sub: userId, email, jti: (0, crypto_1.randomUUID)() }, { secret: process.env.JWT_REFRESH_SECRET, expiresIn: process.env.JWT_REFRESH_TTL ?? '30d' });
        const refreshTokenHash = (0, crypto_1.createHash)('sha256').update(refreshToken).digest('hex');
        await this.prisma.session.create({
            data: {
                userId,
                refreshTokenHash,
                expiresAt: new Date(Date.now() + ttlToMs(process.env.JWT_REFRESH_TTL ?? '30d')),
            },
        });
        return { accessToken, refreshToken };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, jwt_1.JwtService])
], AuthService);
