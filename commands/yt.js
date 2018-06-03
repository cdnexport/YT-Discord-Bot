const broker = require('../db/broker.js');
let message = null;
module.exports = {
	name: 'yt',
	description: 'Link a random youtube video.',
	cooldown: 5,
	args: false,
	execute(msg, args) {
		message = msg;
		switch (args[0]) {
			case '-h':
				message.channel.send('Use "!yt" for a random video.\nUse "!yt 20" for video number 20');
				break;
			case '-l':
				args.shift();
				this.modifyListeningChannels(args[0], 'insert', broker.insertListeningChannel);
				break;
			case '-stop':
				args.shift();
				this.modifyListeningChannels(args[0], 'delete', broker.deleteListeningChannel);
				break;
			default:
				this.defaultActionWithNoSubArgs(args);
				break;
		}
	},
	modifyListeningChannels(channel, dbAction, method) {
		const channelRegEx = /[0-9]{18}/g;
		if (channel && (channel = channel.match(channelRegEx))) {
			broker.getListeningChannel(channel).then((foundChannel) => {
				if (foundChannel && dbAction.toLowerCase() === 'insert') {
					return message.reply(`<#${channel}> is already being listened to.`);
				}
				else if (!foundChannel && dbAction.toLowerCase() === 'delete') {
					return message.reply(`<#${channel}> isn't being listened to.`);
				}
				method(channel);
			});
		}
		else {
			message.reply('You must specify a valid channel');
		}
	},
	defaultActionWithNoSubArgs(args) {
		if (args[0]) {
			this.linkSpecificVideo(args[0]);
		}
		else {
			this.linkRandomVideo();
		}
	},
	linkRandomVideo() {
		broker.getMaxLinkId().then((id) => {
			const max = id.id;
			const randomId = Math.floor(Math.random() * max) + 1;

			broker.getLink(randomId).then((link) => {
				message.reply(`Video: ${link.id} ${link.link}`);
			}).catch((err) => {
				message.channel.send(`Error: ${err}`);
			});
		});
	},
	linkSpecificVideo(videoId) {
		const numRegEx = /^[1-9][0-9]*$/g;
		if (!videoId.match(numRegEx)) {
			message.channel.send(`${videoId} is an invalid video number.`);
		}
		else {
			broker.getLink(videoId).then((link) => {
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
};
