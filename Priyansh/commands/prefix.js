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
  const { threadID, messageID, body } = event;

  function sendReply(message) {
    return api.sendMessage(message, threadID, messageID);
  }

  const threadData = await Threads.getData(threadID);
  const data = threadData.data || {};
  const threadSettings = global.data.threadData.get(parseInt(threadID)) || {};

  const triggerPhrases = [
    "mpre", "mprefix", "prefix", "command symbol", "what is the bot prefix",
    "daulenh", "what prefix", "freefix", "what is the prefix",
    "bot dead", "bots dead", "where prefix", "what is bot", "what prefix bot",
    "how to use bot", "how use bot", "where are the bots", "bot not working",
    "bot is offline", "prefx", "prfix", "prifx", "perfix",
    "bot not talking", "where is bot"
  ];

  triggerPhrases.forEach(phrase => {
    const capitalized = phrase.charAt(0).toUpperCase() + phrase.slice(1);

    if (body === phrase || body === phrase.toUpperCase() || body === capitalized) {
      const prefix = threadSettings.PREFIX || global.config.PREFIX || "!";

      if (!data.PREFIX) {
        return sendReply(
          `This is my prefix: [ ${prefix} ]`
        );
      } else {
        return sendReply(
          `This is my prefix: [ ${prefix} ]\n` +
          `Custom thread prefix: ${data.PREFIX}`
        );
      }
    }
  });
};

module.exports.run = async ({ event, api }) => {
  return api.sendMessage("This command shows the current prefix when triggered by keyword.", event.threadID);
};
