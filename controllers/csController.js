import Cs from '../models/cs.js'
import Ticket from '../models/ticket.js'
import TicketLog from '../models/ticket_log.js'
import express from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import bodyParser from 'body-parser'
import Conf from '../config.js'

const csRouter = express.Router()

csRouter.use(bodyParser.urlencoded({extended: false}));
csRouter.use(bodyParser.json());


// login
csRouter.post('/login', async (req, res) => {
    try {
        const {email, password} = req.body;

        const currentUser = await new Promise((resolve, reject) => {
            Cs.find({
                "email": email,
                "acc_status" : true
            }, function (err, user) {
                if (err) 
                    reject(err)
                
                resolve(user)
            })
        })
        // cek apakah ada user?
        if (currentUser[0]) { // check password
            bcrypt.compare(password, currentUser[0].password).then((result) => {
                if (result) { // urus token disini
                    var token = jwt.sign({
                        id: currentUser[0]._id,
                        jabatan: currentUser[0].jabatan,
                    }, Conf.secret, {
                        expiresIn: 86400 // expires in 24 hours
                    });
                    res.status(200).send({"status": "logged in!", auth: true, token: token});
                   
                } else 
                    res.status(201).json({"status": "wrong password."});
                
            });
        } else {
            res.status(401).json({"status": "user not found"});
        }
    } catch (error) {
        res.status(500).json({error: error})
    }
})


csRouter.get('/ticket', async (req, res) => {
    //header apabila akan melakukan akses
    var token = req.headers.authorization;
    if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
    
    //verifikasi jwt
    jwt.verify(token, Conf.secret, async(err) => {
      if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
        const ticket1 = await Ticket.find({});
        res.json(ticket1)

    })
})

csRouter.get('/ticket/:id', async (req, res) => {
    //header apabila akan melakukan akses
    var token = req.headers.authorization;
    if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
    
    //verifikasi jwt
    jwt.verify(token, Conf.secret, async(err, user) => {
      if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
        const cs_id = user._id
        const ticket1 = await Ticket.findById(req.params.id);
        res.json(ticket1)

    })
})

// update status ticket
csRouter.patch('/ticket/:id', async (req, res) => {    
    //header apabila akan melakukan akses
    var token = req.headers.authorization;
    if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
    
    //verifikasi jwt
    jwt.verify(token, Conf.secret, async(err, user) => {
      if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
      const csId = user.id 
      try {
        
        const {status} = req.body;
        const ticket = await Ticket.findById(req.params.id);
        if(ticket){
            ticket.cs_id = csId
            ticket.status = status
            const updatedTicket = await ticket.save();

            //pembuatan ticket log
            const newLog = new TicketLog(
                {
                    "ticket_id": ticket._id,
                    "status": status
                }
            )
            await newLog.save()
            res.json(updatedTicket);
        } else {
            res.status(404).json({
                message: 'ticket not found'
            })
        }

    } catch (error) {
        console.log(error)
        res.status(500).json({"status": "user not found"});
    }

    })
})

export default csRouter