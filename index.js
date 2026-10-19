import express from 'express';

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Simple crud server')
});

app.listen(port, () => {
    console.log('Simple crud server...');
});