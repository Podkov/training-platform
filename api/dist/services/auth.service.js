"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jwt_utils_1 = require("../utils/jwt.utils");
const prisma = new client_1.PrismaClient();
const register = async (data) => {
    const { email, password, role = 'PARTICIPANT' } = data;
    const existingUser = await prisma.user.findUnique({
        where: { email }
    });
    if (existingUser) {
        throw new Error('Użytkownik o podanym emailu już istnieje');
    }
    const passwordHash = await bcryptjs_1.default.hash(password, 10);
    const user = await prisma.user.create({
        data: {
            email,
            passwordHash,
            role
        }
    });
    const token = (0, jwt_utils_1.generateToken)({
        userId: user.id,
        email: user.email,
        role: user.role
    });
    return { token };
};
exports.register = register;
const login = async (data) => {
    const { email, password } = data;
    const user = await prisma.user.findUnique({
        where: { email }
    });
    if (!user) {
        throw new Error('Nieprawidłowy email lub hasło');
    }
    const isValidPassword = await bcryptjs_1.default.compare(password, user.passwordHash);
    if (!isValidPassword) {
        throw new Error('Nieprawidłowy email lub hasło');
    }
    const token = (0, jwt_utils_1.generateToken)({
        userId: user.id,
        email: user.email,
        role: user.role
    });
    return { token };
};
exports.login = login;
