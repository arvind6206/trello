import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken'

interface JwtPayload{
    userId: string,
}

export function authMiddleware(req: Request, res: Response, next: NextFunction){
    try {
        const authHeader = req.headers.authorization as string
        if(!authHeader){
            return res.status(401).json({
                msg: "Authorization header is required"
            })
        }

        const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader
        
        if(!token){
            return res.status(401).json({
                msg: "Token is required"
            })
        }

        const jwtSecret = process.env.JWT_SECRET
        if(!jwtSecret){
            return res.status(500).json({
                msg: "JWT secret is not configured"
            })
        }

        const decoded = jwt.verify(token, jwtSecret) as JwtPayload
      
        req.userId = decoded.userId
        next()

    } catch (error) {
        return res.status(401).json({
            msg: "Invalid or expired token"
        })
    }
}