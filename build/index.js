"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const express_fileupload_1 = __importDefault(require("express-fileupload"));
const mongoose_1 = __importDefault(require("mongoose"));
mongoose_1.default.connect(process.env.MONGO_URI).finally(() => console.log("Mongo is running")).catch(er => console.error(er));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use((0, cookie_parser_1.default)(process.env.COOKIE_SECRET));
app.use((0, cors_1.default)({ origin: "http://localhost:5173", credentials: true }));
app.use((0, express_fileupload_1.default)());
app.use(express_1.default.static("public"));
// ACTUAL SERVER BELOW
const forms_1 = __importDefault(require("./routes/forms"));
const agents_1 = __importDefault(require("./routes/agents"));
const submissions_1 = __importDefault(require("./routes/submissions"));
const auth_1 = __importDefault(require("./routes/auth"));
const path_1 = __importDefault(require("path"));
app.use('/api/forms', forms_1.default);
app.use('/api/agents', agents_1.default);
app.use('/api/submissions', submissions_1.default);
app.use('/api/auth', auth_1.default);
app.get('*', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../public/index.html'));
});
app.listen(8000, () => console.log('server running on 8k, while u just got caught on 4k.'));
