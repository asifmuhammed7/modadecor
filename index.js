const express = require('express')
const mongoose = require('mongoose')
require('dotenv').config();
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });


const app = express()

app.use(express.static('public'))

const userRouter = require('./routes/userRouter')
app.use('/',userRouter)

const adminRouter = require('./routes/adminRouter')
app.use('/admin',adminRouter)

app.listen(3000,()=> console.log(`Server starting at http://localhost:${3000}`))

    