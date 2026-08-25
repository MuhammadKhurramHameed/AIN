import { Request, Response, NextFunction } from "express";
import { Role } from "../config/roles";
import { ApiError } from "../utils/ApiError";

/** Restricts a route to a fixed set of roles. */
export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) throw new ApiError(401, "Not authenticated");
    if (!roles.includes(req.user.role)) {
      throw new ApiError(403, "Not authorized for this action");
    }
    next();
  };
}

/** Restricts a route to users holding a named delegated permission (moitt_staff scoping). */
export function requirePermission(permission: string) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) throw new ApiError(401, "Not authenticated");
    if (req.user.role === "super_admin") return next();
    if (req.user.permissions?.includes(permission)) return next();
    throw new ApiError(403, "Missing required permission: " + permission);
  };
}
