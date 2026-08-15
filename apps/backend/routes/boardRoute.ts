import { Router } from "express";
import {
    addBoardController,
    deleteBoardController,
    getBoardController,
    getSingleBoardController,
    updateBoardController
} from "../controllers/boardController";
import { authMiddleware } from "../middleware/auth";

const boardRouter = Router();

boardRouter.get("/org/:orgId", authMiddleware, getBoardController);

boardRouter.post("/org/:orgId", authMiddleware, addBoardController);

boardRouter.get("/:boardId", authMiddleware, getSingleBoardController);

boardRouter.patch("/:boardId", authMiddleware, updateBoardController);

boardRouter.delete("/:boardId", authMiddleware, deleteBoardController);

export default boardRouter;