import mongoose from 'mongoose'

const ticketSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    picture: {
        type: String,
        //required: true
    },
    complain_category: {
        type:String,
        required: true
    },
    status: {
        type: Number,
        //required: true
    },
    customer_id: {
        type:mongoose.Schema.Types.ObjectId,
        required: true
    },
    cs_id: {
        type:mongoose.Schema.Types.ObjectId,
        default : null
    },
    spv_id: {
        type:mongoose.Schema.Types.ObjectId,
        default : null
    },
    rate_from_cust: {
        type: Number,
        default : null
    },
    rate_from_cs: {
        type: Number,
        default : null
    },
    rate_from_spv: {
        type: Number,
        default : null
    }

}, {timestamps: true})

const Ticket = mongoose.model('Ticket', ticketSchema)

export default Ticket

