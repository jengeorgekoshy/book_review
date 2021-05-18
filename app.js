const express = require('express');
const bodyParser = require('body-parser')
const ejs = require('ejs')
const app = express();
const mongoose = require('mongoose')

const { MONGOURL } = require('./keys')


mongoose.connect(MONGOURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

mongoose.connection.on("connected", () => {
    console.log('mongo connected')
})
mongoose.connection.on("error", () => {
    console.log('error')
})

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
})


const User = new mongoose.model("User", userSchema)


app.use(express.static("public"))
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({
    extended: true
}))


app.get("/", (req, res) => {
    res.render("home")
})

app.get("/login", (req, res) => {
    res.render("login")
})

app.get("/register", (req, res) => {
    res.render("register")
})

app.get("/logout", (req, res) => {
    res.render("home")
})

app.post('/register', (req, res) => {
    const newUser = new User({
        email: req.body.username,
        password: req.body.password
    })
    newUser.save(function (err) {
        if (err) {
            console.log(err)
        }
        else {
            res.render('secrets')
        }
    })
})

app.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({ email: username }, (err, foundUser) => {
        if (err) {
            console.log(err)
        } else {
            if (foundUser) {
                if (foundUser.password === password) {
                    res.render("secrets")
                }
            }
        }
    })
})

app.listen(3000, () => {
    console.log("server started on port 3000")
})