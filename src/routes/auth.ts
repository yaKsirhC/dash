import express from "express"
import { Student, User } from "../schemas"
import bcrypt from 'bcrypt'
import crypto from 'crypto'

const router = express.Router()

router.post('/register-agent', async (req, res) => {
	try {
		if (!req.body.password || !req.body.email || !req.body.name) return res.sendStatus(400)
		const match = await User.findOne({ email: req.body.email })
		if (match) {
			return res.status(419).json({msg: "Agent Email Already Exists"})
		}
		const salt = await bcrypt.genSalt(10)
		const password = await bcrypt.hash(req.body.password, salt)
		const creds = {
			email: req.body.email,
			password,
			name: req.body.name,
			agentToken: crypto.randomBytes(10).toString("hex")
		}
		const newUser = new User(creds)
		await newUser.save()

		return res.status(200).json({msg: "Agent Registered Succesfully."})
	} catch (error) {
		console.error(error)
		res.status(500).json(error)
	}
})

router.post('/log-in' ,async (req, res) => {
	try {
		if (!req.body.password || !req.body.email) return res.status(400).json({msg: "Missing Fields"})
		const email = req.body.email
		const password = req.body.password
		const emailMatch = await User.findOne({ email }) ?? await Student.findOne({ username: email })
		if (emailMatch) {
			const actualPassword = emailMatch.password
			const comparison = await bcrypt.compare(password, actualPassword as string)
			if (comparison) return res.cookie('_C_', emailMatch.id, { httpOnly: false }).status(200).json({msg: "Logged in"})
			return res.status(400).json({ msg: "Double Check Everything! The email or password is incorrect." })
		}
		return res.status(404).json({ msg: "User doesn't exist." })
	} catch (error) {
		console.error(error)
		res.status(400).json(error)
	}
})

router.post('/sign-up-student', async (req, res) => {
	try {
		if (!req.body.password || !req.body.username) return res.sendStatus(400)
		const match = await Student.findOne({ username: req.body.username })
		if (match) {
			return res.status(419).json({msg: "Log in, Student already Registered"})
		}
		const salt = await bcrypt.genSalt(10)
		const password = await bcrypt.hash(req.body.password, salt)
		const creds = {
			username: req.body.username,
			password,
		}
		const newUser = new Student(creds)
		await newUser.save()

		return res.cookie('_T_', newUser.id, { httpOnly: false }).sendStatus(200)
	} catch (error) {
		console.error(error)
		res.status(500).json(error)
	}
})

export default router