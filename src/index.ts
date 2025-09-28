import express, { NextFunction, Request, Response } from 'express'
import 'dotenv/config'
import cors from 'cors'
import { Env } from './config/env.config'
import connectDatabase from '~/config/database.config'

const app = express()

connectDatabase()

const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}

app.use(cors(corsOptions))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.listen(Env.PORT, () => {
  console.log(`Server is running on port ${Env.PORT}`)
})
