import Cs from '../models/cs.js'
import Spv from '../models/spv.js'
import Ticket from '../models/ticket.js'
import TicketLog from '../models/ticket_log.js'
import Feedback from '../models/feedback.js'
import express from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import bodyParser from 'body-parser'
import Conf from '../config.js'
import path from 'path'
import fs from 'fs'
import fileUpload from 'express-fileupload'

const spvRouter = express.Router()

const __dirname = path.resolve();

spvRouter.use(bodyParser.urlencoded({extended: false}));
spvRouter.use(bodyParser.json());
spvRouter.use(fileUpload());

var dir = './public/photo';

// buat folder untuk penyimpan jika belum ada
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
}

spvRouter.post('/register', async (req, res) => {
    //header apabila akan melakukan akses
    var authHeader = req.headers.authorization;
    if (!authHeader) 
        return res.status(401).send({ auth: false, message: 'No token provided.' });
        
    const token = authHeader.split(' ')[1];
    //verifikasi jwt
    jwt.verify(token, Conf.secret, async(err, user) => {
    //   console.log(err);
        if (err) 
        return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
          const jabatan = user.jabatan;
          if (jabatan == '1'){
            try {
                const {email, password, cs_name, default_name} = req.body
                
                if (!req.files || Object.keys(req.files).length === 0) {
                    return res.status(400).send('Harap sertakan foto asli dan alias CS');
                }

                const cs_photo = req.files.cs_photo;
                const default_photo = req.files.default_photo;

                const cs_name_slug =  cs_name.split(' ').join('-');

                const csp_filename = 'csp-' + cs_name_slug + '-' + Date.now() + path.extname(cs_photo.name)
                const dp_filename = 'dp-' + cs_name_slug + '-' + Date.now() + path.extname(default_photo.name)

                cs_photo.mv(__dirname + '/public/photo/'+ csp_filename, function (err) {
                    if (err) 
                        return res.status(500).send(err);
                });

                default_photo.mv(__dirname + '/public/photo/'+ dp_filename, function (err) {
                    if (err) 
                        return res.status(500).send(err);
                });

                var saltRounds = 10;
                const hashedPw = await bcrypt.hash(password, saltRounds)
                const newCust = new Cs(
                    {
                        "email": email,
                        "password": hashedPw,
                        "cs_name": cs_name,
                        "cs_photo": 'photo/'+csp_filename,
                        "default_name": default_name,
                        "default_photo": 'photo/'+dp_filename,
                    })
                const createdCust = await newCust.save()
                res.status(201).json(createdCust)
            } catch (error) {
                console.log(error)
                res.status(500).json({error: error})
            }
        } else {
            res.status(401).json({"status":"Anda bukan Spv, tidak berwenang melakukan registrasi!"})
        }

    })
})

// login
spvRouter.post('/login', async (req, res) => {
    try {
        const {email, password} = req.body;

        const currentUser = await new Promise((resolve, reject) => {
            Spv.find({
                "email": email
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
                        jabatan: currentUser[0].jabatan
                    }, Conf.secret, {
                        expiresIn: 86400 // expires in 24 hours
                    });
                    res.status(200).send({"status": "logged in!", auth: true, token: token});
                } else 
                    res.status(401).json({"status": "wrong password."});
                
            });
        } else {
            res.status(401).json({"status": "user not found"});
        }
    } catch (error) {
        res.status(500).json({error: error})
    }
})

spvRouter.get('/list-cs', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token,  Conf.secret, (err, user) => {
            if(user.jabatan != 1)
                return res.status(403).json({"status": "Anda bukan Spv, tidak berwenang melakukan registrasi!"});
            if (err) {
                console.log(err)
                return res.sendStatus(403);
            }
        });
    } else {
        return res.status(401).send({ auth: false, message: 'No token provided.' });
    }

    // const base_url = req.protocol+"://"+req.headers.host
    const data = await Cs.find({})

    if (data && data.length !== 0) {
        res.json(data)
    } else {
        res.status(404).json({message: 'Data not found'})
}})

