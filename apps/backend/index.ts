import express, { Request } from 'express'
import userRouter from './routes/userRoute'

const app = express()

app.use(express.json())

app.use('/api/v1/user', userRouter)

app.listen(3000, () => {
    console.log(`Server is running on http://localhost:3000`)
})