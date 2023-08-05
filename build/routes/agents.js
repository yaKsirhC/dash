"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const schemas_1 = require("../schemas");
const router = express_1.default.Router();
router.get("/request-token", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.cookies["_C_"])
            return res.sendStatus(400);
        const found = yield schemas_1.User.findById(req.cookies["_C_"]);
        if (!found)
            return res.status(404).json({ msg: "agent not found" });
        return res.json({ agentToken: found.agentToken });
    }
    catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
}));
router.get('/all', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const all = yield schemas_1.User.find({}, "-_id email name");
        return res.json({ all });
    }
    catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
}));
exports.default = router;
