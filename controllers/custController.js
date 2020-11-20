import Customer from '../models/customer.js'
import Ticket from '../models/ticket.js'
import Complain from '../models/complain_category.js'
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

const customerRouter = express.Router()

const __dirname = path.resolve();

customerRouter.use(bodyParser.urlencoded({extended: false}));
customerRouter.use(bodyParser.json());
customerRouter.use(fileUpload());


var dir = './public/ticket';

// buat folder untuk penyimpanan jika belum ada
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
}

customerRouter.post('/register', async (req, res) => {
    try {

        const {email, password, nama, ktp, no_rek} = req.body

        var saltRounds = 10;
        const hashedPw = await bcrypt.hash(password, saltRounds)
        const newCust = new Customer(
            {
                "email": email,
                "password": hashedPw,
                "nama": nama,
                "ktp": ktp,
                "no_rek": no_rek
            })
        const createdCust = await newCust.save()
        res.status(201).json(createdCust)
    } catch (error) {
        console.log(error)
        res.status(500).json({error: error})
    }

})


// login
customerRouter.post('/login', async (req, res) => {
    try {
        const {email, password} = req.body;

        const currentUser = await new Promise((resolve, reject) => {
            Customer.find({
                "email": email,
                //"validated_email_at" : null
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
                    if (currentUser[0].nama == null | currentUser[0].ktp == null | currentUser[0].no_rek == null){
                        res.status(200).send({"status": "logged in! Silahkan mengisi data nama, ktp dan no. rekening", auth: true, token: token, id: currentUser[0]._id});  
                    } else {
                        res.status(200).send({"status": "logged in!", auth: true, token: token});
                    }
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


// update user data
customerRouter.patch('/update/:id', async (req, res) => {
    
    //header apabila akan melakukan akses
    var authHeader = req.headers.authorization;
    if (!authHeader) 
        return res.status(401).send({ auth: false, message: 'No token provided.' });
    const token = authHeader.split(' ')[1];
    
    //verifikasi jwt
    jwt.verify(token, Conf.secret, async(err, user) => {
      if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });

      try {
        const { nama, ktp, no_rek } = req.body;
        const user = await Customer.findById(req.params.id);
        if(user){
            user.nama= nama;
            user.ktp = ktp;
            user.no_rek = no_rek
            const updatedUser = await user.save();

            res.json(updatedUser);
        } else {
            res.status(404).json({
                message: 'user not found'
            })
        }

    } catch (error) {
        console.log(error)
        res.status(500).json({"status": "user not found"});
    }

    })
})

customerRouter.get('/detail', async (req, res) => {
    //header apabila akan melakukan akses
    var authHeader = req.headers.authorization;
    if (!authHeader) 
        return res.status(401).send({ auth: false, message: 'No token provided.' });
    const token = authHeader.split(' ')[1];;
    
    //verifikasi jwt
    jwt.verify(token, Conf.secret, async(err, user) => {
      if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
      const id = user.id;
        const user1 = await Customer.find({"_id" : id});
        res.json(user1[0])
        console.log(user1)

    })
})

customerRouter.post('/ticket', async (req, res) => {


    //header apabila akan melakukan akses
    var authHeader = req.headers.authorization;
    if (!authHeader) 
        return res.status(401).send({ auth: false, message: 'No token provided.' });

    const token = authHeader.split(' ')[1];
    //verifikasi jwt
    jwt.verify(token, Conf.secret, async(err, user) => {
        if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
        try {
            const id = user.id;
            const {title, description, complain_category} = req.body
            
            //jika gambar wajib
            if (!req.files || Object.keys(req.files).length === 0) {
                return res.status(400).send('Harap sertakan bukti gambar');
            }

            const picture = req.files.picture;
            const title_slug =  title.split(' ').join('-'); //me-replace spasi dengan dash

            const pictureName = 'ticket-' + title_slug + '-' + Date.now() + path.extname(picture.name)
            picture.mv(__dirname + '/public/ticket/'+ pictureName, function (err) {
            if (err) 
                return res.status(500).send(err);
            });

            const newTicket = new Ticket(
            {
                "customer_id": id,
                "title": title,
                "description": description,
                "picture": 'ticket/'+pictureName,
                "complain_category": complain_category,
                "status": 1
            })
            const createdTicket = await newTicket.save()
    
            //pembuatan complain category
            const newCategory = new Complain(
                {
                    "category": complain_category
                })
            await newCategory.save()

            //pembuatan ticket log
            const newLog = new TicketLog(
                {
                    "ticket_id": newTicket._id,
                    "status": 1
                }
            )
            await newLog.save()

            res.status(201).json(createdTicket)
        } catch (error) {
            console.log(error)
            res.status(500).json({error: error})
        }
    })
})


customerRouter.get('/ticket/detail', async (req, res) => {
    //header apabila akan melakukan akses
    var authHeader = req.headers.authorization;
    if (!authHeader) 
        return res.status(401).send({ auth: false, message: 'No token provided.' });
    const token = authHeader.split(' ')[1];
    
    //verifikasi jwt
    jwt.verify(token, Conf.secret, async(err, user) => {
      if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
      const id = user.id;
        const user1 = await Ticket.find({"customer_id" : id});
        res.json(user1)

    })
})

//melihat feedback dari ticket yang sudah dibuat
// customerRouter.get('/feedback', async (req, res) => {
//     //header apabila akan melakukan akses
//     var token = req.headers.authorization;
//     if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
    
//     //verifikasi jwt
//     jwt.verify(token, Conf.secret, async(err, user) => {
//       if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
//         const id = user.id;
//         const ticket = await Ticket.find({"customer_id" : id});
//         console.log(ticket.length)
//         const feedback=[]
//         for (let i = 0; i <= ticket.length; i++) {
//             let ticketId = ticket[i]._id
//             let feedback = await Feedback.find({"ticket_id" : ticketId});
//             res.json(feedback[i])
            
//         }

//         // if (ticket[1] != ""){
//         //     const ticketId = ticket[2]._id
//         //     const feedback = await Feedback.find({"ticket_id" : ticketId});
//         //     res.json(feedback)
//         // } else {
//         //     res.status(404).json({
//         //         message: 'user not found'
//         //     })
//         // }




//     })
// })

export default customerRouter