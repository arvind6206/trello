import { Router } from "express";
import {
    addBoardController,
    deleteBoardController,
    getBoardController,
    getSingleBoardController,
    updateBoardController
} from "../controllers/boardController";

const boardRouter = Router();

boardRouter.get("/org/:orgId", getBoardController);

boardRouter.post("/org/:orgId", addBoardController);

boardRouter.get("/:boardId", getSingleBoardController);

boardRouter.patch("/:boardId", updateBoardController);

boardRouter.delete("/:boardId", deleteBoardController);

export default boardRouter;