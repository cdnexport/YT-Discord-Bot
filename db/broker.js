const sqlite3 = require('sqlite3').verbose();
module.exports = {
	db: new sqlite3.Database('./db/yt.db'),
	getAsync(sql) {
		return new Promise((resolve, reject) => {
			this.db.get(sql, (err, row) => {
				if (err) reject(err);
				else resolve(row);
			});
		});
	},
	allAsync(sql) {
		return new Promise((resolve, reject) => {
			this.db.all(sql, (err, values) => {
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
		this.db.run(`INSERT INTO listening_channels(channel_id) VALUES (${value})`);
	},
	deleteListeningChannel(value) {
		this.db.run(`DELETE FROM listening_channels WHERE channel_id = ${value}`);
	},
};