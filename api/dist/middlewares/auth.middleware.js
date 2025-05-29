"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRole = exports.verifyAuth = void 0;
const jwt_utils_1 = require("../utils/jwt.utils");
const verifyAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Brak tokena autoryzacji' });
        return;
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = (0, jwt_utils_1.verifyToken)(token);
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(401).json({ error: 'Nieprawidłowy token' });
        return;
    }
};
exports.verifyAuth = verifyAuth;
const checkRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ error: 'Brak autoryzacji' });
            return;
        }
        if (!roles.includes(req.user.role)) {
            res.status(403).json({ error: 'Brak uprawnień' });
            return;
        }
        next();
    };
};
exports.checkRole = checkRole;
