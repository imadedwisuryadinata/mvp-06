import mongoose from 'mongoose'

const spvSchema = mongoose.Schema({
    response: {
        type: String,
        required: true
    },
    status: {
        type: Boolean,
        required: true
    },
    rating_cs_time: {
        type: Number,
        default: Date.now
    }
}, {timestamps: true})

const Spv = mongoose.model('Spc', spvSchema)

export default Spv

