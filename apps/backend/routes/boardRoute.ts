import {Router} from 'express'
import { addBoardController, getBoardController } from '../controllers/boardController'

const boardRouter = Router()

boardRouter.post('/add', addBoardController)
boardRouter.get('/', getBoardController)


export default boardRouter