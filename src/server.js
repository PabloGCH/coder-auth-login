// IMPORTS
const express = require("express");
const cookieParser = require("cookie-parser");
const path = require("path");
const ProductDbManager = require("./managers/productsDbManager.js");
const MessageDbManager = require("./managers/messageDbManager.js");
const {Server: IOServer} = require("socket.io");
const {Server: HttpServer} = require("http");

//GLOBAL VARIABLES
const app= express();
const httpServer = new HttpServer(app);
const io = new IOServer(httpServer)
const TEMPLATEFOLDER = path.join(__dirname, "public/templates");
const container = new ProductDbManager("products.json");
const messageManager = new MessageDbManager("message-history.json");
//SESSION PERSISTENCE WITH MONGO
const MongoStore = require("connect-mongo")
//HANDLEBARS
const HANDLEBARS = require("express-handlebars");
const session = require("express-session");
app.engine("handlebars", HANDLEBARS.engine())
app.set("views", TEMPLATEFOLDER)
app.set("view engine", "handlebars")
//APP INIT CONF
app.use(cookieParser());
app.use(session({
	store: MongoStore.create({mongoUrl: "mongodb+srv://pablo:coder@coder.bkt7yqu.mongodb.net/sessionsDb?retryWrites=true&w=majority"}),
	secret: "dfvartg4wfqR3EFRQ3",
	resave: false,
	saveUninitialized: false,
	cookie: {
		maxAge: 1000 * 60 * 10 // 1 segundo * 60 * 10 = 10 minutos
	}
}))
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')));
httpServer.listen(4000, ()=>{console.log("server listening on port 4000")});


app.get("/", (req,res) => {
	res.redirect("/login")
})
app.get("/stock", (req, res) => {
	if(req.session.user == undefined){
		res.redirect("/login")
	} else {
		res.cookie("username", req.session.user.name)
		res.sendFile("public/client/index.html", {root: __dirname})
	}
})
app.get("/form", (req, res) => {
	if(req.session.user == undefined){
		res.redirect("/login")
	} else {

		res.cookie("username", req.session.user.name)
		res.sendFile("public/client/index.html", {root: __dirname})
	}
})
app.get("/chat", (req, res) => {
	if(req.session.user == undefined){
		res.redirect("/login")
	} else {

		res.cookie("username", req.session.user.name)
		res.sendFile("public/client/index.html", {root: __dirname})
	}
})
app.get("/login", (req,res) => {
	if(req.session.user){
		res.redirect("/stock")
	} else {
		res.sendFile("public/client/index.html", {root: __dirname})
	}
})
app.get("/register", (req,res) => {
	res.sendFile("public/client/index.html", {root: __dirname})
})

app.post("/login", (req, res) => {
	const body = req.body;
	if(req.session.user) {
		res.send({message:"already logged"})
	} else if(body.name && body.password) {
		req.session.user = {
			name: body.name,
			password: body.password
		}
		res.send({message: "Session initialized"})
	} else {
		res.send({message: "Invalid user inputs"})
	}
})

app.post("/newMessage", (req,res) => {
	if(req.session.user == undefined){
		res.send({success: false, message: "not_logged"})
	} else {
		messageManager.save(req.body).then(() => {
			messageManager.getAll().then(messages => {
				io.sockets.emit("messages", {messages: messages})
				res.send({success: true})
			})
		})
	}
});

app.post("/newProduct", (req,res) => {
	if(req.session.user == undefined){
		res.send({success: false, message: "not_logged"})
	} else {
		console.log("logged")
		let product = req.body;
		Object.assign(product, {price: parseInt(product.price)});
		container.save(product).then(() => {
			container.getAll().then(products => {
				io.sockets.emit("products", {products: products})
				res.send({success: true})
			})
		})
	}

});
app.get("/userData", (req, res) => {
	res.send(req.session.user.name)
})

app.get("/logOff", (req, res) => {
	req.session.destroy();
	res.send({message: "session closed"})
})


//WEBSOCKETS
io.on("connection", (socket) => {
	container.getAll().then(products => {
		socket.emit("products", {products: products})
	})
	messageManager.getAll().then(messages => {
		socket.emit("messages", {messages: messages})
	})
})




