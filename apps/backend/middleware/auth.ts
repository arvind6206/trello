import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken'

interface JwtPayload{
    userId: string,
}

export function authMiddleware(req: Request, res: Response, next: NextFunction){
    try {
        const token = req.headers.token as string
        if(!token){
            return res.status(400).json({
                msg: "Token is required"
            })
        }

        const jwtSecret = process.env.JWT_SECRET
        if(!jwtSecret){
            return res.status(400).json({
                msg: "JWT secret is not configured"
            })
        }

        const decoded = jwt.verify(token, jwtSecret) as JwtPayload
      
        req.userId = decoded.userId
        next()

    } catch (error) {
        return res.status(400).json({
            msg: "Invalid or expired token"
        })
    }
}