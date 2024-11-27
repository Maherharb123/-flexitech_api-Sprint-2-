import express from 'express';
import session from 'express-session';
import { PrismaClient } from '@prisma/client';


const app = express();
const port = 3000;

// Session Setup 
app.use(session({ 
  
    // It holds the secret key for session 
    secret: 'Your_Secret_Key', 
  
    // Forces the session to be saved 
    // back to the session store 
    resave: false,
  
    // Forces a session that is "uninitialized" 
    // to be saved to the store 
    saveUninitialized: false
})) 

app.use(express.json());

// users
import users from './routes/users.js';
app.use('/users', users);

// products 
import products from './routes/products.js';
app.use('/products', products);


app.get('/', (req, res) => {
    res.send('Hello World!');
});

export const prismaClient = new PrismaClient({
    log:['query']
});

app.listen(port, () => {
    console.log(`Server listening on http://127.0.0.1:${port}`);
});