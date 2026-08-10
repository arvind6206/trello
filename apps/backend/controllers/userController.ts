import { Request, Response } from "express";
import { prisma } from 'db/client';
import bcrypt from 'bcryptjs'

export const signupController = async(req: Request, res: Response) => {
    try {
        const {username, password} = req.body
        if(!username || !password){
            return res.status(400).json({
                msg: "These fields are required"
            })
        }

        const existingUser = await prisma.user.findUnique({
            where: {
                username
            }
        })
        if(existingUser){
            return res.status(400).json({
                msg: "User already exists"
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const people = await prisma.user.create({
            data: {
                username,
                password: hashedPassword
            }
        })


        return res.status(201).json({
            msg: "User created successfully",
            people
        })
    } catch (error) {
        console.log("Error while signup", error)
        return res.status(500).json({
            msg: "Internal Server Error"
        })
    }
}