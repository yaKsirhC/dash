"use strict";
// TODO! 
Object.defineProperty(exports, "__esModule", { value: true });
function adminAuth(req, res, next) {
    const cookie = req.cookies._C_;
    if (!cookie)
        return res.sendStatus(403);
    next();
}
exports.default = adminAuth;
