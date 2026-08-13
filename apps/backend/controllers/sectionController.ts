import { UserInclude } from "./../../../packages/db/generated/prisma/models/User";
import { prisma } from "db/client";
import { Request, Response } from "express";

export const addSectionController = async (
  req: Request<{ boardId: string }>,
  res: Response,
) => {
  try {
    const { boardId } = req.params;
    const { title } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(400).json({
        msg: "Unauthorized",
      });
    }

    if (!title || !boardId) {
      return res.status(400).json({
        msg: "These fields are required",
      });
    }

    const findBoard = await prisma.boards.findUnique({
      where: {
        id: boardId,
      },
    });

    if (!findBoard) {
      return res.status(400).json({
        msg: "Board not found",
      });
    }

    const membership = await prisma.membership.findUnique({
      where: {
        userId_orgId: {
          userId,
          orgId: findBoard.orgId,
        },
      },
    });

    if (!membership || !membership.accepted) {
      return res.status(400).json({
        msg: "You don't have access to this board",
      });
    }

    const section = await prisma.sections.create({
      data: {
        title,
        boardId,
        position: 0,
      },
    });

    return res.status(200).json({
      msg: "Section created successfully",
      section,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      msg: "Internal Server Error",
    });
  }
};

export const getSingleSectionController = async (
  req: Request<{ sectionId: string }>,
  res: Response,
) => {
  try {
    const { sectionId } = req.params;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        msg: "Unauthorized",
      });
    }

    if (!sectionId) {
      return res.status(400).json({
        msg: "sectionId is required",
      });
    }

    const section = await prisma.sections.findUnique({
      where: {
        id: sectionId,
      },
    });

    if (!section) {
      return res.status(404).json({
        msg: "Section not found",
      });
    }

    const board = await prisma.boards.findUnique({
      where: {
        id: section.boardId,
      },
    });

    if (!board) {
      return res.status(404).json({
        msg: "Board not found",
      });
    }

    const membership = await prisma.membership.findUnique({
      where: {
        userId_orgId: {
          userId,
          orgId: board.orgId,
        },
      },
    });

    if (!membership || !membership.accepted) {
      return res.status(403).json({
        msg: "You don't have access to this section",
      });
    }

    return res.status(200).json({
      msg: "Section fetched successfully",
      section,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      msg: "Internal Server Error",
    });
  }
};

export const getAllSectionController = async (
  req: Request<{ boardId: string }>,
  res: Response,
) => {
  try {
    const { boardId } = req.params;
    const userId = req.userId;

    if (!userId) {
      return res.status(400).json({
        msg: "Unauthorized",
      });
    }

    if (boardId) {
      return res.status(400).json({
        msg: "boardId is required",
      });
    }

    const findBoard = await prisma.boards.findUnique({
      where: {
        id: boardId,
      },
    });

    if (!findBoard) {
      return res.status(400).json({
        msg: "Board not found",
      });
    }

    const membership = await prisma.membership.findUnique({
      where: {
        userId_orgId: {
          userId,
          orgId: findBoard.orgId,
        },
      },
    });

    if (!membership) {
      return res.status(400).json({
        msg: "You don't have access to this board",
      });
    }

    const sections = await prisma.sections.findMany({
      where: {
        boardId,
      },
      orderBy: {
        position: "asc",
      },
    });

    return res.status(200).json({
      msg: "Sections fetched successfully",
      sections,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      msg: "Internal Server Error",
    });
  }
};

export const deleteSectionController = async (
  req: Request<{ sectionId: string }>,
  res: Response,
) => {
  try {
    const { sectionId } = req.params;
    const userId = req.userId;
    if (!sectionId) {
      return res.status(400).json({
        msg: "section id is required",
      });
    }

    if (!userId) {
      return res.status(400).json({
        msg: "Unauthorized",
      });
    }

    const findSection = await prisma.sections.findUnique({
      where: {
        id: sectionId,
      },
    });
    if (!findSection) {
      return res.status(400).json({
        msg: "section not found",
      });
    }

    const board = await prisma.boards.findUnique({
      where: {
        id: findSection.boardId,
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
          orgId: board.orgId,
        },
      },
    });

    if (!membership || !membership.accepted) {
      return res.status(400).json({
        msg: "You don't have access to thi section",
      });
    }

    if (membership.role !== "ADMIN") {
      return res.status(400).json({
        msg: "Only admins can ddelete section",
      });
    }

    await prisma.sections.delete({
      where: {
        id: sectionId,
      },
    });
    return res.status(200).json({
      msg: "Section deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      msg: "Internal Server Error",
    });
  }
};

export const updateSectionController = async (
  req: Request<{ sectionId: string }>,
  res: Response,
) => {
  try {
    const { sectionId } = req.params;
    const { title } = req.body;
    const userId = req.userId;
    if (!userId) {
      return res.status(400).json({
        msg: "Unauthorized",
      });
    }
    if (!sectionId) {
      return res.status(400).json({
        msg: "sectionId is required",
      });
    }

    if (!title) {
      return res.status(400).json({
        msg: "title is required",
      });
    }

    const findSection = await prisma.sections.findUnique({
      where: {
        id: sectionId,
      },
    });

    if (!findSection) {
      return res.status(400).json({
        msg: "Section not found",
      });
    }

    const board = await prisma.boards.findUnique({
      where: {
        id: findSection.boardId,
      },
    });

    if (!board) {
      return res.status(404).json({
        msg: "Board not found",
      });
    }

    const membership = await prisma.membership.findUnique({
      where: {
        userId_orgId: {
          userId,
          orgId: board.orgId,
        },
      },
    });

    if (!membership || !membership.accepted) {
      return res.status(403).json({
        msg: "You don't have access to this section",
      });
    }

    if (membership.role !== "ADMIN") {
      return res.status(403).json({
        msg: "Only admins can update a section",
      });
    }

    const updatedSection = await prisma.sections.update({
      where: {
        id: sectionId,
      },

      data: {
        title,
      },
    });
    return res.status(200).json({
      msg: "section updated successfully",
      updatedSection,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      msg: "Internal Server Error",
    });
  }
};
