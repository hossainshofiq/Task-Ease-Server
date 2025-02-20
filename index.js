const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());



const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.j5p3s.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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

    const tasksCollection = client.db("taskManagementDB").collection("tasks");
    const usersCollection = client.db("taskManagementDB").collection("users");


    // users related apis
    app.get('/users', async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    })

    // Insert new user in database
    app.put("/users", async (req, res) => {
      const filter = { email: req?.body?.email };
      const options = { upsert: true };

      const updateDoc = {
        $set: {
          uid: req?.body?.uid,
          displayName: req?.body?.displayName,
          email: req?.body?.email,
          photoURL: req?.body?.photoURL,
        },
      };

      const result = await usersCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    })

    // tasks related apis
    // app.post('/tasks', async (req, res) => {
    //   const task = req.body;
    //   console.log(task);
    //   const result = await tasksCollection.insertOne(task);
    //   res.send(result);
    // })

    // Get all task of a specific user

    app.get("/tasks", async (req, res) => {
      const query = { addedBy: req?.query?.email, taskCategory: req?.query?.category }
      const option = {
        sort: { date: -1 }
      }
      const result = await tasksCollection.find(query, option).toArray();
      res.send(result);
    })

    // Post a Task by User
    app.post("/tasks", async (req, res) => {
      const result = await tasksCollection.insertOne(req?.body);
      res.send(result);
    })



    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('task management is waiting')
})

app.listen(port, () => {
  console.log(`Task management si waiting on port ${port}`);
})