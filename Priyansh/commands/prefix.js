module.exports.config = {
  name: "prefix",
  version: "1.0.0",
  hasPermission: 0,
  credits: "Vrax",
  description: "Provides details about the current prefix",
  commandCategory: "Admin",
  usages: "",
  cooldowns: 5,
};

module.exports.handleEvent = async ({ event, api, Threads }) => {
  const { threadID, messageID, body, senderID } = event;

  // Prevent unauthorized credit changes
  if (this.config.credits !== "Priyansh Rajput") {
    return api.sendMessage(
      "Please do not change the credits to Priyansh Rajput",
      threadID,
      messageID
    );
  }

  function sendReply(message) {
    return api.sendMessage(message, threadID, messageID);
  }

  // Get thread data and global thread settings
  const threadData = await Threads.getData(threadID);
  const data = threadData.data || {};
  const threadSettings = global.data.threadData.get(parseInt(threadID)) || {};

  // List of phrases to trigger the prefix info reply
  const triggerPhrases = [
    "mpre", "mprefix", "prefix", "command symbol", "what is the bot prefix",
    "daulenh", "prefix", "what prefix", "freefix", "what is the prefix",
    "bot dead", "bots dead", "where prefix", "what is bot", "what prefix bot",
    "how to use bot", "how use bot", "where are the bots", "bot not working",
    "bot is offline", "where prefix", "prefx", "prfix", "prifx", "perfix",
    "bot not talking", "where is bot"
  ];

  triggerPhrases.forEach(phrase => {
    const capitalized = phrase.charAt(0).toUpperCase() + phrase.slice(1);

    if (body === phrase || body === phrase.toUpperCase() || body === capitalized) {
      const prefix = threadSettings.PREFIX || global.config.PREFIX || "!";

      if (!data.PREFIX) {
        return sendReply(
          `This is my prefix: [ ${prefix} ]\n` +
          `💝🥀 OWNER: ☞ VRAXYXX ☜ 💫\n` +
          `🖤 You can call him Vrax 🖤\n` +
          `😳 His Facebook: ☞ www.facebook.com/revn.19\n` +
          `👋 For any help, contact on GitHub: @vraxyxx 👾`
        );
      } else {
        return sendReply(
          `This is my prefix: [ ${prefix} ]\n` +
          `💝🥀 OWNER: ☞ VRAXYXX ☜ 💫\n` +
          `🖤 You can call him Vrax 🖤\n` +
          `😳 His Facebook: ☞ www.facebook.com/revn.19\n` +
          `👋 For any help, contact on GitHub: @vraxyxx 👾\n` +
          `Current custom prefix: ${data.PREFIX}`
        );
      }
    }
  });
};

module.exports.run = async ({ event, api }) => {
  return api.sendMessage("error", event.threadID);
};
