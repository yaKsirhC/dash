import express from "express"
import adminAuth from "../authorizer"
import { Submission } from "../schemas"

const router = express.Router()

router.post('/submit/', async (req, res) => {
	try {
		if (!req.body.fid || !req.body.data || !req.body.aid) return res.status(400).json({ msg: "Incomplete Submission" })
		const now = new Date()
		const newSub = new Submission({
			data: req.body.data,
			fid: req.body.fid,
			submittedOn: now,
			status: 0,
			affiliate: req.body.aid,
			// submiteeEmail: req.body.submitee
		})
		await newSub.save()
		res.json({ msg: "Congrats! We will inform you if you get approved. I am sure you will (not) :)" })
	} catch (error) {
		console.error(error)
		res.sendStatus(500)
	}
})

router.put('/change-stat', adminAuth, async (req, res) => {
	try {
		if (!req.body.status || !req.body.sid) return res.status(400).json({ msg: "Oops, you missed something?" })
		const foundS = await Submission.findById(req.body.sid)
		if (!foundS) return res.status(404).json({ msg: "Could not find submission to process." })
		if (req.body.status == 1) {
			foundS.status = 1
			// TODO: EMAIL CODE
			
		} else if (req.body.status == -1) {
			foundS.status = -1
			// TODO: EMAIL CODE
			
		} else {
			res.sendStatus(400)
			return;
		}
		await foundS.save()

		res.json({msg: "Succesfully updated state of submission, submitee will soon be notified."})

	} catch (error) {
		console.error(error)
		res.sendStatus(500)
	}
})

router.get('/get', adminAuth, async (req, res) => {
	try {
		const all = await Submission.find({}, "-__v")
		res.json({all})
	} catch (error) {
		console.error(error)
		res.sendStatus(500)
	}
})
export default router