import {Router} from 'express'
import { addIssueController, getIssueController, getAllIssueController, updateIssueController, deleteIssueController } from '../controllers/issueController';
import { authMiddleware } from '../middleware/auth';

const issueRouter = Router()

issueRouter.post('/add', authMiddleware, addIssueController)
issueRouter.get('/:issueId', authMiddleware, getIssueController)
issueRouter.get('/board/:boardId', authMiddleware, getAllIssueController)
issueRouter.put('/', authMiddleware, updateIssueController)
issueRouter.delete('/:issueId', authMiddleware, deleteIssueController)


export default issueRouter;