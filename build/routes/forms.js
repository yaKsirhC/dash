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
router.post("/create", authorizer_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.body.formBody || !req.body.formName)
            return res.status(409).json({ msg: "Missing Fields" });
        const formName = req.body.formName;
        const newForm = yield schemas_1.Form.create({
            title: formName,
            body: req.body.formBody
        });
        yield newForm.save();
        res.status(200).json({ msg: "Form was created.", fid: newForm._id });
    }
    catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
}));
router.get("/all", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const all = yield schemas_1.Form.find({}, "-body -__v");
        const mapped = yield Promise.all(all.map((sample) => __awaiter(void 0, void 0, void 0, function* () {
            const found = yield schemas_1.Submission.find({ "fid": sample._id });
            return Object.assign(Object.assign({}, sample.toObject()), { submissions: found.length });
        })));
        res.json({ all: mapped });
    }
    catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
}));
router.put("/put", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.body.fid || !req.body.newFormBody || !req.body.formName)
            return res.status(400).json({ msg: "Bad Request, please review the request and try again." });
        const putForm = yield schemas_1.Form.findById(req.body.fid);
        putForm.body = req.body.newFormBody;
        putForm.title = req.body.formName;
        yield (putForm === null || putForm === void 0 ? void 0 : putForm.save());
        return res.json({ msg: "updated form succesfully" });
    }
    catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
}));
router.delete("/delete", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.body.fid)
            return res.status(400).json({ msg: "Bad Request, please review the request and try again." });
        yield schemas_1.Form.findByIdAndDelete(req.body.fid);
        return res.json({ msg: "form was deleted" });
    }
    catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
}));
// function foo(conds: []){
// 	if()
// }
router.get("/get/:id/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        if (!id)
            return res.sendStatus(400);
        const foundForm = yield schemas_1.Form.findById(id);
        if (!foundForm)
            return res.status(404).json({ msg: "Resource Not Found" });
        return res.json({ form: foundForm });
    }
    catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
}));
exports.default = router;
