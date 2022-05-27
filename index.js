const express = require('express')
const app = express()
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors')
require('dotenv').config();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.cieka.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {

    try {

        await client.connect();
        const serviceCollection = client.db("carBiz").collection("service");
        const ratingCollection = client.db("carRating").collection("rating");
        const orderCollection = client.db("carOrder").collection("order");


        app.post('/service', async (req, res) => {
            const service = req.body;
            const result = await serviceCollection.insertOne(service);
            res.json(result);
        })

        // Rating (POST)
        app.post("/rating", async (req, res) => {
            const rating = req.body;
            const result = await ratingCollection.insertOne(rating);
            res.json(result);

        })

        // Orders post
        app.post("/myOrders", async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            console.log(result);
            res.send(result);

        })

        // ........................Read(R):(GET).................................//
        // Read (GET)
        app.get("/service", async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray()
            res.send(services)
        })



        // Order get
        app.get("/myOrders/:email", async (req, res) => {
            console.log(req.params.email);
            const cursor = orderCollection.find({ email: req.params.email });
            const result = await cursor.toArray();
            res.send(result);
        });

        // Rating
        app.get("/rating", async (req, res) => {
            const query = {}
            const cursor = ratingCollection.find(query);
            const ratings = await cursor.toArray()
            res.send(ratings)
        })
        // Get Single service
        app.get("/service/:id", async (req, res) => {
            const id = req.params;
            const query = { _id: ObjectId(id) };
            const service = await serviceCollection.findOne(query);
            res.send(service);
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