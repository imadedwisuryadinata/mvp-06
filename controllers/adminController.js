import Spv from '../models/spv.js'
import express from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import bodyParser from 'body-parser'
import Conf from '../config.js'

const adminRouter = express.Router()

adminRouter.use(bodyParser.urlencoded({extended: false}));
adminRouter.use(bodyParser.json());

// add new SPV
adminRouter.post('/register', async (req, res) => {

    //header apabila akan melakukan akses
    var token = req.headers.authorization;
        if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
        
    //verifikasi jwt
    jwt.verify(token, Conf.secret, async(err, user) => {
      if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
          const jabatan = user.jabatan;
          if (jabatan == '0'){
            try {

                const {email, password, jabatan} = req.body
        
                var saltRounds = 10;
                const hashedPw = await bcrypt.hash(password, saltRounds)
                const newSpv = new Spv({"email": email, "password": hashedPw, "jabatan": jabatan})
                const createdSpv = await newSpv.save()
                res.status(201).json(createdSpv)
            } catch (error) {
                console.log(error)
                res.status(500).json({error: error})
            }
        } else {
            res.status(201).json({"status":"Anda bukan admin, tidak berwenang melakukan registrasi!"})
        }

    })
})


// login
adminRouter.post('/login', async (req, res) => {
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
                    res.status(201).json({"status": "wrong password."});
                
            });
        } else {
            res.status(401).json({"status": "user not found"});
        }
    } catch (error) {
        res.status(500).json({error: error})
    }
})

// get all user
adminRouter.get('/', async (req, res) => {
    //header apabila akan melakukan akses
    var token = req.headers.authorization;
    if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
    
    //verifikasi jwt
    jwt.verify(token, Conf.secret, async(err, user) => {
      if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
      const jabatan = user.jabatan;
      if (jabatan == '0'){
        const user = await Spv.find({});
        res.json(user)
      } else {
        res.status(201).json({"status":"Anda bukan Admin, tidak berwenang melihat daftar user"})
      }

    })
})

// get user by id
adminRouter.get('/:id', async (req, res) => {
 
    //header apabila akan melakukan akses
    var token = req.headers.authorization;
    if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
    
    //verifikasi jwt
    jwt.verify(token, Conf.secret, async(err, user) => {
      if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
      const jabatan = user.jabatan;
      if (jabatan == '0'){
        try {
            const user = await new Promise((resolve, reject) => {
                Spv.findById(req.params.id, (err, user) => {
                    if (err) 
                        reject(err)
                    resolve(user)
                })
            })
            res.json(user)
        } catch (error) {
            res.status(500).json({error: error})
        }
    } else {
        res.status(201).json({"status":"Anda bukan Admin, tidak berwenang melihat daftar user"})
      }

    })

})

// update user data
adminRouter.patch('/:id', async (req, res) => {
    
    //header apabila akan melakukan akses
    var token = req.headers.authorization;
    if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
    
    //verifikasi jwt
    jwt.verify(token, Conf.secret, async(err, user) => {
      if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
      const jabatan = user.jabatan;
      if (jabatan == '0'){
        try {
            const { email, password, jabatan } = req.body;

            const user = await Spv.findById(req.params.id);

            if(user){
                user.email= email;
                var saltRounds = 10;
                const hashedPw = await bcrypt.hash(password, saltRounds);
                user.password = hashedPw;
                user.jabatan = jabatan

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

      } else {
        res.status(201).json({"status":"Anda tidak berwenang untuk update user"})
      }

    })
})

export default adminRouter
