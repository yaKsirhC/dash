import express from "express"
import adminAuth, { commonAuth } from "../authorizer"
import {  Student, Submission, User } from "../schemas"
import fileUpload from "express-fileupload"
import crypto from 'crypto'
import path from "path"

const router = express.Router()

router.post('/submit/', commonAuth, async (req, res) => {
	try {
		if (!req.body.fid || !req.body.data) return res.status(400).json({ msg: "Incomplete Submission" })
		if (!req.body.aid) return res.status(400).json({ msg: "No Agent referral" })
		const dataAll = JSON.parse(req.body.data);
		if (req.files) {
			Object.entries(req.files as fileUpload.FileArray).forEach(file => {
				const dataName = file[0].replace('data1[', '').replace(']', '');
				const name = crypto.randomBytes(10).toString("hex") + '---' + (file[1] as fileUpload.UploadedFile).name;
				dataAll[dataName] = name;
				(file[1] as any).mv('uploads/' + name)
			})
		}
		const submitee = await Student.findById(req.cookies['_T_']) ?? await User.findById(req.cookies['_C_'])
		const now = new Date()
		const agent = await User.findOne({ agentToken: req.body.aid })
		const newSub = new Submission({
			data: dataAll,
			fid: req.body.fid,
			submittedOn: now,
			status: 0,
			affiliate: agent?.email,
			submitee: submitee?.email
		})
		await newSub.save()
		res.json({ msg: "Congrats! We will inform you if you get approved. I am sure you will (not) :)" })
	} catch (error) {
		console.error(error)
		res.sendStatus(500)
	}
})

router.post('/submit-uc', commonAuth ,async (req, res) => {
	try {
		const agentToken = req.body.agToken
		if(!agentToken) return res.sendStatus(400)
		if(!req.body.stringd) return res.sendStatus(400)
		const data = JSON.parse(req.body.stringd)
		// const passport = req.files?.["data[1][3][passport]"]
		// const diploma = req.files?.['data[1][8][upload high school transcript and diploma]']
		// if(diploma){
		// 	const name = crypto.randomBytes(10).toString("hex") + '---' + (passport as fileUpload.UploadedFile).name;
		// 	(passport as fileUpload.UploadedFile).mv('uploads/' + name)
		// 	data['1']['8']['data[1][8][upload high school transcript and diploma]'] = name;
		// }
		// if(passport){
		// 	const name = crypto.randomBytes(10).toString("hex") + '---' + (passport as fileUpload.UploadedFile).name;
		// 	(passport as fileUpload.UploadedFile).mv('uploads/' + name)
		// 	data['1']['3']['passport'] = name;
		// }
		if (req.files) {
			Object.entries(req.files as fileUpload.FileArray).forEach(file => {
				const dataName = file[0].replace('data1[', '').replace(']', '');
				const name = crypto.randomBytes(10).toString("hex") + '---' + (file[1] as fileUpload.UploadedFile).name;
				data[dataName] = name;
				(file[1] as any).mv('uploads/' + name)
			})
		}

		const submitee = await Student.findById(req.cookies['_T_']) ?? await User.findById(req.cookies['_C_'])
		const agent = await User.findOne({agentToken})
		const now = new Date()
		if ((await Submission.find({ submitee: submitee?.email })).length > 0) {
			await Submission.findOneAndUpdate({ submitee: submitee?.email }, {
				data: data,
				fid: "UC",
				submittedOn: now,
				status: 0,
				affiliate: agent?.email,
				submitee: submitee?.email
			})
			
			return res.sendStatus(200)
		}
		const newSub = new Submission({
			data: data,
			fid: "UC",
			submittedOn: now,
			status: 0,
			affiliate: agent?.email,
			submitee: submitee?.email
		})
		await newSub.save()

		res.sendStatus(200)
	} catch (error) {
		console.error(error)
		res.sendStatus(500)
	}
})

router.get('/agent-monit', commonAuth ,async (req, res) => {
	try {
		const agentID = req.cookies['_C_']
		if(!agentID) return res.sendStatus(400)
		const foundAgent = await User.findById(agentID)
		const foundSubmissions = await Submission.find({affiliate: foundAgent?.email}, 'submitee submittedOn')
		return res.json({all: foundSubmissions});
	} catch (error) {
		console.error(error);
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

		res.json({ msg: "Succesfully updated state of submission, submitee will soon be notified." })

	} catch (error) {
		console.error(error)
		res.sendStatus(500)
	}
})

router.get('/get', adminAuth, async (req, res) => {
	try {
		const all = await Submission.find({}, "-__v").sort('-submittedOn')
		const populated = await Promise.all(all.map(async sub => {
			// const title = await Form.findById(sub.fid, 'title')
			// const aff = await User.findOne({agentToken: sub.affiliate}, 'name')
			return { ...sub.toObject(), formTitle: sub.fid }
		}))
		res.json({ all: populated })
	} catch (error) {
		console.error(error)
		res.sendStatus(500)
	}
})

router.get('/imgs/:name', async (req, res) => {
	const name = req.params.name
	if(!name) return res.sendStatus(400)

	return res.sendFile(path.join(__dirname, '../../uploads/', name))
})

router.get('/uc-submissions', async (req, res) => {
	try {
		const all = await Submission.find({fid: 'UC'}).count()

		return res.json({all})
	} catch (error) {
		console.error(error)
		res.sendStatus(500)
	}
})

export default router