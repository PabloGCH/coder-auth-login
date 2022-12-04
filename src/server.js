// IMPORTS
const express = require("express");
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
//HANDLEBARS
const HANDLEBARS = require("express-handlebars");
app.engine("handlebars", HANDLEBARS.engine())
app.set("views", TEMPLATEFOLDER)
app.set("view engine", "handlebars")
//APP INIT CONF
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')));
httpServer.listen(4000, ()=>{"server listening on port 4000"});


app.get("/*", (req, res) => {
	res.sendFile("public/client/index.html", {root: __dirname})
})

//WEBSOCKETS
io.on("connection", (socket) => {
	container.getAll().then(products => {
		socket.emit("products", {products: products})
	})
	messageManager.getAll().then(messages => {
		socket.emit("messages", {messages: messages})
	})
	socket.on("newProduct", data => {
		let product = data;
		Object.assign(product, {price: parseInt(product.price)});
		container.save(product).then(() => {
			container.getAll().then(products => {
				io.sockets.emit("products", {products: products})
			})
		})
	})
	socket.on("newMessage", data => {
		messageManager.save(data).then(() => {
			messageManager.getAll().then(messages => {
				io.sockets.emit("messages", {messages: messages})
			})
		})
	})
})




