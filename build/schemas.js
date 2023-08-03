"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Student = exports.Submission = exports.Form = exports.User = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const userSchema = new mongoose_1.default.Schema({
    name: String,
    email: String,
    password: String,
    agentToken: String
});
const studentSchema = new mongoose_1.default.Schema({
    name: String,
    email: String,
    password: String,
});
const formSchema = new mongoose_1.default.Schema({
    title: String,
    body: Object,
});
const submissionSchema = new mongoose_1.default.Schema({
    data: Object,
    fid: String,
    status: Number,
    submittedOn: Date,
    affiliate: String,
    submitee: String
});
const User = mongoose_1.default.model('User', userSchema);
exports.User = User;
const Form = mongoose_1.default.model('Form', formSchema);
exports.Form = Form;
const Submission = mongoose_1.default.model('Submission', submissionSchema);
exports.Submission = Submission;
const Student = mongoose_1.default.model('Student', studentSchema);
exports.Student = Student;
