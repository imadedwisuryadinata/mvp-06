import mongoose from 'mongoose'

const complainSchema = mongoose.Schema({
    category: {
        type: String,
        required: true
    }
}, {timestamps: true})

const Complain = mongoose.model('Complain', complainSchema)

export default Complain

