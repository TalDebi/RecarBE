import { Request, Response, NextFunction } from "express";
import jwt, { TokenExpiredError } from "jsonwebtoken";

export interface AuthResquest extends Request {
  user?: { _id: string };
}
const authMiddleware = (
  req: AuthResquest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>
  if (token == null) return res.sendStatus(401);
  jwt.verify(token, process.env.JWT_SECRET, (error, user) => {
    if (error instanceof TokenExpiredError)
      return res.status(401).json({ errorType: "TokenExpired", error });
    if (error) return res.sendStatus(401);
    req.user = user as { _id: string };
    next();
  });
};

export default authMiddleware;
