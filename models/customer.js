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
    validated_email_at: {
        type: Date,
        default : null
    },
    validated_acc_at: {
        type: Date,
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

