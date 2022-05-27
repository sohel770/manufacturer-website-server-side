const express = require('express')
const app = express()
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors= require('cors')
require('dotenv').config();
const port= process.env.PORT || 5000;

app.use(express.json());
app.use(cors());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.cieka.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



client.connect(err => {
  const collection = client.db("test").collection("devices");
  console.log('dbuser')
  // perform actions on the collection object
  client.close();
});



app.get('/',(req,res) => {
    res.send('my name is khan')

})
app.listen(port,() => {
    console.log('listening on port', port);
})