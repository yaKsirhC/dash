import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
	name: String,
	email: String,
	password: String,
	agentToken: String
})

const studentSchema = new mongoose.Schema({
	name: String,
	email: String,
	password: String,
})

const formSchema = new mongoose.Schema({
	title: String ,
	body: Object,
})

const submissionSchema = new mongoose.Schema({
	data: Object,
	fid: String,
	status: Number, // 1 approved 0 undecided -1 declined
	submittedOn: Date,
	affiliate: String,
	submitee: String
})

const User = mongoose.model('User', userSchema)
const Form = mongoose.model('Form', formSchema)
const Submission = mongoose.model('Submission', submissionSchema) 
const Student = mongoose.model('Student', studentSchema) 

export {
	User,
	Form,
	Submission,
	Student
}