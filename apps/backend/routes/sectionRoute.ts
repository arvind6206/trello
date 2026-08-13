import { Router } from "express";
import {
  addSectionController,
  getAllSectionController,
  getSingleSectionController,
  deleteSectionController,
  updateSectionController,
} from "../controllers/sectionController";
import { authMiddleware } from "../middleware/auth";

const sectionRouter = Router();

sectionRouter.post("/board/:boardId", authMiddleware, addSectionController);

sectionRouter.get("/board/:boardId", authMiddleware, getAllSectionController);

sectionRouter.get("/:sectionId", authMiddleware, getSingleSectionController);

sectionRouter.patch("/:sectionId", authMiddleware, updateSectionController);

sectionRouter.delete("/:sectionId", authMiddleware, deleteSectionController);

export default sectionRouter;
