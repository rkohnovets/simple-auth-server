const express = require('express')
const mongoose = require('mongoose')

const config = require('./config')
const authRouter = require('./authRouter')

const app = express()
app.use(express.json())
app.use('/auth', authRouter)

const start = async () => {
    try {
        await mongoose.connect(config.mongo_conn_str)
        app.listen(config.port, () => {
            console.log(`server started on ${config.port}`)
        })
    }
    catch(e) {
        console.log(e)
    }
}

start()