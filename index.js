import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import 'dotenv/config';

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// পাসওয়ার্ডে স্পেশাল ক্যারেক্টার থাকলে যেন সমস্যা না হয়, তাই encodeURIComponent ব্যবহার করা ভালো
const user = process.env.DB_USER;
const pass = encodeURIComponent(process.env.DB_PASS);
const client = new MongoClient(`mongodb+srv://${user}:${pass}@cluster0.kgxk25v.mongodb.net/`);

// ডাটাবেজ এবং কালেকশন ভেরিয়েবল বাইরে ডিক্লেয়ার করে রাখা
let db;
let users;

export async function connectToMongoDB() {
    try {
        await client.connect();
        console.log("Successfully Connected To MongoDB");
        
        // কানেকশন সফল হলে এখানে ডাটাবেজ ও কালেকশন সেট করা হচ্ছে
        db = client.db('simpleCrudDB');
        users = db.collection('users');

    } catch (error) {
        console.error("MongoDB Connection Error:", error);
    }
}

// সার্ভার চালু হওয়ার আগে ডাটাবেজ কানেকশন নিশ্চিত করা
await connectToMongoDB();

app.get('/', (req, res) => {
    res.send('Simple crud server');
});

app.get('/users', async (req, res) => {
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

app.listen(port, () => {
    console.log(`Simple crud server running on port ${port}...`);
});