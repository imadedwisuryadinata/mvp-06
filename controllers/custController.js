import Customer from '../models/customer.js'
import express from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import bodyParser from 'body-parser'
import Conf from '../config.js'

const customerRouter = express.Router()

customerRouter.use(bodyParser.urlencoded({extended: false}));
customerRouter.use(bodyParser.json());

customerRouter.post('/register', async (req, res) => {
    try {

        const {email, password} = req.body

        var saltRounds = 10;
        const hashedPw = await bcrypt.hash(password, saltRounds)
        const newCust = new Customer(
            {
                "email": email,
                "password": hashedPw,
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
                "validated_at" : null
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
    var token = req.headers.authorization;
    if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
    
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



export default customerRouter