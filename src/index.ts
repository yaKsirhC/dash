import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import cookieParser from "cookie-parser"
import cors from 'cors'
import fileUpload from 'express-fileupload'

import mongoose from 'mongoose'
mongoose.connect(process.env.MONGO_URI as string).finally(() => console.log("Mongo is running")).catch(er => console.error(er))

const app = express()

app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: false}));
app.use(cookieParser(process.env.COOKIE_SECRET))
app.use(cors({origin: "http://localhost:5173" , credentials: true}))
app.use(fileUpload())
app.use(express.static("public"))

// ACTUAL SERVER BELOW
import formsRouter from './routes/forms'
import agentsRouter from './routes/agents'
import submissionsRouter from './routes/submissions'
import authRouter from './routes/auth'
import path from 'path'

app.use('/api/forms', formsRouter)
app.use('/api/agents', agentsRouter)
app.use('/api/submissions', submissionsRouter)
app.use('/api/auth', authRouter)

app.get('*', (req, res) => {
	res.sendFile(path.join(__dirname, '../public/index.html'));
});


app.listen(process.env.PORT || 8000, () => console.log('server running on 8k, while u just got caught on 4k.'))