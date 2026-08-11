import {Router} from 'express'
import { addBoardController, deleteBoardController, getBoardController, updateBoardController } from '../controllers/boardController'

const boardRouter = Router()

boardRouter.post('/add', addBoardController)
boardRouter.get('/', getBoardController)
boardRouter.delete('/:id', deleteBoardController)
boardRouter.put('/:id', updateBoardController)


export default boardRouter