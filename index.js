const discord = require('discord.js');
const fs = require('fs');
const broker = require('./db/broker.js');

const client = new discord.Client();
const cmdFiles = fs.readdirSync('./commands');

client.commands = new discord.Collection();

for (const file of cmdFiles) {
	const cmd = require(`./commands/${file}`);
	client.commands.set(cmd.name, cmd);
}

const { prefix, token } = require('./config.json');
const cooldowns = new discord.Collection();

client.on('ready', () => {
	console.log('Ready!');
});

const linkRegEx = /(https:\/\/www\.youtube\.com\/watch\?v=.{11})/gm;

client.on('message', async (message) => {
	if (message.author.bot) return;

	const isChannelValid = await validateChannel(message);
	if (isChannelValid === false) {
		return;
	}

	const links = message.content.match(linkRegEx);
	if (links) {
		for (let i = 0; i < links.length; i++) {
			saveNewLink(links[i]);
		}
	}

	if (!message.content.startsWith(prefix)) {
		return;
	}

	const args = message.content.slice(prefix.length).split(/ +/);
	const cmdName = args.shift().toLowerCase();

	if (!client.commands.has(cmdName)) {
		return message.channel.send(`Invalid command: ${cmdName}`);
	}

	const cmd = client.commands.get(cmdName);
	if (cmd.args && !args.length) {
		let reply = 'Arguments need to be provided.';

		if (cmd.usage) {
			reply += `\nUse '${cmd.name}' like this: '${cmd.usage}'`;
		}

		return message.channel.send(reply);
	}

	if (!cooldowns.has(cmd.name)) {
		cooldowns.set(cmd.name, new discord.Collection());
	}

	const now = Date.now();
	const timestamps = cooldowns.get(cmd.name);
	const cdAmount = (cmd.cooldown || 3) * 1000;
	if (!timestamps.has(message.author.id)) {
		timestamps.set(message.author.id, now);
		setTimeout(() => {
			timestamps.delete(message.author.id);
		}, cdAmount);
	}
	else {
		const expireTime = timestamps.get(message.author.id) + cdAmount;

		if (now < expireTime) {
			const timeLeft = (expireTime - now) / 1000;
			return message.reply(`Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the '${cmd.name}' command.`);
		}

		timestamps.set(message.author.id, now);
		setTimeout(() => {
			timestamps.delete(message.author.id);
		}, cdAmount);
	}

	try {
		cmd.execute(message, args);
	}
	catch (error) {
		writeToLog(error);
		message.reply('An error occured.');
	}
});

client.login(token);

function saveNewLink(link) {
	broker.isLinkInDb(link).then((val) => {
		if (!val) {
			broker.insertLink(link);
			writeToLog(`Saved ${link}`);
		}
		else {
			writeToLog(`Can't insert ${link}`);
		}
	}).catch((err) => {
		console.error(err);
	});
}

function writeToLog(message) {
	const today = new Date(),
		logFolder = `${__dirname}/logs/`,
		logName = `${today.toDateString().substring(4).split(' ').join('-')}.log`,
		logFullName = logFolder + logName,
		content = `${today.toString().substring(16, 24)}: ${message}\n`;

	console.log(content.substring(0, content.length - 2));
	if (!fs.existsSync(logFolder)) {
		fs.mkdirSync(logFolder);
	}
	fs.appendFile(logFullName, content, (err) => {
		if (err) {
			console.error(err);
		}
	});
}

function validateChannel(message) {
	return new Promise((resolve, reject) => {
		const channelRegEx = /[0-9]{18}/g;
		const currentChannel = message.channel.id.match(channelRegEx) + '';
		broker.getAllListeningChannels().then((listeningChannels) => {
			for (let i = 0; i < listeningChannels.length; i++) {
				listeningChannels[i] = listeningChannels[i].channel_id;
			}

			if (!listeningChannels.includes(currentChannel) && listeningChannels.length !== 0) {
				resolve(false);
			}
			else {
				resolve(true);
			}
		}).catch((err) => {
			reject(err);
		});
	});
}
