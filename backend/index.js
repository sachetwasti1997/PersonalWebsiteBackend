const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

const postRoutes = require('./router/posts')
const userRoutes = require('./router/user')

mongoose.connect("mongodb://localhost:27017/postsDb", ({useNewUrlParser: true}))
    .then(() => {
        console.log("Connected to the database!")
    })
    .catch(() => {
        console.log("Connection Failed!")
    })

const port = 3000;
//Body parsing is required as the incoming requests is a stream of data

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}))
app.use(cors())

app.use("/images", express.static(path.join("images")))

app.use("/api/user", userRoutes)
app.use("/api/posts", postRoutes);

app.listen(port, () => {
    console.log(`App is started on the port${port}`)
})
