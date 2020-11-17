import mongoose from 'mongoose'

const spvSchema = mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    jabatan: {
        type: Number,
        required: true
    }
}, {timestamps: true})

const Spv = mongoose.model('Spc', spvSchema)

export default Spv

