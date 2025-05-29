"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginController = exports.registerController = void 0;
const auth_service_1 = require("../services/auth.service");
const registerController = async (req, res) => {
    try {
        const { email, password, role } = req.body;
        const result = await (0, auth_service_1.register)({ email, password, role });
        res.status(201).json(result);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: 'Wystąpił nieoczekiwany błąd' });
        }
    }
};
exports.registerController = registerController;
const loginController = async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await (0, auth_service_1.login)({ email, password });
        res.json(result);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: 'Wystąpił nieoczekiwany błąd' });
        }
    }
};
exports.loginController = loginController;
