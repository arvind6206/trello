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

export const getSectionController = async (req: Request<{sectionId: string}>, res: Response) => {
    try {
        const {sectionId} = req.params;
        if(!sectionId){
            return res.status(400).json({
                msg: "id is required"
            })
        }

        const findSection = await prisma.sections.findUnique({
            where: {
                id: sectionId
            }
        })

        if(!findSection){
            return res.status(400).json({
                msg: "Section not found"
            })
        }

        const sections = await prisma.sections.findMany({
            where: {
                id: sectionId
            }
        })
        return res.status(200).json({
            msg: "Section fetched successfully",
            sections
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            msg: "Internal Server Error"
        })
    }
}

export const deleteSectionController = async (req: Request<{sectionId: string}>, res: Response) => {
    try {
        const {sectionId} = req.params
        if(!sectionId){
            return res.status(400).json({
                msg: "section id is required"
            })
        }

        const findSection = await prisma.sections.findUnique({
            where: {
                id: sectionId
            }
        })
        if(!sectionId){
            return res.status(400).json({
                msg: "section not found"
            })
        }

        await prisma.sections.delete({
            where: {
                id: sectionId
            }
        })
        return res.status(200).json({
            msg: "Section deleted successfully"
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            msg: "Internal Server Error"
        })
    }
}

export const updateSectionController = async (req: Request<{sectionId: string}>, res: Response) => {
    try {
        const {sectionId, title} = req.body
        if(!sectionId){
            return res.status(400).json({
                msg: "sectionId is required"
            })
        }

        if(!title){
            return res.status(400).json({
                msg: "title is required"
            })
        }

        const findSection = await prisma.sections.findUnique({
            where: {
                id: sectionId
            }
        })

        if(!sectionId){
            return res.status(400).json({
                msg: "Section not found"
            })
        }

        const updatedSection = await prisma.sections.update({
            where: {
                id: sectionId
            },
             
                data: {
                    title
                }
            
        })
        return res.status(200).json({
            msg: "section updated successfully",
            updatedSection
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            msg: "Internal Server Error"
        })
    }
}