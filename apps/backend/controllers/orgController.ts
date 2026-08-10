import { prisma } from "db/client";
import { Request, Response } from "express";

export const createOrgController = async(req: Request, res: Response) => {
    try {
        const {orgname, description} = req.body

        if(!orgname){
            return res.status(400).json({
                msg: "This field i required"
            })
        }

        const org = await prisma.org.create({
            data: {
                orgname,
                description
            }
        })

        return res.status(201).json({
            msg: "Org created",
            org
        })
    } catch (error) {
        console.log(error)
    }
}