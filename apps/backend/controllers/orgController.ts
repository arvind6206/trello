import { prisma } from "db/client";
import { Request, Response } from "express";

export const createOrgController = async(req: Request, res: Response) => {
    try {
        const {orgname, description} = req.body
        const userId = req.userId

        if(!userId){
            return res.status(400).json({
                msg: "Unauthorized"
            })
        }

        if(!orgname){
            return res.status(400).json({
                msg: "This field i required"
            })
        }

        const org = await prisma.org.create({
            data: {
                orgname,
                description: description ?? "",

                memberships: {
                    create: {
                        userId,
                        role: "ADMIN",
                        accepted: true
                    }
                }
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

export const deleteOrgController = async(req: Request<{orgId: string}>, res: Response) => {
    try {
        const {orgId} = req.params;
        const userId = req.userId

        if(!userId){
            return res.status(400).json({
                msg: "Unauthorized"
            })
        }

        if(!orgId){
            return res.status(400).json({
                msg: "orgId is required"
            })
        }
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

       const membership =  await prisma.membership.findUnique({
            where: {
                userId_orgId: {
                    userId,
                    orgId
                }
            }
        })

        if(!membership){
            return res.status(400).json({
                msg: "You are not a member of this org"
            })
        }

        if(membership.role !== "ADMIN"){
            return res.status(400).json({
                msg: "Only admins can delete the organization"
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