spvRouter.patch('/cs-status/:id', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token,  Conf.secret, (err, user) => {
            if(user.jabatan != 1)
                return res.status(403).json({"status": "Anda bukan Spv, tidak berwenang melakukan registrasi!"});
            if (err) {
                console.log(err)
                return res.sendStatus(403);
            }
        });
    } else {
        return res.status(401).send({ auth: false, message: 'No token provided.' });
    }
    
    try{
        const cs = await Cs.findById(req.params.id);
        if(cs){        
            const newVal = cs.acc_status == true ? false : true;           
            cs.acc_status= newVal;
            await cs.save();
            if(newVal)
            {
                res.status(201).json({"status":'CS berhasil diaktifkan'});
            }
            else
            {
                res.status(201).json({"status":'CS berhasil dinonaktifkan'});
            }
        } else {
            res.status(404).json({
                message: 'user not found'
            })
        }
    }
    catch(error){
        console.log(error)
        res.status(500).json({"status":"user not found"});
    }
})

//menghapus cs by id
spvRouter.delete('/cs-list/:id', async (req, res) => {
    //header apabila akan melakukan akses
    var authHeader = req.headers.authorization;
    if (!authHeader) 
        return res.status(401).send({ auth: false, message: 'No token provided.' });
    const token = authHeader.split(' ')[1];
    
    //verifikasi jwt
    jwt.verify(token, Conf.secret, async(err) => {
      if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
        const user = await Cs.findById(req.params.id);
        if(user){
            await user.remove();
            res.json({
                message: 'User removed'
            })
        } else {
            res.status(404).json({
                message: 'User not found'
            })
        }

    })
})

//melihat ticket dengan status 4
spvRouter.get('/ticket', async (req, res) => {
    //header apabila akan melakukan akses
    var authHeader = req.headers.authorization;
    if (!authHeader) 
        return res.status(401).send({ auth: false, message: 'No token provided.' });
    const token = authHeader.split(' ')[1];
    
    //verifikasi jwt
    jwt.verify(token, Conf.secret, async(err) => {
      if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
        const ticket = await Ticket.find({"status": 4});
        res.json(ticket)

    })
})

// update status ticket oleh SPV -- mengisi spv id, spv akan mengambil ticket ini
spvRouter.patch('/ticket/:id', async (req, res) => {    
    //header apabila akan melakukan akses
    var authHeader = req.headers.authorization;
    if (!authHeader) 
        return res.status(401).send({ auth: false, message: 'No token provided.' });
    const token = authHeader.split(' ')[1];
    
    //verifikasi jwt
    jwt.verify(token, Conf.secret, async(err, user) => {
      if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
      const spvId = user.id 
      try {
        
        const ticket = await Ticket.findById(req.params.id);
        if(ticket){
            ticket.spv_id = spvId
            ticket.status = 4
            const updatedTicket = await ticket.save();

            //pembuatan ticket log
            const newLog = new TicketLog(
                {
                    "ticket_id": ticket._id,
                    "status": 4
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


//melihat semua feedback
spvRouter.get('/feedback', async (req, res) => {
    //header apabila akan melakukan akses
    var authHeader = req.headers.authorization;
    if (!authHeader) 
        return res.status(401).send({ auth: false, message: 'No token provided.' });
    const token = authHeader.split(' ')[1];
    
    //verifikasi jwt
    jwt.verify(token, Conf.secret, async(err) => {
      if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
        const feedback = await Feedback.find({});
        res.json(feedback)

    })
})

// update status ticket
spvRouter.patch('/feedback/:id', async (req, res) => {    
    //header apabila akan melakukan akses
    var authHeader = req.headers.authorization;
    if (!authHeader) 
        return res.status(401).send({ auth: false, message: 'No token provided.' });
    const token = authHeader.split(' ')[1];

    //verifikasi jwt
    jwt.verify(token, Conf.secret, async(err, user) => {
      if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
      const Id = user.id 
      try {
        
        const {message} = req.body;
        const feedback = await Feedback.findById(req.params.id);
        if(feedback){
            feedback.sender_id = Id
            feedback.message = message
            feedback.sender_type = 2
            const updatedFeedback = await feedback.save();
            res.json(updatedFeedback);
        } else {
            res.status(404).json({
                message: 'feedback not found'
            })
        }

    } catch (error) {
        console.log(error)
        res.status(500).json({"status": "user not found"});
    }

    })
})


export default spvRouter