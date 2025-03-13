import { getAuth } from "firebase-admin/auth";
import { Request, Response, NextFunction } from "express";
//import { logger } from "firebase-functions";


// Verify token
export async function verifyToken(idToken: string) {
    try {
        const decodedToken = await getAuth().verifyIdToken(idToken);
        //console.log("Token Verified Successfully:", decodedToken);
        return decodedToken;
    } catch (error) {
        console.error("Error verifying token:", error);
        return null;
    }
}


// Auth function
export async function authenticate(
    req: Request,
    res: Response,
    next: NextFunction
) {
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
