import express from "express"
import adminAuth from "../authorizer"
import { Form, Submission } from '../schemas'

const router = express.Router()

router.post("/create", adminAuth, async (req, res) => {
	try {

		if (!req.body.formBody || !req.body.formName) return res.status(409).json({ msg: "Missing Fields" })
		const formName = req.body.formName
		const newForm = await Form.create({
			title: formName,
			body: req.body.formBody
		})

		await newForm.save()

		res.status(200).json({ msg: "Form was created.", fid: newForm._id })
	} catch (error) {
		console.error(error)
		res.sendStatus(500)
	}
})

router.get("/all", async (req, res) => {
	try {
		const all = await Form.find({}, "-body -__v")
		const mapped = await Promise.all(all.map(async sample => {
			const found = await Submission.find({"fid": sample._id})
			return {...sample.toObject(), submissions:  found.length}
		}))
		res.json({all: mapped})
	} catch (error) {
		console.error(error)
		res.sendStatus(500)
	}
})

router.put("/put", async (req, res) => {
	try {
		if (!req.body.fid || !req.body.newFormBody || !req.body.formName) return res.status(400).json({ msg: "Bad Request, please review the request and try again." })
		const putForm = await Form.findById(req.body.fid as string);
		(putForm as any).body = req.body.newFormBody;
		(putForm as any).title = req.body.formName;
		await putForm?.save();

		return res.json({ msg: "updated form succesfully" })
	} catch (error) {
		console.error(error)
		res.sendStatus(500)
	}
})

router.delete("/delete", async (req, res) => {
	try {
		if (!req.body.fid) return res.status(400).json({ msg: "Bad Request, please review the request and try again." })
		await Form.findByIdAndDelete(req.body.fid)
		return res.json({ msg: "form was deleted" })
	} catch (error) {
		console.error(error)
		res.sendStatus(500)
	}
})

// function foo(conds: []){
// 	if()
// }

router.get("/get/:id/", async (req, res) => {
	try {
		const id = req.params.id
		if (!id) return res.sendStatus(400)
		const foundForm = await Form.findById(id)
		if (!foundForm) return res.status(404).json({ msg: "Resource Not Found" })
		return res.json({ form: foundForm })
	} catch (error) {
		console.error(error)
		res.sendStatus(500)
	}
})

export default router