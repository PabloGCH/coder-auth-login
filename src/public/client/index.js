const socket = io();
const content = document.getElementById("content");
let currentUserEmail = "";
//Check if login

//HANDLEBARS HELPERS
Handlebars.registerHelper("compareStrings", (a, b, options) => {
	return a == b ? options.fn(this) : options.inverse(this);
})
//FUNCTIONS
const loginForm = async() => {
	const response = await fetch("../templates/login.handlebars");
	const result = await response.text();
	const template = Handlebars.compile(result);
	const html = template();
	return html;
}
const productForm = async() => {
	const response = await fetch("../templates/form.handlebars");
	const result = await response.text();
	const template = Handlebars.compile(result);
	const html = template();
	return html;
}

const productTable = async(data) => {
	const response = await fetch("../templates/products.handlebars");
	const result = await response.text();
	const template = Handlebars.compile(result);
	const html = template(data)
	return html;
}

const productFormSubmit = () => {
	const form = document.getElementById("product-form");
	const inputs = form.getElementsByTagName("input");
	let newProduct = {
		name: inputs[0].value,
		price: inputs[1].value,
		imgUrl: inputs[2].value
	};
	fetch("/newProduct", {
		method: "POST",
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify(newProduct)
	})
	.then(async(res) => {
		let data = await res.json();
		if(data.success) {
			window.location.replace("stock")
		}
		if(!data.success && data.message == "not_logged") {
			window.location.replace("login")
		}
	})

	/*
	setTimeout(() => {
		window.location.replace("stock")
	}, 500)
	*/
}

const chatSection = async(data, user) => {
	Object.assign(data, {user: user})
	const response = await fetch("../templates/chat.handlebars");
	const result = await response.text();
	const template = Handlebars.compile(result);
	const html = template(data);
	return html;
}

//EVENTS
const sendMessage = () => {
	currentUserEmail = document.getElementById("email").value;
	let message = document.getElementById("message").value;
	let date = new Date();
	let newMessage = {
		email: currentUserEmail,
		date: date.getDate().toString() + "/" + date.getMonth().toString() + "/" + date.getFullYear().toString() + " - " + date.getHours().toString() + ":" + date.getMinutes().toString() + ":" + date.getSeconds().toString(),
		message: message
	}
	fetch("/newMessage", {
		method: "POST",
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify(newMessage)
	})
	.then(async(res) => {
		let data = await res.json();
		if(!data.success && data.message == "not_logged") {
			window.location.replace("login")
		}
	})
}

//LOGIN EVENT
const logSubmit = () => {
	const form = document.getElementById("log-form");
	const inputs = form.getElementsByTagName("input");
	let logData = {
		name: inputs[0].value,
		password: inputs[1].value,
	};
	fetch("/login", {
		method: "POST",
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify(logData)
	})
	.then(async(res) => {
		console.log(await res.json())
	})
}


//ROUTES
if(window.location.pathname == "/stock") {
	socket.on("products", data => {
		productTable(data).then(res => {
			content.innerHTML = res;
		})
	})
}
if(window.location.pathname == "/form") {
	productForm().then(res => {
		content.innerHTML = res;
	})
}
if(window.location.pathname == "/login") {
	loginForm().then(res => {
		content.innerHTML = res;
	})
}
if(window.location.pathname == "/chat") {
	socket.on("messages", data => {
		chatSection(data, currentUserEmail).then(res => {
			content.innerHTML = res;
			document.getElementById("email").value = currentUserEmail;
			let messageBox = document.getElementById("message-box");
			messageBox.scrollTop = messageBox.scrollHeight;
		})
	})
}


