import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRouter from './routes/auth'
import jobsRouter from './routes/jobs'
import runnerRouter from './routes/runner'
import paymentsRouter from './routes/payments'
import adminRouter from './routes/admin'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

app.get('/', (_req, res) => {
  res.json({ message: 'OnTime Errands API is running' })
})

app.use('/api/auth', authRouter)
app.use('/api/jobs', jobsRouter)
app.use('/api/runner', runnerRouter)
app.use('/api', paymentsRouter)
app.use('/api/admin', adminRouter)

const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
