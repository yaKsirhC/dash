"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const mongoose_1 = __importDefault(require("mongoose"));
mongoose_1.default.connect(process.env.MONGO_URI).finally(() => console.log("Mongo is running")).catch(er => console.error(er));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use((0, cookie_parser_1.default)(process.env.COOKIE_SECRET));
// app.use(cors({origin: "" , credentials: true}))
app.use(express_1.default.static("public"));
// ACTUAL SERVER BELOW
const forms_1 = __importDefault(require("./routes/forms"));
const agents_1 = __importDefault(require("./routes/agents"));
const submissions_1 = __importDefault(require("./routes/submissions"));
const auth_1 = __importDefault(require("./routes/auth"));
app.use('/api/forms', forms_1.default);
app.use('/api/agents', agents_1.default);
app.use('/api/submissions', submissions_1.default);
app.use('/api/auth', auth_1.default);
app.listen(8000, () => console.log('server running on 8k, while u just got caught on 4k.'));
