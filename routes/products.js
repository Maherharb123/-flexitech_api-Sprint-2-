import express from 'express';
import { prismaClient } from '../index.js';
const router = express.Router();

router.get('/all', async (req, res) => {
    const products = await prismaClient.product.findMany();
    const productsJSON = JSON.stringify(products);
    console.log(productsJSON); 
    res.send(productsJSON);
});

router.post('/purchase', async (req, res) => {
    if (req.session.user) {
        // User is logged in

        const { 
            street,
            city,
            province,
            country,
            postal_code,
            credit_card,
            credit_expire,
            credit_cvv,
            cart, 
            invoice_amt,
            invoice_tax,
            invoice_total } = req.body;

        const customer_id = req.session.user.customer_id;

        const invoiceAmt = parseFloat(invoice_amt);
        const invoiceTax = parseFloat(invoice_tax);
        const invoiceTotal = parseFloat(invoice_total);

        console.log(invoiceAmt);
        
        const productIds = cart.split(",")

        let purchaseItems = new Array();

        productIds.forEach(productId => {
            let found = false;
            const product_id = Number(productId);
            purchaseItems.forEach(purchaseItem => {
                if (purchaseItem.product_id == product_id) {
                    purchaseItem.quantity++;
                    found = true;
                }
            })
            if (found == false) {
                purchaseItems.push({
                    "product_id": product_id,
                    "quantity": 1
                })
            }
        });
        
        console.log(purchaseItems);

        const purchaseAndItems = await prismaClient.purchase.create({
            data: {
                customer_id: customer_id,
                street: street,
                city: city,
                province: province,
                country: country,
                postal_code: postal_code,
                credit_card: credit_card,
                credit_expire: credit_expire,
                credit_cvv: credit_cvv,
                invoice_amt: invoice_amt,
                invoice_tax: invoice_tax,
                invoice_total: invoice_total,                
                
                purchase_items: {
                    create: purchaseItems,
                },
            },
        });
        res.send('Purchase details saved!');
      } else {
        // User is not logged in
        res.status(401).send('Unauthorized!');
      }
});

router.get('/:id', async (req, res) => {
    if(isNaN(req.params.id)) {
        throw Error('Please enter an integer');
    }
    const product_id = Number(req.params.id);
    let product = await prismaClient.product.findFirst({where: {product_id}})
    if (!product) {
        throw Error('Product does not exist!');
    }
    const productJSON = JSON.stringify(product);
    res.send(productJSON);
});

export default router;