const express = require('express');
require('dotenv').config();
const cors = require('cors');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hniul.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const port = 5000;

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('services'));
app.use(fileUpload());

app.get('/', (req, res) => {
    res.send("Hello, how are you doing?")
})


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const servicesCollection = client.db(process.env.DB_NAME).collection("services");
    const reviewsCollection = client.db(process.env.DB_NAME).collection("reviews");
    const ordersCollection = client.db(process.env.DB_NAME).collection("orders");
    const adminCollection = client.db(process.env.DB_NAME).collection("admin");
    console.log('database connected successfully');

    app.post('/addServices', (req, res) => {
        const file = req.files.file;
        const title = req.body.title;
        const description = req.body.description;
        const newImg = file.data;
        const encImg = newImg.toString('base64');

        const image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };

        servicesCollection.insertOne({ title: title, description: description, image: image })
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })

    app.get('/services', (req, res) => {
        servicesCollection.find({})
            .toArray((err, documents) => {
                res.send(documents)
            })
    })

    app.post('/addReviews', (req, res) => {
        const file = req.files.file;
        const name = req.body.name;
        const designation = req.body.designation;
        const description = req.body.description;
        const newImg = file.data;
        const encImg = newImg.toString('base64');

        const image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        }

        reviewsCollection.insertOne({ name: name, designation: designation, description: description, image: image })
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })

    app.get('/reviews', (req, res) => {
        reviewsCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    app.post('/orders', (req, res) => {
        const file = req.files.file;
        const name = req.body.name;
        const email = req.body.email;
        const projectName = req.body.projectName;
        const projectDetails = req.body.projectDetails;
        const price = req.body.price;
        const newImg = file.data;
        const encImg = newImg.toString('base64');

        const image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        }

        ordersCollection.insertOne({ name: name, email: email, projectName: projectName, projectDetails: projectDetails, price: price, image: image })
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })

    app.get('/ordersList', (req, res) => {
        ordersCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    app.get('/servicesList', (req, res) => {
        ordersCollection.find({ email: req.query.email })
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    app.post('/makeAdmin', (req, res) => {
        const email = req.body.email;
        adminCollection.insertOne({ email })
        .then(result => {
            res.send(result.insertedCount > 0);
        })
    })

});


app.listen(process.env.PORT || port)