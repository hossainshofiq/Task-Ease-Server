const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;

// middlewares
app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

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

    // get all users
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

    // Get all task of a specific user
    app.get("/tasks", async (req, res) => {
      const query = { addedBy: req?.query?.email }
      const option = {
        sort: { date: -1 }
      }
      const result = await tasksCollection.find(query, option).toArray();
      res.send(result);
    })

    // Post a Task api
    app.post("/tasks", async (req, res) => {
      const result = await tasksCollection.insertOne(req?.body);
      res.send(result);
    })

    // update task category when drag and drop
    app.patch("/tasks", async (req, res) => {
      const filter = { _id: new ObjectId(req?.body?.taskId) }

      const updateDoc = {
        $set: { taskCategory: req?.body?.newCategory }
      };

      const result = await tasksCollection.updateOne(filter, updateDoc);

      res.send(result);
    })

    // delete a task api
    app.delete('/task/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await tasksCollection.deleteOne(query);
      res.send(result);
    })


    // get a task by ID
    app.get("/aTask", async (req, res)=> {
      const filter = {_id: new ObjectId (req?.query?.id)}

      const result = await tasksCollection.findOne (filter);
      res.send(result);
    })

    // update a task api
    app.put('/updateATask', async (req, res) => {
      const { taskTitle, taskDescription, taskCategory } = req.body;
      const query = { _id: new ObjectId(req?.body?.taskId) };
      const updatedDoc = {
        $set: {
          taskTitle: taskTitle,
          taskDescription: taskDescription,
          taskCategory: taskCategory
        }
      }
      const result = await tasksCollection.updateOne(query, updatedDoc);
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
  console.log(`Task management is waiting on port ${port}`);
})