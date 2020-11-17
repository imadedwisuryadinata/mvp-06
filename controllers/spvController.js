import Cs from '../models/cs.js'
import express from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import bodyParser from 'body-parser'
import Conf from '../config.js'

const spvRouter = express.Router()

spvRouter.use(bodyParser.urlencoded({extended: false}));
spvRouter.use(bodyParser.json());

spvRouter.post('/register', async (req, res) => {
    //header apabila akan melakukan akses
    var token = req.headers.authorization;
        if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
        
    //verifikasi jwt
    jwt.verify(token, Conf.secret, async(err, user) => {
      if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
          const jabatan = user.jabatan;
          if (jabatan == '1'){
            try {
                const {email, password, nama_asli, foto_asli, nama_palsu, foto_palsu} = req.body
        
                var saltRounds = 10;
                const hashedPw = await bcrypt.hash(password, saltRounds)
                const newCust = new Cs(
                    {
                        "email": email,
                        "password": hashedPw,
                        "nama_asli": nama_asli,
                        "foto_asli": foto_asli,
                        "nama_palsu": nama_palsu,
                        "foto_palsu": foto_palsu,
                    })
                const createdCust = await newCust.save()
                res.status(201).json(createdCust)
            } catch (error) {
                console.log(error)
                res.status(500).json({error: error})
            }
        } else {
            res.status(201).json({"status":"Anda bukan Spv, tidak berwenang melakukan registrasi!"})
        }

    })
})





export default spvRouter