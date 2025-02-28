const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();

const port = process.env.PORT || 5000;

app.use(
    cors({
      origin: [
        "http://localhost:5173",
        "https://cardoctor-bd.web.app",
        "https://cardoctor-bd.firebaseapp.com",
      ],
      credentials: true,
    })
  );


//middleware

app.use(cors());
app.use(express.json());







const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ronnby7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const roomCollection = client.db('gringotts').collection('rooms');
    const bookingCollection = client.db('gringotts').collection('bookings')


    app.get('/rooms', async(req, res)=>{
        const cursor = roomCollection.find()
        const result = await cursor.toArray()
        res.send(result)
    })

    app.get('/rooms/:id', async(req, res)=>{
        const id = req.params.id 
        const query = {_id: new ObjectId(id)}
        const result = await roomCollection.findOne(query)
        res.send(result)
    })

    // bookings 

    app.get('/bookings', async(req, res)=>{
        console.log(req.query.email)
        let query = {}
        if(req.query?.email){
            query = {email: req.query.email}

        }
        const result = await bookingCollection.find(query).toArray()
        res.send(result)

    })

    app.post('/bookings', async(req, res)=>{
        const booking = req.body 
        console.log(booking)
        const result = await bookingCollection.insertOne(booking)
        res.send(result)
    })


    app.put('/bookings/:id', async(req, res)=>{
        const id = req.params.id 
        const filter = {_id: new ObjectId(id)}
        const options = {upsert: true}
        const updatedBooking = req.body
        const updatedDate = {
            $set: {
                date: updatedBooking.date
            }
        }
        const result = await bookingCollection.updateOne(filter, updatedDate, options)
        res.send(result)
    })

    app.put('/bookings/:id', async(req, res)=>{
        const id = req.params.id 
        const filter = {_id: new ObjectId(id)}
        const options = {upsert: true}
        const updatedReview = req.body 
        const review = {
            $set:{
                reviews: updatedReview.reviews 
            }
        }
        const result = await roomCollection.updateOne(filter, review, options)
        res.send(result)
    })

    app.delete('/bookings/:id', async(req, res) =>{
        const id = req.params.id 
        const query = {_id: new ObjectId(id)}
        const result = await bookingCollection.deleteOne(query)
        res.send(result)
    })




   


    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) =>{
    res.send('Gringotts is running')
});

app.listen(port, ()=>{
    console.log(`Gringotts server is running on port ${port}`)
});