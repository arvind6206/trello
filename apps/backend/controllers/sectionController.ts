import { prisma } from "db/client";
import { Request, Response } from "express";

export const addSectionController = async (req: Request, res: Response) => {
    try {
        const {title, boardId} = req.body;

        if(!title || !boardId){
            return res.status(400).json({
                msg: "These fields are required"
            })
        }

        const findBoard = await prisma.boards.findUnique({
            where: {
                id: boardId
            }
        })

        if(!boardId){
            return res.status(400).json({
                msg: "Board not found"
            })
        }

        const section = await prisma.sections.create({
            data: {
                title,
                boardId
            }
        })

        return res.status(200).json({
            msg: "Section created successfully",
            section
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            msg: "Internal Server Error"
        })
    }

}