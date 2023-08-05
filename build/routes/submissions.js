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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const authorizer_1 = __importStar(require("../authorizer"));
const schemas_1 = require("../schemas");
const crypto_1 = __importDefault(require("crypto"));
const router = express_1.default.Router();
router.post('/submit/', authorizer_1.commonAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!req.body.fid || !req.body.data)
            return res.status(400).json({ msg: "Incomplete Submission" });
        if (!req.body.aid)
            return res.status(400).json({ msg: "No Agent referral" });
        const dataAll = JSON.parse(req.body.data);
        if (req.files) {
            Object.entries(req.files).forEach(file => {
                const dataName = file[0].replace('data1[', '').replace(']', '');
                const name = crypto_1.default.randomBytes(10).toString("hex") + '---' + file[1].name;
                dataAll[dataName] = name;
                file[1].mv('uploads/' + name);
            });
        }
        const submitee = (_a = yield schemas_1.Student.findById(req.cookies['_T_'])) !== null && _a !== void 0 ? _a : yield schemas_1.User.findById(req.cookies['_C_']);
        const now = new Date();
        const agent = yield schemas_1.User.findOne({ agentToken: req.body.aid });
        const newSub = new schemas_1.Submission({
            data: dataAll,
            fid: req.body.fid,
            submittedOn: now,
            status: 0,
            affiliate: agent === null || agent === void 0 ? void 0 : agent.email,
            submitee: submitee === null || submitee === void 0 ? void 0 : submitee.email
        });
        yield newSub.save();
        res.json({ msg: "Congrats! We will inform you if you get approved. I am sure you will (not) :)" });
    }
    catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
}));
router.post('/submit-uc', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    try {
        const submitee = (_b = yield schemas_1.Student.findById(req.cookies['_T_'])) !== null && _b !== void 0 ? _b : yield schemas_1.User.findById(req.cookies['_C_']);
        const now = new Date();
        if (yield schemas_1.Submission.find({ submitee: submitee === null || submitee === void 0 ? void 0 : submitee.email })) {
            yield schemas_1.Submission.findOneAndUpdate({ submitee: submitee === null || submitee === void 0 ? void 0 : submitee.email }, {
                data: req.body.data,
                fid: "UC",
                submittedOn: now,
                status: 0,
                // affiliate: agent?.email,
                submitee: submitee === null || submitee === void 0 ? void 0 : submitee.email
            });
            return res.sendStatus(200);
        }
        const newSub = new schemas_1.Submission({
            data: req.body.data,
            fid: "UC",
            submittedOn: now,
            status: 0,
            // affiliate: agent?.email,
            submitee: submitee === null || submitee === void 0 ? void 0 : submitee.email
        });
        yield newSub.save();
        res.sendStatus(200);
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
        const all = yield schemas_1.Submission.find({}, "-__v").sort('-submittedOn');
        const populated = yield Promise.all(all.map((sub) => __awaiter(void 0, void 0, void 0, function* () {
            // const title = await Form.findById(sub.fid, 'title')
            // const aff = await User.findOne({agentToken: sub.affiliate}, 'name')
            return Object.assign(Object.assign({}, sub.toObject()), { formTitle: sub.fid });
        })));
        res.json({ all: populated });
    }
    catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
}));
router.get('/uc-submissions', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const all = yield schemas_1.Submission.find({ fid: 'UC' }).count();
        return res.json({ all });
    }
    catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
}));
exports.default = router;
