import express from "express";
import cors from "cors";
import { MongoClient, ObjectId } from "mongodb";
import "dotenv/config";

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// পাসওয়ার্ডে স্পেশাল ক্যারেক্টার থাকলে যেন সমস্যা না হয়, তাই encodeURIComponent ব্যবহার করা ভালো
const user = process.env.DB_USER;
const pass = encodeURIComponent(process.env.DB_PASS);
const client = new MongoClient(
  `mongodb+srv://${user}:${pass}@cluster0.kgxk25v.mongodb.net/`,
);

// ডাটাবেজ এবং কালেকশন ভেরিয়েবল বাইরে ডিক্লেয়ার করে রাখা
let db;
let users;

export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("Successfully Connected To MongoDB");

    // কানেকশন সফল হলে এখানে ডাটাবেজ ও কালেকশন সেট করা হচ্ছে
    db = client.db("simpleCrudDB");
    users = db.collection("users");
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
  }
}

// সার্ভার চালু হওয়ার আগে ডাটাবেজ কানেকশন নিশ্চিত করা
await connectToMongoDB();

app.get("/", (req, res) => {
  res.send("Simple crud server");
});

app.get("/users", async (req, res) => {
  try {
    // কোনো কারণে ডাটাবেজ কানেক্ট না থাকলে সেফটি চেক
    if (!users) {
      return res.status(500).send({ message: "Database not connected yet" });
    }
    const cursor = users.find({});
    const allUsers = await cursor.toArray();
    res.send(allUsers);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

app.get("/users/:id", async (req, res) => {
  // const id = req.params.Id;
  // const quary = { _id: new ObjectId(id)};
  // const result = await users.findOne(quary);
  // res.send(result);
  try {
    const id = req.params.id;

    // আইডি ফরম্যাট ঠিক আছে কি না চেক করার সেফটি গার্ড
    if (!ObjectId.isValid(id)) {
      return res.status(400).send({ message: "Invalid ID format" });
    }

    const query = { _id: new ObjectId(id) };
    const result = await users.findOne(query);

    if (!result) {
      return res.status(404).send({ message: "User not found" });
    }

    res.send(result);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

app.post("/users", async (req, res) => {
  const newUser = req.body;
  const result = await users.insertOne(newUser);
  res.send(result);
});

app.patch("/users/:id", async (req, res) => {
  const id = req.params.id;
  const updateUser = req.body;

  const filter = {
    _id: new ObjectId(id),
  };
  const option = { upsert: true };
  const updateDoc = {
    $set: {
      name: updateUser.name,
      email: updateUser.email,
    },
  };
  const result = await users.updateOne(filter, updateDoc, option);
  res.send(result);
});

app.delete("/users/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await users.deleteOne(query);
  res.send(result);
});

app.listen(port, () => {
  console.log(`Simple crud server running on port ${port}...`);
});
