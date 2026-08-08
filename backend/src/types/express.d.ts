/**
 * FIX: messages.routes.ts and profile.routes.ts both do `req.user!.id`,
 * but nothing in the codebase ever told TypeScript what shape `req.user`
 * has, so it was falling back to Passport's empty default `Express.User`
 * (which has no properties at all) and every `.id` access failed to
 * compile with "Property 'id' does not exist on type 'User'".
 *
 * This augments the same `Express.User` interface Passport already reads
 * from/writes to, so `req.user` is correctly typed everywhere without
 * touching every route handler.
 */
declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      name: string;
      role?: string;
    }
  }
}

export {};
