const sqlite3 = require('sqlite3').verbose();
const database = new sqlite3.Database('./db/yt.db');
module.exports = {
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
	isLinkInDb(link) {
		return new Promise((resolve, reject) => {
			this.getAsync(`SELECT * FROM yt_links WHERE link = '${link}'`).then((val) => {
				if (val) {
					resolve(true);
				}
				else {
					resolve(false);
				}
			}).catch((err) => {
				reject(err);
			});
		});
	},
	insertLink(link) {
		database.run(`INSERT INTO yt_links (link) VALUES ('${link}')`);
	},
	getLink(id) {
		return new Promise((resolve, reject) => {
			this.getAsync(`SELECT * FROM yt_links WHERE id = ${id}`).then((val) => {
				resolve(val);
			}).catch((err) => {
				reject(err);
			});
		});
	},
	getMaxLinkId() {
		return new Promise((resolve, reject) => {
			this.getAsync('SELECT MAX(ID) as id FROM yt_links').then((val) => {
				resolve(val);
			}).catch((err) => {
				reject(err);
			});
		});
	},
};
