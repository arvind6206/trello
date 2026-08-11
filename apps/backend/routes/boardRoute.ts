import {Router} from 'express'
import { addBoardController, deleteBoardController, getBoardController } from '../controllers/boardController'

const boardRouter = Router()

boardRouter.post('/add', addBoardController)
boardRouter.get('/', getBoardController)
boardRouter.delete('/:id', deleteBoardController)


export default boardRouter