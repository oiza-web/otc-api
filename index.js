import express from 'express'
import redis from 'redis'
import bodyParser from 'body-parser'
import cors from 'cors'
import helmet from 'helmet'


const app = express()
app.use(bodyParser.urlencoded({extended: true}))
const port = 3000;
const server = app.listen(port, () => console.log(`server started on port ${port}....`))
const redisClient = redis.createClient()

app.get('/', (req, res) => {
    return res.status(200).json({
        status: true,
        message: 'server works fine',
    })
})

app.get('/otc-rates', async (req, res) => {
    try {
        redisClient.on('error', (error) => {
            console.log(`Redis Client Error, ${error}`);
        });
        redisClient.on('ready', () => console.log('Redis is ready'))
        await redisClient.connect();
        await redisClient.ping();
        const rate = await redisClient.get('NGNTOUSD')
        return res.status(200).json({
            status: true,
            data: {
                source: 'NGN',
                target: 'USD (or any other asset)',
                rate: '2.46'
            }
        })
    } catch (error) {
        return res.status(400).json({
            status: false,
            message: `Error fetching rate ${error}`
        })
    }
})

app.patch('/otc-rates', async (req, res) => {
    console.log("i got here2", req)
    console.log("i got here", req.body)
    const {ngnToUSDRate} = req.body
    try {
        redisClient.on('error', (error) => {
            console.log(`Redis Client Error, ${error}`);
        });
        redisClient.on('ready', () => console.log('Redis is ready'))
        await redisClient.connect();
        await redisClient.ping();
        redisClient.setEx('NGNTOUSD', 300, JSON.stringify(ngnToUSDRate))
        return res.status(200).json({
            status: true,
            message: "Rate updated successfully!",
            data: {
                source: 'NGN',
                target: 'USD',
                rate: ngnToUSDRate
            }
        })
    } catch (error) {
        return res.status(400).json({
            status: false,
            message: `Rate not found! ${error}`
        })
    }
})