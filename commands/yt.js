module.exports = {
	name: 'yt',
	description: 'Link a random youtube video.',
	cooldown: 5,
	args: false,
	usage: '!yt -> for a random link to be posted.',
	execute(message, args, db) {
		db.getAsync('SELECT MAX(ID) as id FROM yt_links').then((id) => {
			const max = id.id;
			const randomId = Math.floor(Math.random() * max) + 1;
			const sql = `SELECT * FROM yt_links WHERE id = ${randomId}`;

			db.get(sql, (err, link) => {
				if(err) return console.log(err);
				console.log(link);
				message.reply(`Video: ${link.id} ${link.link}`);
			});
		});
	},
};