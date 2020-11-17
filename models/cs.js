import mongoose from 'mongoose'

const csSchema = mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    cs_name: {
        type: String,
        required: true
    },
    cs_photo: {
        type: String,
        //required: true        
        default : null
    },
    default_name: {
        type: String,
        required: true
    },
    default_photo: {
        type: String,
        default : null
        //required: true
    },
    jabatan: {
        type: Number,
        //required: true,
        default : "2"
    },
    acc_status: {
        type: Boolean,
        //required: true        
        default : true
    }
}, {timestamps: true})

const Cs = mongoose.model('Cs', csSchema)

export default Cs

