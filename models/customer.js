import mongoose from 'mongoose'

const customerSchema = mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    validasi: {
        type: Boolean,
        default : null
    },
    nama: {
        type: String,
        //required: true,
        default : null
    },
    ktp: {
        type: String,
        //required: true,
        default : null
    },
    no_rek: {
        type: String,
        //required: true,
        default : null
    }
}, {timestamps: true})

const Customer = mongoose.model('Customer', customerSchema)

export default Customer

