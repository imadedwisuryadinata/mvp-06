import mongoose from 'mongoose'

const feedbackSchema = mongoose.Schema({
    ticket_id : {
        type:mongoose.Schema.Types.ObjectId,
        required:true
    },
    message: {
        type: String,
        required: true
    },
    sender_id: {
        type: String,
        required: true
    },
    sender_type: {
        type: Number,
        required: true
    }
}, {timestamps: true})

const Feedback = mongoose.model('Feedback', feedbackSchema)

export default Feedback

