const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
require('dotenv').config();

const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hniul.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const port = 5000;

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('services'));
app.use(fileUpload());

app.get('/', (req, res) => {
    res.send("Hello, how are you doing?")
})

client.connect(err => {
    const servicesCollection = client.db(process.env.DB_NAME).collection("services");
    const reviewsCollection = client.db(process.env.DB_NAME).collection("reviews");
    const ordersCollection = client.db(process.env.DB_NAME).collection("orders");
    const adminCollection = client.db(process.env.DB_NAME).collection("admin");
    console.log('database has been connected successfully');

    app.post('/addServices', (req, res) => {
        const service = req.body;
        const file = req.files.file;
        const newImg = file.data;
        const encImg = newImg.toString('base64');

        const image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };

        const services = { ...service, image};
        servicesCollection.insertOne({ services })
            .then(result => {
                if (result.insertedCount > 0) {
                    res.status(200).send(result.insertedCount > 0);
                } else {
                    res.statusCode(400);
                }
            });
    });

    app.get('/getServices', (req, res) => {
        servicesCollection.find({})
            .toArray((err, services) => {
                res.status(200).send(services);
            });
    });

    app.post('/addReviews', (req, res) => {
        const review = req.body;
        const newImg = file.data;
        const encImg = newImg.toString('base64');

        const image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };

        const reviews = { ...review, image};
        reviewsCollection.insertOne({ reviews })
            .then(result => {
                if (result.insertedCount > 0) {
                    res.status(200).send(result.insertedCount > 0);
                } else {
                    res.statusCode(400);
                }
            });
    });

    app.get('/getReviews', (req, res) => {
        reviewsCollection.find({})
            .toArray((err, reviews) => {
                res.status(200).send(reviews);
            });
    });

    app.post('/addOrders', (req, res) => {
        const order = req.body;
        const file = req.files.file;
        const newImg = file.data;
        const encImg = newImg.toString('base64');

        const image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        }

        const orders = { ...order, image };
        ordersCollection.insertOne({  orders })
            .then(result => {
                if (result.insertedCount > 0) {
                    res.status(200).send(result.insertedCount > 0);
                } else {
                    res.sendStatus(400);
                }
            });
    });

    app.get('/getOrders', (req, res) => {
        const queryEmail = req.query.email;
        let filterObject = { email: queryEmail };
        const projectObject = {};
        if (!queryEmail) {
            filterObject = {};
            projectObject.image = 0;
        }

        ordersCollection
            .find(filterObject)
            .project(projectObject)
            .toArray((err, orders) => {
                if (orders.length > 0) {
                    res.status(200).send(orders);
                } else {
                    res.sendStatus(400);
                }
            });
    });

    // app.get('/servicesList', (req, res) => {
    //     servicesCollection.find({})
    //         .toArray((err, documents) => {
    //             res.send(documents);
    //         })
    // })

    app.patch("/updateOrderStatus", (req, res) => {
        const orderId = req.body.id;
        const status = req.body.status;
        ordersCollection
            .updateOne({ _id: ObjectId(orderId)}, { $set: { status: status }})
            .then( result => {
                if (result.modifiedCount) {
                    res.status(200).send(result.modifiedCount > 0);
                } else {
                    res.sendStatus(400);
                }
            });
    });

    app.delete("/cancelOrder", (req, res) => {
        const id = req.params.id;
        ordersCollection.deleteOne({ _id: ObjectId(id) })
            .then(result => {
                if (result.deletedCount > 0) {
                    res.status(200).send(result.deletedCount > 0);
                } else {
                    res.sendStatus(400);
                }
            });
    });

    app.get("/searchInOrder", (req, res) => {
        const searchText = req.query.searchText;
        ordersCollection
            .find({ email: { $regex: searchText }})
            .project({ image: 0})
            .toArray((err, result) => {
                if(result) {
                    res.status(200).send(result);
                } else {
                    res,sendStatus(404);
                }
            });
    });

    app.post('/addAdmin', (req, res) => {
        const email = req.body;
        adminCollection.insertOne({ email })
            .then(result => {
                if (result.insertedCount > 0) {
                    res.status(200).send(result.insertedCount > 0);
                } else {
                    res.sendStatus(400);
                }
            });
    });

    app.get("/getAdmin", (req, res) => {
        adminCollection.find({})
            .toArray((err, admin) => {
                if (admin.length > 0 ) {
                    res.status(200).send(admin);
                } else {
                    res.sendStatus(400);
                }
            });
    });

});

app.listen(process.env.PORT || port)