import { Router } from 'express'
const { PrismaClient } = require('@prisma/client')

const app = express()
const prisma = new PrismaClient()
const mainRountes = require('routes/index')

app.use(express())
app.use(mainRountes)

app.listen(3000)