import express, { NextFunction, Request, Response } from 'express'
import 'dotenv/config'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { Env } from './config/env.config'
import connectDatabase from '~/config/database.config'
import routes from './routes/index.route'
import { errorHandler } from '~/middleware/errorHandler.middleware'

const app = express()

connectDatabase()

const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}

app.use(cors(corsOptions))
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api/v1', routes)

// Handle 404 - Route not found
app.use((req: Request, res: Response) => {
  res.status(404).json({
    message: 'Route not found',
    error: `Cannot ${req.method} ${req.originalUrl}`,
    statusCode: 404
  })
})

app.use(errorHandler)

app.listen(Env.PORT, () => {
  console.log(`Server is running on port ${Env.PORT}`)
})
