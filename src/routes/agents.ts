import express from 'express'
import { User } from '../schemas'

const router = express.Router()

router.get("/request-token", async (req, res) => {
	try {
		if(!req.cookies["_C_"]) return res.sendStatus(400)
		const found = await User.findById(req.cookies["_C_"])
		if(!found) return res.status(404).json({msg: "agent not found"})
		return res.json({agentToken: found.agentToken})
	} catch (error) {
		console.error(error)
		res.sendStatus(500)
	}
} )

router.get('/all', async (req, res) => {
	try {
		const all = await User.find({}, "-_id email name agentToken")
		return res.json({all})
	} catch (error) {
		console.error(error)
		res.sendStatus(500)
	}
})

export default router