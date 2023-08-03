"use strict";
// TODO! 
Object.defineProperty(exports, "__esModule", { value: true });
exports.commonAuth = void 0;
function adminAuth(req, res, next) {
    const cookie = req.cookies._C_;
    if (!cookie)
        return res.sendStatus(403);
    next();
}
exports.default = adminAuth;
function commonAuth(req, res, next) {
    const cookie = req.cookies._C_ || req.cookies._T_;
    if (!cookie)
        return res.sendStatus(403);
    next();
}
exports.commonAuth = commonAuth;
