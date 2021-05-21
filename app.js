var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var expressSanitizer = require("express-sanitizer");
var methodOverride = require("method-override");
var app = express();
require('dotenv/config');
// App Configs
mongoose.connect(process.env.MONGOURL, {
	useNewUrlParser: true,
	useUnifiedTopology: true
});
mongoose.connection.on("connected", () => {
	console.log('mongo connected')
})
mongoose.connection.on("error", () => {
	console.log('error')
})

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(expressSanitizer());

const userSchema = new mongoose.Schema({
	email: String,
	password: String,
})


const User = new mongoose.model("User", userSchema)


var bookSchema = mongoose.Schema({
	title: String,
	image: String,
	author: String,
	language: String,
	genre: String,
	description: String,
	review: String,
	rating: String
});

var Book = mongoose.model("Book", bookSchema);

app.get("/", function (req, res) {
	res.render("home");
});


app.get("/login", (req, res) => {
	res.render("login")
})

app.get("/register", (req, res) => {
	res.render("register")
})

app.get("/logout", (req, res) => {
	res.render("home")
})

app.get('/booksPage', (req, res) => {
	res.render('index')
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
			res.redirect('/books')
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
					res.redirect("/books")
				}
			} else {
				res.render("home")
			}
		}
	})
})



app.get("/books", function (req, res) {
	Book.find({}, function (err, books) {
		if (err) {
			console.log("Error!");
		} else {
			res.render("index", { books: books });
		}
	});
});

app.get("/books/new", function (req, res) {
	res.render("new");
});

app.post("/books", function (req, res) {
	req.body.book.title = req.sanitize(req.body.book.title);
	req.body.book.author = req.sanitize(req.body.book.author);
	req.body.book.language = req.sanitize(req.body.book.language);
	req.body.book.genre = req.sanitize(req.body.book.genre);
	req.body.book.description = req.sanitize(req.body.book.description);
	req.body.book.review = req.sanitize(req.body.book.review);
	Book.create(req.body.book, function (err, newBook) {
		if (err) {
			res.render("new");
		} else {
			res.redirect("/books");
		}
	});
});

app.get("/books/:id", function (req, res) {
	Book.findById(req.params.id, function (err, book) {
		if (err) {
			res.redirect("/books");
		} else {
			res.render("show", { book: book });
		}
	});
});

app.get("/books/:id/edit", function (req, res) {
	Book.findById(req.params.id, function (err, book) {
		if (err) {
			res.redirect("/books");
		} else {
			res.render("edit", { book: book });
		}
	});
});

app.put("/books/:id", function (req, res) {
	req.body.book.title = req.sanitize(req.body.book.title);
	req.body.book.author = req.sanitize(req.body.book.author);
	req.body.book.language = req.sanitize(req.body.book.language);
	req.body.book.genre = req.sanitize(req.body.book.genre);
	req.body.book.description = req.sanitize(req.body.book.description);
	req.body.book.review = req.sanitize(req.body.book.review);
	Book.findByIdAndUpdate(req.params.id, req.body.book, function (err, updatedBook) {
		if (err) {
			res.redirect("/books");
		} else {
			res.redirect("/books/" + req.params.id);
		}
	});
});

app.delete("/books/:id", function (req, res) {
	Book.findByIdAndRemove(req.params.id, function (err) {
		if (err) {
			res.redirect("/books");
		} else {
			res.redirect("/books");
		}
	});
});


app.post('/books/search', (req, res) => {
	const search = req.body.search
	Book.find({ title: { $regex: search, $options: '$i' } })
		.then(data => {

			res.render("index", { books: data })


		})
})

var port = process.env.PORT || 3000;
app.listen(port, process.env.IP, function () {
	console.log("The Book Review App server has started")
})
