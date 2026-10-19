import express from 'express';
import { MongoClient } from 'mongodb';
import 'dotenv/config'

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const client = new MongoClient(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kgxk25v.mongodb.net/`);

export async function connectToMongoDB() {
    try{
        await client.connect();
        console.log("Successfully Connect To MongoDB");
        return client;
    } catch (error){
        console.dir(error);
    }
}

await connectToMongoDB();

app.get('/', (req, res) => {
    res.send('Simple crud server')
});

app.listen(port, () => {
    console.log('Simple crud server...');
});