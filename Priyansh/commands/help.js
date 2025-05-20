module.exports.config = {
	name: "help",
	version: "1.0.2",
	hasPermssion: 0,
	credits: "Vrax",
	description: "Beginner's guide to bot commands",
	commandCategory: "System",
	usages: "[command name]",
	cooldowns: 1,
	envConfig: {
		autoUnsend: true,
		delayUnsend: 300
	}
};

module.exports.languages = {
	"en": {
		"moduleInfo": "「 %1 」\n%2\n\n❯ Usage: %3\n❯ Category: %4\n❯ Cooldown: %5 second(s)\n❯ Permission: %6\n\n» Module coded by %7 «",
		"helpList": '[ There are currently %1 commands available in this bot. Use: "%2help [command name]" to see details! ]',
		"user": "User",
		"adminGroup": "Group Admin",
		"adminBot": "Bot Admin"
	}
};

module.exports.handleEvent = function ({ api, event, getText }) {
	const { commands } = global.client;
	const { threadID, messageID, body } = event;

	if (!body || typeof body == "undefined" || !body.toLowerCase().startsWith("help")) return;

	const splitBody = body.trim().split(/\s+/);
	if (splitBody.length == 1 || !commands.has(splitBody[1].toLowerCase())) return;

	const threadSetting = global.data.threadData.get(parseInt(threadID)) || {};
	const command = commands.get(splitBody[1].toLowerCase());
	const prefix = (threadSetting.hasOwnProperty("PREFIX")) ? threadSetting.PREFIX : global.config.PREFIX;

	return api.sendMessage(
		getText(
			"moduleInfo",
			command.config.name,
			command.config.description,
			`${prefix}${command.config.name} ${(command.config.usages || "")}`,
			command.config.commandCategory,
			command.config.cooldowns,
			(command.config.hasPermssion == 0) ? getText("user") :
			(command.config.hasPermssion == 1) ? getText("adminGroup") : getText("adminBot"),
			command.config.credits
		),
		threadID,
		messageID
	);
};

module.exports.run = function ({ api, event, args, getText }) {
	const { commands } = global.client;
	const { threadID, messageID } = event;
	const command = commands.get((args[0] || "").toLowerCase());
	const threadSetting = global.data.threadData.get(parseInt(threadID)) || {};
	const { autoUnsend, delayUnsend } = global.configModule[this.config.name];
	const prefix = (threadSetting.hasOwnProperty("PREFIX")) ? threadSetting.PREFIX : global.config.PREFIX;

	if (!command) {
		const arrayInfo = [];
		const page = parseInt(args[0]) || 1;
		const itemsPerPage = 10;
		let i = 0;
		let msg = "";

		for (const [name] of commands) {
			arrayInfo.push(name);
		}

		arrayInfo.sort();

		const start = itemsPerPage * (page - 1);
		const end = start + itemsPerPage;
		const returnArray = arrayInfo.slice(start, end);

		for (const item of returnArray) {
			msg += `「 ${++i + start} 」${prefix}${item}\n`;
		}

		const header = `📄 Command List\nMade by Priyansh Rajput 🥀\nFor more info, type: ${prefix}help [command name] ✨`;
		const footer = `\nPage (${page}/${Math.ceil(arrayInfo.length / itemsPerPage)})`;

		return api.sendMessage(`${header}\n\n${msg}${footer}`, threadID, async (error, info) => {
			if (autoUnsend) {
				await new Promise(resolve => setTimeout(resolve, delayUnsend * 1000));
				return api.unsendMessage(info.messageID);
			}
		}, messageID);
	}

	// If specific command is found
	return api.sendMessage(
		getText(
			"moduleInfo",
			command.config.name,
			command.config.description,
			`${prefix}${command.config.name} ${(command.config.usages || "")}`,
			command.config.commandCategory,
			command.config.cooldowns,
			(command.config.hasPermssion == 0) ? getText("user") :
			(command.config.hasPermssion == 1) ? getText("adminGroup") : getText("adminBot"),
			command.config.credits
		),
		threadID,
		messageID
	);
};
