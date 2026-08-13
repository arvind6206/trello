import { prisma } from "db/client";
import { Request, Response } from "express";

export const addIssueController = async (req: Request, res: Response) => {
  try {
    const { title, description, boardId, sectionId } = req.body;

    const userId = req.userId
    if(!userId){
      return res.status(400).json({
        msg: "Unauthorized"
      })
    }


    if (!title || !description || !boardId || !sectionId) {
      return res.status(400).json({
        msg: "These fields are required",
      });
    }

    const board = await prisma.boards.findUnique({
      where: {
        id: boardId,
      },
    });

    if (!board) {
      return res.status(400).json({
        msg: "Board not found",
      });
    }

    const membership = await prisma.membership.findUnique({
      where: {
        userId_orgId: {
          userId,
          orgId: board.orgId
        }
      }
    })

    if(!membership || !membership.accepted){
      return res.status(400).json({
        msg: "You don't have access to this board"
      })
    }

    const section = await prisma.sections.findUnique({
      where: {
        id: sectionId,
      },
    });
    if (!section) {
      return res.status(400).json({
        msg: "Section not found",
      });
    }

    if(section.boardId !== boardId){
      return res.status(400).json({
        msg: "Section does not belong to this board"
      })
    }

    const lastIssue = await prisma.issue.findFirst({
      where: {
        sectionId
      },
      orderBy: {
        position: "desc"
      }
    })

    const position = lastIssue ? lastIssue.position + 1 : 0

    const issue = await prisma.issue.create({
      data: {
        title,
        description,
        boardId,
        sectionId,
        position
      },
    });

    return res.status(201).json({
      msg: "Issue added successfully",
      issue,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      msg: "Internal Server Error",
    });
  }
};

export const getIssueController = async (req: Request<{issueId: string}>, res: Response) => {
  try {
    const { issueId } = req.params;
    if (!issueId) {
      return res.status(400).json({
        msg: "id is required",
      });
    }

    const findIssue = await prisma.issue.findUnique({
      where: {
        id: issueId,
      },
    });

    if(!findIssue){
        return res.status(400).json({
            msg: "issue not found"
        })
    }

    return res.status(200).json({
        msg: "Issue fetched successfully",
        findIssue
    })

  } catch (error) {
    console.error(error)
    return res.status(500).json({
        msg: "Internal Server Error"
    })
  }
};




export const updateIssueController = async (req: Request<{issueId: string}>, res: Response) => {
  try {
    const { title, description, issueId } = req.body;
    if (!issueId || !title || !description) {
      return res.status(400).json({
        msg: "These fields are required",
      });
    }

    const findIssue = await prisma.issue.findUnique({
      where: {
        id: issueId,
      },
    });

    if(!findIssue){
        return res.status(400).json({
            msg: "issue not found"
        })
    }

    const updatedIssue = await prisma.issue.update({
        where: {
            id: issueId
        }, 
        data:{
            title,
            description
        }
    })

    return res.status(200).json({
        msg: "Issue updateded successfully",
        updatedIssue
    })

  } catch (error) {
    console.error(error)
    return res.status(500).json({
        msg: "Internal Server Error"
    })
  }
};