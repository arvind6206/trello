import { prisma } from "db/client";
import { Request, Response } from "express";

export const addBoardController = async (req: Request<{orgId: string}>, res: Response) => {
    try {
        const {orgId} = req.params
        const {title} = req.body
        const userId = req.userId
        if(!userId){
            return res.status(400).json({
                msg: "Unauthorized"
            })
        }

        if(!orgId){
            return res.status(400).json({
                msg: "orgid is required"
            })
        }
        if(!title){
            return res.status(400).json({
                msg: "title is required"
            })
        }

        const membership = await prisma.membership.findUnique({
            where: {
                userId_orgId: {
                    userId,
                    orgId
                }
            }
        })

        if(!membership){
            return res.status(400).json({
                msg: "You are not a member of this otganization"
            })
        }

        if(!membership.accepted){
            return res.status(400).json({
                msg: "Your membership has not been accepted"
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

        const membership = await prisma.membership.findUnique({
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

        if(!membership.accepted){
            return res.status(400).json({
                msg: "Your membership has not been aceepted"
            })
        }

    

        const boards = await prisma.boards.findMany({
             where: {
                orgId
            }
        }
           
        )
        return res.status(200).json({
            msg: "Boards fetched successfully",
            boards
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            msg: "Internal Server Error"
        })
    }
}

export const getSingleBoardController = async (req: Request<{boardId: string}>, res: Response) => {
    try {
        const {boardId} = req.params;
        const userId = req.userId
        if(!userId){
            return res.status(400).json({
                msg: "unauthorized"
            })
        }

        if(!boardId){
            return res.status(400).json({
                msg: "boardId is required"
            })
        }

        const board = await prisma.boards.findUnique({
            where: {
                id: boardId
            }
        })

        if(!board){
            return res.status(400).json({
                msg: "Board not found"
            })
        }

        const membership = await prisma.membership.findUnique({
            where: {
                userId_orgId: {
                    userId,
                    orgId: board.orgId
                }
            }
        })

        if(!membership){
            return res.status(400).json({
                msg: "You are not part of the memberboard"
            })
        }

        if(!membership.accepted){
            return res.status(400).json({
                msg: "Your membership has not been accepted"
            })
        }

        return res.status(200).json({
            msg: "Board fetched successfully",
            board
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            msg: "Internal Server Error"
        })
    }
}

export const deleteBoardController = async (req: Request<{boardId: string}>, res: Response) => {
    try {
        const {boardId} = req.params;
        const userId = req.userId
        
        if(!userId){
            return res.status(400).json({
                msg: "Unauthorized"
            })
        }

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

        const membership = await prisma.membership.findUnique({
            where: {
                userId_orgId: {
                    userId,
                    orgId: findBoard.orgId
                }
            }
        })

        if(!membership || !membership.accepted){
            return res.status(400).json({
                msg: "You don't have access to ths board"
            })
        }
          if (membership.role !== "ADMIN") {
            return res.status(403).json({
                msg: "Only admins can delete a board"
            });
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

export const updateBoardController = async (
    req: Request<{ boardId: string }>,
    res: Response
) => {
    try {
        const { boardId } = req.params;
        const { title } = req.body;
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({
                msg: "Unauthorized"
            });
        }

        if (!boardId) {
            return res.status(400).json({
                msg: "boardId is required"
            });
        }

        if (!title) {
            return res.status(400).json({
                msg: "title is required"
            });
        }

        const board = await prisma.boards.findUnique({
            where: {
                id: boardId
            }
        });

        if (!board) {
            return res.status(404).json({
                msg: "Board not found"
            });
        }

        const membership = await prisma.membership.findUnique({
            where: {
                userId_orgId: {
                    userId,
                    orgId: board.orgId
                }
            }
        });

        if (!membership || !membership.accepted) {
            return res.status(403).json({
                msg: "You don't have access to this board"
            });
        }

        if (membership.role !== "ADMIN") {
            return res.status(403).json({
                msg: "Only admins can update the board"
            });
        }

        const updatedBoard = await prisma.boards.update({
            where: {
                id: boardId
            },
            data: {
                title
            }
        });

        return res.status(200).json({
            msg: "Board updated successfully",
            board: updatedBoard
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            msg: "Internal Server Error"
        });
    }
};