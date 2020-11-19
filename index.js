import express from 'express'
import morgan from 'morgan'
import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()


import adminRouter from './controllers/adminController.js'
import csRouter from './controllers/csController.js'
import customerRouter from './controllers/custController.js'
import spvRouter from './controllers/spvController.js'


const app = express();

// Connect to DB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        console.log('Connect to DB Success')
    } catch (error) {
        console.log(error)
    }
} 

connectDB()

// middleware
app.use(morgan('dev'))

//To Get static image
app.use(express.static('public'))

// routing
app.use(express.json());
app.get('/', (req, res) => {
    res.json({message: 'success'});
})

app.use('/admin/', adminRouter)
app.use('/spv/', spvRouter)
app.use('/cs/', csRouter)
app.use('/customer/', customerRouter)

const PORT = process.env.PORT || '3000'

app.listen(PORT, () => {
    console.log(`App listen to port ${PORT}`)
})
