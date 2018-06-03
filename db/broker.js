const sqlite3 = require('sqlite3').verbose();
const database = new sqlite3.Database('./db/yt.db');
module.exports = {
	db: new sqlite3.Database('./db/yt.db'),
	getAsync(sql) {
		return new Promise((resolve, reject) => {
			database.get(sql, (err, row) => {
				if (err) reject(err);
				else resolve(row);
			});
		});
	},
	allAsync(sql) {
		return new Promise((resolve, reject) => {
			database.all(sql, (err, values) => {
				if (err) {
					reject(err);
				}
				else {
					resolve(values);
				}
			});
		});
	},
	insertListeningChannel(value) {
		database.run(`INSERT INTO listening_channels(channel_id) VALUES (${value})`);
	},
	deleteListeningChannel(value) {
		database.run(`DELETE FROM listening_channels WHERE channel_id = ${value}`);
	},
	getListeningChannel(value) {
		return new Promise((resolve, reject) => {
			this.getAsync(`SELECT channel_id FROM listening_channels WHERE channel_id = ${value}`).then((val) => {
				resolve(val);
			}).catch((err) => {
				reject(err);
			});
		});
	},
	getAllListeningChannels() {
		return new Promise((resolve, reject) => {
			this.allAsync('SELECT channel_id FROM listening_channels').then((val) => {
				resolve(val);
			}).catch((err) => {
				reject(err);
			});
		});
	},
};
