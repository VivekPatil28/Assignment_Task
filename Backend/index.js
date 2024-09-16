const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
app.use(cors())
const port = 3000;

mongoose.connect('mongodb://localhost:27017/hodlinfo', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});


const tickerSchema = new mongoose.Schema({
    name: String,
    last: Number,
    buy: Number,
    sell: Number,
    volume: Number,
    base_unit: String,
});

const Ticker = mongoose.model('Ticker', tickerSchema);

const fetchData = async () => {
    try {
        const response = await axios.get('https://api.wazirx.com/api/v2/tickers');
        const tickers = response.data;
        const top10 = Object.values(tickers).slice(0, 10);
        await Ticker.deleteMany();
        await Ticker.insertMany(
            top10.map((ticker) => ({
                name: ticker.name,
                last: ticker.last,
                buy: ticker.buy,
                sell: ticker.sell,
                volume: ticker.volume,
                base_unit: ticker.base_unit,
            }))
        );
        console.log('Data inserted successfully');
    } catch (error) {
        console.error('Error:', error);
    }
};


app.get('/api/tickers', async (req, res) => {
    try {
        const tickers = await Ticker.find();
        res.json(tickers);
    } catch (error) {
        res.status(500).send('Error');
    }
});

fetchData();

app.listen(port, () => {
    console.log(`Server running on port:${port}`);
});
