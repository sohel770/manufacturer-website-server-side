const express = require('express')
const app = express()
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion,ObjectId } = require('mongodb');
const cors = require('cors')
require('dotenv').config();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.cieka.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'Unauthorized access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' });
        }
        req.decoded = decoded;
        next();
    });
}



async function run() {
try{
    
    await client.connect();
    console.log('mediTools db connected');
    const toolCollection = client.db('mediToolsDB').collection('product');
    const reviewCollection = client.db('mediToolsDB').collection('reviews');
    const orderColletion = client.db('mediToolsDB').collection('orders');
    const userColletion = client.db('mediToolsDB').collection('users');


    // verify admin
    const verifyAdmin = async (req, res, next) => {
        const requester = req.decoded.email;
        const requesterAccount = await userColletion.findOne({ email: requester });
        if (requesterAccount.role === 'admin') {
            next();
        }
        else {
            res.status(403).send({ message: 'Forbidden' });
        }
    }


    // tools product api
    app.post('/product', async (req, res) => {
        const query = req.body;
        const product = await toolCollection.insertOne(query);
        res.send(product);
    });

    // get product api from database
    app.get('/product', async (req, res) => {
        const query = {};
        const product = await toolCollection.find(query).toArray();
        res.send(product);
    });


    // delete product api
    app.delete('/product/:email', verifyJWT, verifyAdmin, async (req, res) => {
        const email = req.params.email;
        const filter = { email: email };
        const result = await toolCollection.deleteOne(filter);
        res.send(result);
    });

    // get product api by id from database
    app.get('/product/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const product = await toolCollection.findOne(query);
        res.send(product);
    });

    // post review api
    app.post('/review', async (req, res) => {
        const query = req.body;
        const review = await reviewCollection.insertOne(query);
        res.send(review);
    });

    // get review api
    app.get('/review', async (req, res) => {
        const query = {};
        const review = await reviewCollection.find(query).toArray();
        res.send(review);
    });

    // order post api
    app.post('/order', async (req, res) => {
        const order = req.body;
        const result = await orderColletion.insertOne(order);
        res.send(result);
    });

    app.get('/order', verifyJWT, async (req, res) => {
        const query = {};
        const orders = await orderColletion.find(query).toArray();
        res.send(orders);
    });

    // order collection by email
    app.get('/order', verifyJWT, async (req, res) => {
        const customer = req.query.customer;
        const decodedEamil = req.decoded.email;
        if (customer === decodedEamil) {
            const query = { customer: customer };
            const orders = await orderColletion.find(query).toArray();
            return res.send(orders);
        }
        else {
            return res.status(403).send({ message: 'Forbidden Access' })
        }

    });

    // laod users inforamtion on dashboard
    app.get('/user', verifyJWT, async (req, res) => {
        const users = await userColletion.find().toArray();
        res.send(users);
    })

    app.get('/admin/:email', async (req, res) => {
        const email = req.params.email;
        const user = await userColletion.findOne({ email: email });
        const isAdmin = user.role === 'admin';
        res.send({ admin: isAdmin });
    })

    app.put('/user/admin/:email', verifyJWT, verifyAdmin, async (req, res) => {
        const email = req.params.email;
        const filter = { email: email };
        const updateDoc = {
            $set: { role: 'admin' },
        };
        const result = await userColletion.updateOne(filter, updateDoc);
        res.send(result);
    });


    // update user information api
    app.put('/user/:email', async (req, res) => {
        const email = req.params.email;
        const user = req.body;
        const filter = { email: email };
        const options = { upsert: true };
        const updateDoc = {
            $set: user,
        };
        const result = await userColletion.updateOne(filter, updateDoc, options);
        const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
        res.send({ result, token });
    });

}
    


    finally {

    }



}
run().catch(console.dir)


app.get('/', (req, res) => {
    res.send('Running my manufacturer website')

})
app.listen(port, () => {
    console.log('listening on port', port);
})