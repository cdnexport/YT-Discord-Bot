module.exports = {
	name: 'yt',
	description: 'Link a random youtube video.',
	cooldown: 5,
	args: false,
	execute(message, args, db) {
		const numRegEx = /^[1-9][0-9]*$/g;
		switch (args[0]) {
			case '-h':
				message.channel.send('Use "!yt" for a random video.\nUse "!yt 20" for video number 20');
				break;
			default:
				if (args[0]) {
					if (!args[0].match(numRegEx)) {
						message.channel.send(`${args[0]} is an invalid video number.`);
					}
					else {
						db.get(`SELECT * FROM yt_links WHERE id = ${args[0]}`, (err, link) => {
							if (err) return message.channel.send('Error: ' + err);
							if (link) message.reply(`Video: ${link.id} ${link.link}`);
							else message.reply('Your video number is too high.');
						});
					}
				}
				else {
					db.getAsync('SELECT MAX(ID) as id FROM yt_links').then((id) => {
						const max = id.id;
						const randomId = Math.floor(Math.random() * max) + 1;
						const sql = `SELECT * FROM yt_links WHERE id = ${randomId}`;

						db.get(sql, (err, link) => {
							if (err) return console.log('my ' + err);
							message.reply(`Video: ${link.id} ${link.link}`);
						});
					});
				}
				break;
		}
	},
};
