const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config()


// middleware
app.use(cors());
app.use(express.json())






const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.jutxl.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {
        await client.connect();
        const walletsCollection = client.db("ViticDB").collection("wallets");
        const usersCollection = client.db("ViticDB").collection("akaUsers");



        // UPDATE USER AND CREATE TOKEN
        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email }
            const option = { upsert: true }
            const updateDoc = {
                $set: user,
            };
            const result = await usersCollection.updateOne(filter, updateDoc, option)
            res.send({ success: true, data: result });
        })


        // GET all user
        app.get('/users', async (req, res) => {
            const users = await usersCollection.find().toArray()
            res.send(users)
        })


        // make admin roal
        app.put('/user/admin/:email', async (req, res) => {
            const email = req.params.email;
            const email2 = req.body;
            const requester = email2.email1
            console.log(email, requester)
            const param = { email: requester }
            console.log(param);
            const requerstAccount = await usersCollection.findOne(param)
            if (requerstAccount?.role === 'admin') {
                const filter = { email: email }
                const updateDoc = {
                    $set: { role: 'admin' },
                };
                const result = await usersCollection.updateOne(filter, updateDoc)
                res.send(result);
            } else {
                res.status(403).send({ message: 'Forbidden Access' })
            }
        })


        // get admin
        app.get('/admin/:email', async (req, res) => {
            const email = req.params.email;
            const param = { email: email }
            const user = await usersCollection.findOne(param)
            const isAdmin = user?.role == 'admin';
            res.send({ admin: isAdmin })
        })



        // Delete admin
        app.delete('/admin/:email', async (req, res) => {
            const email = req.params.email;
            const param = { email: email }
            const user = await usersCollection.deleteOne(param)
            res.send({ data: user })
        })

        // Delete wallets
        app.delete('/wallet/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            console.log(query)
            const wallet = await walletsCollection.deleteOne(query)
            res.send({ data: wallet })
        })

        // add wallet 
        app.post('/wallet', async (req, res) => {
            const walletinfo = req.body;
            await walletsCollection.insertOne(walletinfo);
            res.send({ success: true })
        })

        // add wallet 
        app.get('/wallet', async (req, res) => {
            const wallets = await walletsCollection.find().toArray();
            res.send({ success: wallets })
        })


    } catch (error) {
        console.log(error);
    }
}
run().catch(console.dir);








app.get('/', (req, res) => {
    res.send('backend is fire')
})



app.listen(port, () => {
    console.log('app is listing Port: ', port);
})
