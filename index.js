const express = require('express');
var jwt = require('jsonwebtoken');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000;
require('dotenv').config()

app.use(cors())
app.use(express.json())


function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'unothorized access' })
    }
    const token = authHeader.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'forbidden access' })
        }
        req.decoded = decoded;
        next()
    })
}


app.get('/', (req, res) => {
    res.send('food court server')
})


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zjrcntk.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {

    try {

        await client.connect()
        const foodCollection = client.db('food').collection('item')
        const orderCollection = client.db('food').collection('order')

        app.post('/signin', async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1d" })
            res.send({ accessToken })
        })

        app.get('/order', verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const search = req.query.email;
            if (decodedEmail === search) {
                const query = { email: search }
                const cursor = orderCollection.find(query)
                const result = await cursor.toArray()
                res.send(result)
            } else {
                res.status(403).send({ message: 'forbidden access' })
            }
        })

        app.post('/order', async (req, res) => {
            const query = req.body;
            const result = await orderCollection.insertOne(query)
            res.send(result)
        })

        app.get('/foods', async (req, res) => {
            const query = {};
            const cursor = foodCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/food/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await foodCollection.findOne(query)
            res.send(result)
        })

        app.post('/food', async (req, res) => {
            const user = req.body
            const result = await foodCollection.insertOne(user)
            res.send(result)
        })

        app.delete('/food/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await foodCollection.deleteOne(query)
            res.send(result)
        })

    }
    finally {

    }
}
run().catch(console.dir)

app.listen(port, () => {
    console.log('working port', port);
})