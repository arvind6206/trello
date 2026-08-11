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

export const deletOrgController = async(req: Request<{orgId: string}>, res: Response) => {
    try {
        const {orgId} = req.params;
        const findOrg = await prisma.org.findUnique({
            where: {
                id: orgId,
            }
        })

        if(!findOrg){
            return res.status(400).json({
                msg: "Org is not found"
            })
        }

        await prisma.org.delete({
            where: {
                id: orgId
            }
        })

        return res.status(200).json({
            msg: "Org deleted successfully"
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            msg: "Internal Server Error"
        })
    }
}