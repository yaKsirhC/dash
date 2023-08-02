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
const authorizer_1 = __importDefault(require("../authorizer"));
const schemas_1 = require("../schemas");
const router = express_1.default.Router();
router.post('/submit/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.body.fid || !req.body.data || !req.body.aid)
            return res.status(400).json({ msg: "Incomplete Submission" });
        const now = new Date();
        const newSub = new schemas_1.Submission({
            data: req.body.data,
            fid: req.body.fid,
            submittedOn: now,
            status: 0,
            affiliate: req.body.aid,
            // submiteeEmail: req.body.submitee
        });
        yield newSub.save();
        res.json({ msg: "Congrats! We will inform you if you get approved. I am sure you will (not) :)" });
    }
    catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
}));
router.put('/change-stat', authorizer_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.body.status || !req.body.sid)
            return res.status(400).json({ msg: "Oops, you missed something?" });
        const foundS = yield schemas_1.Submission.findById(req.body.sid);
        if (!foundS)
            return res.status(404).json({ msg: "Could not find submission to process." });
        if (req.body.status == 1) {
            foundS.status = 1;
            // TODO: EMAIL CODE
        }
        else if (req.body.status == -1) {
            foundS.status = -1;
            // TODO: EMAIL CODE
        }
        else {
            res.sendStatus(400);
            return;
        }
        yield foundS.save();
        res.json({ msg: "Succesfully updated state of submission, submitee will soon be notified." });
    }
    catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
}));
router.get('/get', authorizer_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const all = yield schemas_1.Submission.find({}, "-__v");
        res.json({ all });
    }
    catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
}));
exports.default = router;
