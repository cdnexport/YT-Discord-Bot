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
			case '-l':
				args.shift();
				this.modifyListeningChannels(message, args[0], db, 'insert', this.insertListeningChannel);
				break;
			case '-stop':
				args.shift();
				this.modifyListeningChannels(message, args[0], db, 'delete', this.deleteListeningChannel);
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
	modifyListeningChannels(message, channel, db, dbAction, method) {
		const channelRegEx = /[0-9]{18}/g;
		if (channel && (channel = channel.match(channelRegEx))) {
			db.getAsync(`SELECT channel_id FROM listening_channels WHERE channel_id = ${channel}`).then((foundChannel) => {
				if (foundChannel && dbAction.toLowerCase() == 'insert') {
					return message.reply(`<#${channel}> is already being listened to.`);
				}
				else if (!foundChannel && dbAction.toLowerCase() == 'delete') {
					return message.reply(`<#${channel}> isn't being listened to.`);
				}
				method(db, channel);
			});
		}
		else {
			message.reply('You must specify a valid channel');
		}
	},
	// I dream of the day DB is an object and these methods can GTFO of here and into there
	insertListeningChannel(db, value) {
		db.run(`INSERT INTO listening_channels(channel_id) VALUES (${value})`);
	},
	deleteListeningChannel(db, value) {
		db.run(`DELETE FROM listening_channels WHERE channel_id = ${value}`);
	},
};
