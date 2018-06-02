const discord = require('discord.js');

const client = new discord.Client();

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db/yt.db');

client.commands = new discord.Collection();

const fs = require('fs');
const cmdFiles = fs.readdirSync('./commands');

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

	const isChannelValid = await validateChannel(message, db);
	if (isChannelValid === false) {
		return;
	}

	const links = message.content.match(linkRegEx);
	if (links) {
		for (let i = 0; i < links.length; i++) {
			saveNewLink(links[i], db);
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
		cmd.execute(message, args, db);
	}
	catch (error) {
		console.error(error);
		writeToLog(error);
		message.reply('An error occured.');
	}
});

client.login(token);

function saveNewLink(link, db) {
	db.getAsync(`SELECT * FROM yt_links WHERE link = '${link}'`).then((val) => {
		if (!val) {
			const sql = `INSERT INTO yt_links (link) VALUES ('${link}')`;
			db.run(sql);
			const now = (new Date() + '').substring(0, 24);
			writeToLog(`Saved ${link} at ${now}`);
		}
		else {
			writeToLog(`can't insert ${link}`);
		}
	}).catch((err) => {
		console.error(err);
	});
}


function writeToLog(content) {
	console.log(content);
}

db.getAsync = (sql) => {
	return new Promise((resolve, reject) => {
		db.get(sql, (err, row) => {
			if (err) reject(err);
			else resolve(row);
		});
	});
};

db.allAsync = (sql) => {
	return new Promise((resolve, reject) => {
		db.all(sql, (err, values) => {
			if (err) {
				reject(err);
			}
			else {
				resolve(values);
			}
		});
	});
};

function validateChannel(message, db) {
	return new Promise((resolve, reject) => {
		const channelRegEx = /[0-9]{18}/g;
		const currentChannel = message.channel.id.match(channelRegEx) + '';

		db.allAsync('SELECT channel_id FROM listening_channels').then((listeningChannels) => {
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
