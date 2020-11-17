import mongoose from 'mongoose'

const ticketLogSchema = mongoose.Schema({
    ticket_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    status: {
        type: Number,
        required: true
    }

}, {timestamps: true})

const TicketLog = mongoose.model('TicketLog', ticketLogSchema)

export default ticketLogSchema

