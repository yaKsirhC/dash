// TODO! 

import { NextFunction, Request, Response } from "express";

export default function adminAuth(req: Request, res: Response, next: NextFunction) {
  const cookie = req.cookies._C_;
  if (!cookie) return res.sendStatus(403);
  next();
}
export function commonAuth(req: Request, res: Response, next: NextFunction) {
  const cookie = req.cookies._C_ || req.cookies._T_;
  if (!cookie) return res.sendStatus(403);
  next();
}
