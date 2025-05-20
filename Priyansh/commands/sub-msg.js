const fs = require("fs");

module.exports.config = {
	name: "sub",
	version: "1.0.1",
	hasPermssion: 0,
	credits: "Vrax",
	description: "Sends a message with a subscription link when triggered",
	commandCategory: "No Prefix",
	usages: "sub",
	cooldowns: 5
};

module.exports.handleEvent = function({ api, event }) {
	const { threadID, messageID, body } = event;

	if (!body) return;

	const triggerWords = ["Priyansh rajput", "Sub", "Subscribe", "Priyansh"];
	const isTriggered = triggerWords.some(trigger => body.toLowerCase().startsWith(trigger.toLowerCase()));

	if (isTriggered) {
		const msg = {
			body: "👋 For any kind of help, contact me on Telegram!\nUsername 👉 @Priyanshrajput 😇",
			attachment: fs.createReadStream(__dirname + `/noprefix/sub.mp3`)
		};

		api.sendMessage(msg, threadID, messageID);
		api.setMessageReaction("🔔", messageID, () => {}, true);
	}
};

module.exports.run = function({ api, event }) {
	// No command logic since this is a no-prefix trigger
};
