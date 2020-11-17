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
    nama_asli: {
        type: String,
        required: true
    },
    foto_asli: {
        type: String,
        //required: true        
        default : null
    },
    nama_palsu: {
        type: String,
        required: true
    },
    foto_palsu: {
        type: String,
        default : null
        //required: true
    },
    jabatan: {
        type: Number,
        //required: true,
        default : "2"
    },
    rating: {
        type: Number,
        //required: true        
        default : null
    },
    status: {
        type: Boolean,
        //required: true        
        default : true
    }
}, {timestamps: true})

const Cs = mongoose.model('Cs', csSchema)

export default Cs

