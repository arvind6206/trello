import {Router} from 'express'
import { addIssueController, getIssueController, getAllIssueController, updateIssueController, deleteIssueController } from '../controllers/issueController';
const issueRouter = Router()

issueRouter.post('/add', addIssueController)
issueRouter.get('/:issueId', getIssueController)
issueRouter.get('/board/:boardId', getAllIssueController)
issueRouter.put('/', updateIssueController)
issueRouter.delete('/:isueId', deleteIssueController)


export default issueRouter;