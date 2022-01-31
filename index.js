const express = require('express')
const { MongoClient } = require('mongodb');
const cors = require('cors')
const ObjectId = require('mongodb').ObjectId
const app = express()
require('dotenv').config()
const port = process.env.PORT || 5000


// middlewars
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.6jlv6.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db("carMechanics");
        const servicesCollection = database.collection("services");

        // POST API to insert data
        app.post('/services', async (req, res) => {
            const service = req.body
            const result = await servicesCollection.insertOne(service);
            res.send(result)
        })

        // GET API to found all services
        app.get('/services', async (req, res) => {
            const cursor = servicesCollection.find({});
            const result = await cursor.toArray()
            res.json(result)
        })

        // GET API TO load specfic id
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const service = await servicesCollection.findOne(query)
            res.json(service)
        })

        // Update service name
        app.put('/services/:id', async(req, res) => {
            const id = req.params.id
            const updatedService = req.body
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                  name:updatedService.name
                },
            };
            const result = await servicesCollection.updateOne(filter, updateDoc, options)
            res.json(result)
        })

        // DELETE API to delete specific id
        app.delete('/services/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) };
            const result = await servicesCollection.deleteOne(query)
            console.log('found id', result)
            res.json(result)
        })

    } finally {
        //   await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('hello from genius mechanic server')
})

app.listen(port, () => {
    console.log("Server running on port", port)
})