module.exports = {
	name: 'yt',
	description: 'Link a random youtube video.',
	cooldown: 5,
	args: false,
	execute(message, args, db) {
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
				this.defaultActionWithNoSubArgs(message, db, args);
				break;
		}
	},
	modifyListeningChannels(message, channel, db, dbAction, method) {
		const channelRegEx = /[0-9]{18}/g;
		if (channel && (channel = channel.match(channelRegEx))) {
			db.getAsync(`SELECT channel_id FROM listening_channels WHERE channel_id = ${channel}`).then((foundChannel) => {
				if (foundChannel && dbAction.toLowerCase() === 'insert') {
					return message.reply(`<#${channel}> is already being listened to.`);
				}
				else if (!foundChannel && dbAction.toLowerCase() === 'delete') {
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
	defaultActionWithNoSubArgs(message, db, args) {
		if (args[0]) {
			this.linkSpecificVideo(message, db, args[0]);
		}
		else {
			this.linkRandomVideo(message, db);
		}
	},
	linkSpecificVideo(message, db, videoId) {
		const numRegEx = /^[1-9][0-9]*$/g;
		if (!videoId.match(numRegEx)) {
			message.channel.send(`${videoId} is an invalid video number.`);
		}
		else {
			db.getAsync(`SELECT * FROM yt_links WHERE id = ${videoId}`).then((link) => {
				if (link) {
					message.reply(`Video: ${link.id} ${link.link}`);
				}
				else {
					message.reply('Your video number is too high.');
				}
			}).catch((err) => {
				return message.channel.send(`Error: ${err}`);
			});
		}
	},
	linkRandomVideo(message, db) {
		db.getAsync('SELECT MAX(ID) as id FROM yt_links').then((id) => {
			const max = id.id;
			const randomId = Math.floor(Math.random() * max) + 1;

			db.getAsync(`SELECT * FROM yt_links WHERE id = ${randomId}`).then((link) => {
				message.reply(`Video: ${link.id} ${link.link}`);
			}).catch((err) => {
				message.channel.send(`Error: ${err}`);
			});
		});
	},
};
