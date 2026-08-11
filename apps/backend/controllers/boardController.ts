import { prisma } from "db/client";
import { Request, Response } from "express";

export const addBoardController = async (req: Request, res: Response) => {
    try {
        const {title, orgId} = req.body
        if(!title || !orgId){
            return res.status(400).json({
                msg: "These are required fields"
            })
        }

        const findOrg = await prisma.org.findUnique({
            where: {
                id: orgId
            }
        })

        if(!orgId){
            return res.status(400).json({
                msg: "There is no org present of this orgId"
            })
        }

        const board = await prisma.boards.create({
            data: {
                title,
                orgId
            }
        })

        return res.status(201).json({
            msg: "Boards created successfully",
            board
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            msg: "Internal Server Error"
        })
    }
}

export const getBoardController = async (req: Request<{orgId: string}>, res: Response) => {
    try {
        const {orgId} = req.params
        if(!orgId){
            return res.status(400).json({
                msg: "orgId is required"
            })
        }

        const org = await prisma.org.findUnique({
            where: {
                id: orgId
            }
        })
        if(!orgId){
            return res.status(400).json({
                msg: "org not found"
            })
        }

        const boards = await prisma.boards.findMany({
             where: {
                id: orgId
            }
        }
           
        )
        return res.status(200).json({
            msg: "Boards fetched successfully",
            boards
        })
    } catch (error) {
        
    }
}

export const deleteBoardController = async (req: Request<{boardId: string}>, res: Response) => {
    try {
        const {boardId} = req.params;

        if(!boardId){
            return res.status(400).json({
                msg: "boardId is required"
            })
        }

        const findBoard = await prisma.boards.findUnique({
            where: {
                id: boardId
            }
        })

        if(!findBoard){
            return res.status(400).json({
                msg: "Board not found"
            })
        }

        await prisma.boards.delete({
            where: {
                id: boardId
            }
        })

        return res.status(200).json({
            msg: "Board deleted successfully"
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            msg: "Internal Server Error"
        })
    }
}