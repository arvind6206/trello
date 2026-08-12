import { prisma } from "db/client";
import { Request, Response } from "express";
import boardRouter from "../routes/boardRoute";

export const addIssueController = async (req: Request, res: Response) => {
  try {
    const { title, description, boardId, sectionId } = req.body;
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

    const issue = await prisma.issue.create({
      data: {
        title,
        description,
        boardId,
        sectionId,
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