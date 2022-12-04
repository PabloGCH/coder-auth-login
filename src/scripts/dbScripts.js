//BASE DE DATOS
const knex = require("knex");

const sqliteconfig = require("../options/sqliteconfig");
const sqlconfig = require("../options/mysqlconfig");

class DbManager {
	constructor(tableName) {
		this.tableName = tableName;
		switch(tableName) {
			case "products":
				this.database = knex(sqliteconfig);
				this.createTable();
			break;
			case "messages":
				this.database = knex(sqliteconfig);
				this.createTable();
			break;
			default:
				throw "DbManager was constructed with invalid table name"
		}
	}

	createTable() {
		this.database.schema.hasTable(this.tableName).then(exists => {
			if(!exists) {
				switch(this.tableName) {
					case "products":
						this.database.schema.createTable(this.tableName, table => {
							table.increments("id");
							table.string("name", 20);
							table.integer("price").nullable(true);
							table.string("imgUrl", 1500);
						})
						.then(() => console.log(`${this.tableName} table created`))
						break;
					case "messages":
						this.database.schema.createTable(this.tableName, table => {
							table.string("email", 40);
							table.string("date", 70);
							table.string("message", 500);
						})
						.then(() => console.log(`${this.tableName} table created`))
						break;
				}
			}
		})
		.catch(err => console.log(err))
	}

	addObject(object) {
		return new Promise((resolve, reject) => {
			this.database(this.tableName).insert(object)
			.catch((err) => reject({response: err, success: false}))
			.finally(() => resolve({response: "object added", success: true}));	
		})

	}
	rmObject(id) {
		return new Promise((resolve, reject) => {
			database.from(this.tableName).where("id", id).del()
			.catch((err) => reject({response: err, success: false}))
			.finally(() => {
				resolve({response: "Object deleted", success: true});
			});
		});
	}
	editObject(id, object) {
		return new Promise((resolve, reject) => {
			database.from(this.tableName).where("id", id).update(object)
			.catch((err) => reject({response: err, success: false}))
			.finally(() => {
				resolve({response: "Object updated", success: true});
			});
		});
	}
	getObject(id) {
		return new Promise((resolve, reject) => {
			let objects;
			database.from(this.tableName).select("*").where("id", id)
			.then((result) => {
				result.forEach(el => {
					objects.push({...el})
				})
			})
			.catch((err) => reject({response: err, success: false}))
			.finally(() => {
				let object = objects[0]
				resolve({response: object, success: true});
			});
		});
	}
	getObjects(){
		return new Promise((resolve, reject) => {
			const objects = [];
			this.database.from(this.tableName).select("*")
			.then((result) => {
				result.forEach(el => {
					objects.push({...el})
				})
			})
			.catch((err) => reject({response: err, success: false}))
			.finally(() => {
				resolve({response: objects, success: true});
			})
		})
	}
}

module.exports = DbManager;
