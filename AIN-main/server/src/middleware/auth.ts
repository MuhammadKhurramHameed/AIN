import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { User, IUser } from "../models/User";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export const requireAuth = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const token = req.cookies?.token as string | undefined;
  if (!token) throw new ApiError(401, "Not authenticated");

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    throw new ApiError(401, "Invalid or expired session");
  }

  const user = await User.findById(payload.sub);
  if (!user || user.status === "disabled") throw new ApiError(401, "Not authenticated");

  req.user = user;
  next();
});
