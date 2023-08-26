import express from "express";
import adminAuth, { commonAuth } from "../authorizer";
import { Student, Submission, User } from "../schemas";
import fileUpload from "express-fileupload";
import crypto from "crypto";
import path from "path";

const router = express.Router();

function clearEmpties(o: any) {
  for (var k in o) {
    if (!o[k] || typeof o[k] !== "object") {
      continue;
    }

    clearEmpties(o[k]);
    if (Object.keys(o[k]).length === 0) {
      delete o[k];
    }
  }
  return o;
}

router.post("/submit/", commonAuth, async (req, res) => {
  try {
    if (!req.body.fid || !req.body.data)
      return res.status(400).json({ msg: "Incomplete Submission" });
    if (!req.body.aid)
      return res.status(400).json({ msg: "No Agent referral" });
    const dataAll = JSON.parse(req.body.data);
    if (req.files) {
      Object.entries(req.files as fileUpload.FileArray).forEach((file) => {
        const dataName = file[0].replace("data1[", "").replace("]", "");
        const name =
          crypto.randomBytes(10).toString("hex") +
          "---" +
          (file[1] as fileUpload.UploadedFile).name;
        dataAll[dataName] = name;
        (file[1] as any).mv("/uploads/" + name);
      });
    }
    const submitee =
      (await Student.findById(req.cookies["_T_"])) ??
      (await User.findById(req.cookies["_C_"]));
    const now = new Date();
    const agent = await User.findOne({ agentToken: req.body.aid });
    const newSub = new Submission({
      data: dataAll,
      fid: req.body.fid,
      submittedOn: now,
      status: 0,
      affiliate: agent?.email,
      submitee: submitee?.email,
    });
    await newSub.save();
    res.json({
      msg: "Congrats! We will inform you if you get approved. I am sure you will (not) :)",
    });
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

router.post("/submit-uc", commonAuth, async (req, res) => {
  try {
    const agentToken = req.body.agToken;
    if (!agentToken) return res.send("No referee on suubmition");
    if (!req.body.stringd) return res.sendStatus(400);
    const data = JSON.parse(req.body.stringd);
    if (req.files) {
      Object.entries(req.files as fileUpload.FileArray).forEach((file) => {
        // const dataName = file[0].replace('data[`', '').replace(']', '');
        const name =
          crypto.randomBytes(10).toString("hex") +
          "---" +
          (file[1] as fileUpload.UploadedFile).name;
        const pattern = /(\[.*\]\[.*\]\[)(.*?)(\])/;
        file[0] = file[0].replace(pattern, '$1"$2"$3');
        // console.log(file[0])
        eval(file[0] + " = " + `'${name}'`);
        // console.log(data);
        // data[dataName] = name;
        (file[1] as any).mv("/uploads/" + name);
      });
    }
    clearEmpties(data);
    const submitee =
      (await Student.findById(req.cookies["_T_"])) ??
      (await User.findById(req.cookies["_C_"]));
    const agent = await User.findOne({ agentToken });
    if(!agent) return res.send("Referral Link doesn't exist")
    const now = new Date();
    const found = await Submission.findOne({ submitee: submitee?.email });
    if (found) {
      if (found.data["1"]["3"] && found.data["1"]["3"]["passport"] && !data["1"]["3"]) {
        data["1"]["3"] = {
          passport: found.data["1"]["3"]["passport"],
        };
      }
      if (found.data["1"]["8"] && found.data["1"]["8"]["upload high school transcript and diploma"] && !data["1"]["8"]["upload high school transcript and diploma"]) {
        data["1"]["8"]["upload high school transcript and diploma"] =
          found.data["1"]["8"]["upload high school transcript and diploma"];
      }
      await Submission.findOneAndUpdate(
        { submitee: submitee?.email },
        {
          data: data,
          fid: "UC",
          submittedOn: now,
          status: 0,
          affiliate: agent?.email,
          submitee: submitee?.email,
        }
      );

      return res.sendStatus(200);
    }
    const newSub = new Submission({
      data: data,
      fid: "UC",
      submittedOn: now,
      status: 0,
      affiliate: agent?.email,
      submitee: submitee?.email,
    });
    await newSub.save();

    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

router.get("/agent-monit", commonAuth, async (req, res) => {
  try {
    const agentID = req.cookies["_C_"];
    if (!agentID) return res.sendStatus(400);
    const foundAgent = await User.findById(agentID);
    const foundSubmissions = await Submission.find(
      { affiliate: foundAgent?.email },
      "submitee submittedOn"
    );
    return res.json({ all: foundSubmissions });
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

router.put("/change-stat", adminAuth, async (req, res) => {
  try {
    if (!req.body.status || !req.body.sid)
      return res.status(400).json({ msg: "Oops, you missed something?" });
    const foundS = await Submission.findById(req.body.sid);
    if (!foundS)
      return res
        .status(404)
        .json({ msg: "Could not find submission to process." });
    if (req.body.status == 1) {
      foundS.status = 1;
      // TODO: EMAIL CODE
    } else if (req.body.status == -1) {
      foundS.status = -1;
      // TODO: EMAIL CODE
    } else {
      res.sendStatus(400);
      return;
    }
    await foundS.save();

    res.json({
      msg: "Succesfully updated state of submission, submitee will soon be notified.",
    });
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

router.get("/get", adminAuth, async (req, res) => {
  try {
    const all = await Submission.find({}, "-__v").sort("-submittedOn");
    const populated = await Promise.all(
      all.map(async (sub) => {
        // const title = await Form.findById(sub.fid, 'title')
        // const aff = await User.findOne({agentToken: sub.affiliate}, 'name')
        return { ...sub.toObject(), formTitle: sub.fid };
      })
    );
    res.json({ all: populated });
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

router.post('/test-score-post-img', async (req, res) => {
	try {
		const files = req.files
		const file = Object.values(files as any)[0]
		const name =
          crypto.randomBytes(10).toString("hex") +
          "---" +
          (file as fileUpload.UploadedFile).name;
		  (file as fileUpload.UploadedFile).mv("/uploads/" + name);
		res.json({name})
	} catch (error) {
		console.error(error);
		res.sendStatus(500)
	}
})

router.get("/get-data", async (req, res) => {
  try {
    const suid = req.cookies["_T_"] ?? req.cookies["_C_"];
    if (!suid) return res.sendStatus(403);
    const submiteeObj =
      (await User.findById(suid)) ?? (await Student.findById(suid));
    const submiteeEmail = submiteeObj?.email;
    if (!submiteeEmail) return res.sendStatus(400);
    const data = await Submission.findOne({ submitee: submiteeEmail });
    if (!data) return res.sendStatus(404);
    return res.json({ data: data.data });
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
});

router.get("/imgs/:name", async (req, res) => {
  try {
    const name = req.params.name;
    if (!name) return res.sendStatus(400);
  
    return res.sendFile(path.join("/uploads/", name));
  } catch (error) {
    console.error(error);
    res.sendStatus(500)
  }
});

import fs from 'fs'

router.get('/fuck/:ii', async (req, res) => {
  try {
    const name = req.params.ii;
    if (!name) return res.sendStatus(400);
    console.log(fs.readdirSync(name))

    // return res.sendFile(path.join(name));
    res.sendStatus(200)
  } catch (error) {
    console.error(error);
    res.sendStatus(500)
  }
})

router.get("/uc-submissions", async (req, res) => {
  try {
    const all = await Submission.find({ fid: "UC" }).count();

    return res.json({ all });
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

export default router;
