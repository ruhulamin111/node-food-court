const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000;
require('dotenv').config()

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.send('food court server')
})

app.listen(port, () => {
    console.log('working port', port);
})

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zjrcntk.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect()
        const foodCollection = client.db('food').collection('item')

        app.get('/food', async (req, res) => {
            const query = {}
            const cursor = foodCollection.find(query)
            const result = await cursor.toArray()
            res.send(result)
        })

    }
    finally {

    }
}
run().catch(console.dir)
