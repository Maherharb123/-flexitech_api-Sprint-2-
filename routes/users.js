import express from 'express';
const router = express.Router()
import { prismaClient } from '../index.js';
import { hashSync, compareSync } from 'bcrypt';
import passwordValidator from 'password-validator';

// Create a password validator schema
const schema = new passwordValidator();

// Add properties to it
schema
.is().min(8)
.has().digits(1)
.has().uppercase()
.has().lowercase();

router.post('/signup',async (req, res) => {
    const {email, password, first_name, last_name} = req.body;

    let user = await prismaClient.customer.findFirst({where: {email}});

    if (user) {
        throw Error('User already exists!');
    } 
    if(!schema.validate(password)) {
        throw Error(schema.validate(password, {list: true}));
    }
    user = await prismaClient.customer.create({
        data: {
            email,
            password: hashSync(password, 10),
            first_name,
            last_name
        }
    });
    res.json(user);
});

// define the login route
router.post('/login', async (req, res) => {
    const {email, password} = req.body;

    let user = await prismaClient.customer.findFirst({where: {email}});
    if (!user) {
        throw Error('User does not exist!');
    }
    if(!compareSync(password, user.password)) {
        throw Error('Incorrect password!');
    } else {
        req.session.user = {
            "customer_id": user.customer_id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name
        }

        res.send(`User ${user.email} successfully logged in!`);
    }

});

router.get('/logout', (req, res) => {
    if(req.session) {
        req.session.destroy(err => {
            if (err) {
                res.status(400).send('Unable to log out');
            } else {
                res.send('Logout successful');
            }
        });
    } else {
        res.end();
    }
});

router.get('/getSession', (req, res) => {
    if(req.session) {
        res.json(req.session.user);
    } else {
        res.status(401).send('Not logged in');
    }
});

export default router;
