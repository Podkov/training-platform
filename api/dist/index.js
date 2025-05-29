"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const health_1 = require("./routes/health");
const auth_routes_1 = require("./routes/auth.routes");
const course_routes_1 = require("./routes/course-routes");
const enrollment_routes_1 = require("./routes/enrollment-routes");
const user_routes_1 = require("./routes/user-routes");
const admin_routes_1 = require("./routes/admin-routes");
const app = (0, express_1.default)();
// Konfiguracja CORS
app.use((0, cors_1.default)({
    origin: 'http://localhost:3000', // adres frontendu
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express_1.default.json());
// Routers
app.use('/health', health_1.healthRouter);
app.use('/auth', auth_routes_1.authRouter);
app.use('/courses', course_routes_1.courseRouter);
app.use('/enrollments', enrollment_routes_1.enrollmentRouter);
app.use('/users', user_routes_1.userRouter);
app.use('/admin', admin_routes_1.adminRouter);
const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`API running on http://localhost:${port}`));
