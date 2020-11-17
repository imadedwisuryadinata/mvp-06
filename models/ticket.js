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
        required: true
    },
    customer_id: {
        type:mongoose.Schema.Types.ObjectId,
        required: true
    },
    cs_id: {
        type:mongoose.Schema.Types.ObjectId,
        required: true
    },
    spv_id: {
        type:mongoose.Schema.Types.ObjectId,
        required: true
    },
    rate_from_cust: {
        type: Number,
        required: true
    },
    rate_from_cs: {
        type: Number,
        required: true
    },
    rate_from_spv: {
        type: Number,
        required: true
    }

}, {timestamps: true})

const Ticket = mongoose.model('Ticket', ticketSchema)

export default ticketSchema

