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


    if (!title || !boardId || !sectionId) {
      return res.status(400).json({
        msg: "Title, boardId, and sectionId are required",
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
    const userId = req.userId

    if(!userId){
      return res.status(400).json({
        msg: "Unauthorized"
      })
    }

    if (!issueId) {
      return res.status(400).json({
        msg: "id is required",
      });
    }

    const findIssue = await prisma.issue.findUnique({
      where: {
        id: issueId,
      },
      include: {
        board: true,
        section: true
      }
    });

      if(!findIssue){
        return res.status(400).json({
            msg: "issue not found"
        })
    }


    const membership = await prisma.membership.findUnique({
      where: {
        userId_orgId: {
          userId,
          orgId: findIssue.board.orgId
        }
      }
    })

    if(!membership || !membership.accepted){
      return res.status(400).json({
        msg: "You don't have access to this issue"
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

export const getAllIssueController = async (
    req: Request<{ boardId: string }>,
    res: Response
) => {
    try {
        const { boardId } = req.params;
        const userId = req.userId;

        if (!userId) {
            return res.status(400).json({
                msg: "Unauthorized"
            });
        }

        if (!boardId) {
            return res.status(400).json({
                msg: "boardId is required"
            });
        }

        const board = await prisma.boards.findUnique({
            where: {
                id: boardId
            }
        });

        if (!board) {
            return res.status(400).json({
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

        if (!membership) {
            return res.status(400).json({
                msg: "You are not a member of this organization"
            });
        }

        if (!membership.accepted) {
            return res.status(400).json({
                msg: "Your membership has not been accepted"
            });
        }

        const issues = await prisma.issue.findMany({
            where: {
                boardId
            },
            orderBy: {
                position: "asc"
            }
        });

        return res.status(200).json({
            msg: "Issues fetched successfully",
            issues
        });

    } catch (error) {
        console.error("Error while fetching issues:", error);

        return res.status(500).json({
            msg: "Internal Server Error"
        });
    }
};



export const updateIssueController = async (
    req: Request<{ issueId: string }>,
    res: Response
) => {
    try {
        const { issueId } = req.params;
        const { title, description } = req.body;
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({
                msg: "Unauthorized"
            });
        }

        if (!issueId) {
            return res.status(400).json({
                msg: "issueId is required"
            });
        }

        if (!title && !description) {
            return res.status(400).json({
                msg: "At least one field is required"
            });
        }

        const issue = await prisma.issue.findUnique({
            where: {
                id: issueId
            }
        });

        if (!issue) {
            return res.status(404).json({
                msg: "Issue not found"
            });
        }

        const board = await prisma.boards.findUnique({
            where: {
                id: issue.boardId
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
                msg: "You don't have access to this issue"
            });
        }

        const updatedIssue = await prisma.issue.update({
            where: {
                id: issueId
            },
            data: {
                title,
                description
            }
        });

        return res.status(200).json({
            msg: "Issue updated successfully",
            issue: updatedIssue
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            msg: "Internal Server Error"
        });
    }
};

export const deleteIssueController = async (
    req: Request<{ issueId: string }>,
    res: Response
) => {
    try {
        const { issueId } = req.params;
        const userId = req.userId;

        if (!userId) {
            return res.status(400).json({
                msg: "Unauthorized"
            });
        }

        if (!issueId) {
            return res.status(400).json({
                msg: "issueId is required"
            });
        }

        const issue = await prisma.issue.findUnique({
            where: {
                id: issueId
            }
        });

        if (!issue) {
            return res.status(400).json({
                msg: "Issue not found"
            });
        }

        const board = await prisma.boards.findUnique({
            where: {
                id: issue.boardId
            }
        });

        if (!board) {
            return res.status(400).json({
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
            return res.status(400).json({
                msg: "You don't have access to this issue"
            });
        }

        await prisma.issue.delete({
            where: {
                id: issueId
            }
        });

        return res.status(200).json({
            msg: "Issue deleted successfully"
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            msg: "Internal Server Error"
        });
    }
};