const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2xlwfmf.mongodb.net/?retryWrites=true&w=majority`;

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
    await client.connect();

    const toysCollection = client.db('toysDB').collection('toys')

    app.get('/toys',async(req,res)=>{
      const result = await toysCollection.find().limit(20).toArray()
      res.send(result)
    })
    
    app.get('/toys/:text',async(req,res)=>{
        if(req.params.text === 'Sports' || req.params.text === 'Off-Road' || req.params.text === 'Emergency'){
            const result = await toysCollection.find({
                subCategory: req.params.text}).limit(20).toArray()
                return res.send(result)
        }
        const result = await toysCollection.find({}).limit(20).toArray()
        res.send(result)
    })

    app.post('/toys',async(req,res)=>{
      const toysAdded = req.body;
      const result = await toysCollection.insertOne(toysAdded)
      res.send(result)
    })

    app.get('/mytoys/:email',async(req,res)=>{
      const sortBy = req.query.sortBy; 
      let sortOrder = 1;
      if (sortBy === 'desc') {
        sortOrder = -1; 
      }
      const result = await toysCollection.find({sellerEmail:req.params.email}).sort({ price: sortOrder }).toArray()
      res.send(result)
    })

    app.delete('/deletetoy/:id',async(req,res)=>{
      const id = req.params.id;
      const filter = { _id: new ObjectId(id)}
      const result = await toysCollection.deleteOne(filter)
      res.send(result)
    })

    app.get('/singletoy/:id',async(req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await toysCollection.findOne(query)
      res.send(result)
    })

    app.patch('/update/:id',async(req,res)=>{
      const id = req.params.id;
      const filter = { _id: new ObjectId(id)}
      const updateToy = req.body;
      const updateDoc = {
        $set: {
          price: updateToy.price,
          quantity: updateToy.quantity,
          description: updateToy.description
        }
      }
      const result = await toysCollection.updateOne(filter,updateDoc);
      res.send(result)
    })

      const indexKeys = {name:1};
      const indexOptions = {name: "toyName"};

      const result = await toysCollection.createIndex(indexKeys,indexOptions)
      
      app.get('/toysearch/:text',async(req,res) => {
        const searchToy = req.params.text;

        const result = await toysCollection.find({
          name: {$regex: searchToy,$options: 'i'}
        }).toArray()
        res.send(result)
      })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/',(req,res)=>{
    res.send('Wheels is Running')
})

app.listen(port,()=>{
    console.log(`Wheels Server is running on port ${port}`)
})
