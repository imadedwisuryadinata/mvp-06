import mongoose from 'mongoose'

const feedbackSchema = mongoose.Schema({
    cust_id : {
        type:mongoose.Schema.Types.ObjectId,
        required:true
    },
    judul: {
        type: String,
        required: true
    },
    detail: {
        type: String,
        required: true
    },
    foto: {
        type: String,
        required: true
    },
    kategori: {
        type: Number,
        required: true
    },
    no_tiket: {
        type: String,
        required: true
    },
    status: {
        type: Boolean,
        required: true
    }
}, {timestamps: true})

const Feedback = mongoose.model('Feedback', feedbackSchema)

export default Feedback

