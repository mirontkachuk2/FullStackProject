"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = verifyToken;
exports.authenticate = authenticate;
const auth_1 = require("firebase-admin/auth");
//import { logger } from "firebase-functions";
// Verify token
async function verifyToken(idToken) {
    try {
        const decodedToken = await (0, auth_1.getAuth)().verifyIdToken(idToken);
        //console.log("Token Verified Successfully:", decodedToken);
        return decodedToken;
    }
    catch (error) {
        console.error("Error verifying token:", error);
        return null;
    }
}
// Auth function
async function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            error: "Unauthorized: No token provided"
        });
    }
    const idToken = authHeader.split("Bearer ")[1];
    const decodedUser = await verifyToken(idToken);
    if (!decodedUser) {
        return res.status(403).json({
            error: "Unauthorized: Invalid token"
        });
    }
    req.user = decodedUser; // Store user info for later use
    return next();
}
//# sourceMappingURL=auth.js.map