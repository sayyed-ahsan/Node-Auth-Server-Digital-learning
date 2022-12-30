const express = require('express')
const app = express()
const cors = require('cors')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

app.use(cors())
app.use(express.json())
require('dotenv').config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.v9e6xse.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri);

const run = async () => {
    try {

        const userCollection = client.db("partsala").collection("users");

        app.post('/api/register', async (req, res) => {
            // console.log(req.body)
            try {
                const hashedPassword = await bcrypt.hash(req.body.password, 10)

                const newUser = {
                    name: req.body.name,
                    email: req.body.email,
                    role: req.body.role,
                    password: hashedPassword,
                };
                // console.log(newUser)
                const query = { email: req.body.email };

                const foundUser = await userCollection.findOne(query);

                if (!foundUser) {
                    console.log("User not found");
                    const result = await userCollection.insertOne(newUser);
                    return res.status(200).json({
                        message: "Signup successful!",
                    });
                }
                res.send({ status: 'error', alreadyStored: "Email Already in use!" });
            } catch (err) {
                console.log(err);
                res.json({ status: 'error', error: 'Duplicate email' })
            }
        })

        app.post('/api/login', async (req, res) => {
            const user = await userCollection.findOne({
                email: req.body.email,
            })

            if (!user) {
                return res.json({ status: 'error', error: 'Invalid login' });
            }

            const isPasswordValid = await bcrypt.compare(
                req.body.password,
                user.password
            )

            if (isPasswordValid) {
                const token = jwt.sign(
                    {
                        _id: user._id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                    },
                    process.env.JWT_SECRET, {
                    expiresIn: process.env.JWT_EXPIRES_IN,
                }
                )

                return res.json({ status: 'ok', user_token: token, message: 'Login Successful' })
            } else {
                return res.json({ status: 'error', user: false, message: 'Invalid login' })
            }
        })


        

        

    } finally {

    }
}

run().catch(console.dir);


app.listen(5000, () => {
    console.log('Server started on 5000')
})