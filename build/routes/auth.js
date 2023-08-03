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
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = __importDefault(require("crypto"));
const router = express_1.default.Router();
router.post('/register-agent', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.body.password || !req.body.email || !req.body.name)
            return res.sendStatus(400);
        const match = yield schemas_1.User.findOne({ email: req.body.email });
        if (match) {
            return res.status(419).json({ msg: "Agent Email Already Exists" });
        }
        const salt = yield bcrypt_1.default.genSalt(10);
        const password = yield bcrypt_1.default.hash(req.body.password, salt);
        const creds = {
            email: req.body.email,
            password,
            name: req.body.name,
            agentToken: crypto_1.default.randomBytes(10).toString("hex")
        };
        const newUser = new schemas_1.User(creds);
        yield newUser.save();
        return res.status(200).json({ msg: "Agent Registered Succesfully." });
    }
    catch (error) {
        console.error(error);
        res.status(500).json(error);
    }
}));
router.post('/log-in', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.body.password || !req.body.email)
            return res.status(400).json({ msg: "Missing Fields" });
        const email = req.body.email;
        const password = req.body.password;
        const emailMatch = yield schemas_1.User.findOne({ email });
        if (emailMatch) {
            const actualPassword = emailMatch.password;
            const comparison = yield bcrypt_1.default.compare(password, actualPassword);
            if (comparison)
                return res.cookie('_C_', emailMatch.id, { httpOnly: false }).status(200).json({ msg: "Logged in" });
            return res.status(400).json({ msg: "Double Check Everything! The email or password is incorrect." });
        }
        return res.status(404).json({ msg: "Agent doesn't exist." });
    }
    catch (error) {
        console.error(error);
        res.status(400).json(error);
    }
}));
router.post('/sign-up-student', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.body.password || !req.body.email)
            return res.sendStatus(400);
        const match = yield schemas_1.Student.findOne({ email: req.body.email });
        if (match) {
            return res.status(419).json({ msg: "Log in, Student already Registered" });
        }
        const salt = yield bcrypt_1.default.genSalt(10);
        const password = yield bcrypt_1.default.hash(req.body.password, salt);
        const creds = {
            email: req.body.email,
            password,
        };
        const newUser = new schemas_1.Student(creds);
        yield newUser.save();
        return res.cookie('_T_', newUser.id, { httpOnly: false }).sendStatus(200);
    }
    catch (error) {
        console.error(error);
        res.status(500).json(error);
    }
}));
exports.default = router;
