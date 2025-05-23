const axios = require("axios");

module.exports.config = {
  name: "sim1",
  version: "4.3.7",
  hasPermssion: 0,
  credits: "Vraxyxx",
  description: "Chat with SimSimi AI. Fixed by Vrax.",
  commandCategory: "AI Chat",
  usages: "[message] | on | off",
  cooldowns: 5,
  dependencies: {
    axios: ""
  }
};

async function simsimi(query) {
  const apiKey = "free"; // Use 'free' or your own API key
  try {
    const { data } = await axios.get(`https://simsimi.ooguy.com/sim?query=${encodeURIComponent(query)}&apikey=${apiKey}`);
    return { error: false, data };
  } catch (err) {
    return { error: true, data: {} };
  }
}

module.exports.onLoad = async function () {
  if (typeof global.simsimi === "undefined") {
    global.simsimi = new Map();
  }
};

module.exports.handleEvent = async function ({ api, event }) {
  const { threadID, messageID, senderID, body } = event;
  const send = (msg) => api.sendMessage(msg, threadID, messageID);

  // Only respond if SimSimi is enabled for this chat
  if (global.simsimi.has(threadID)) {
    if (senderID === api.getCurrentUserID() || !body || messageID === global.simsimi.get(threadID)) return;

    const { data, error } = await simsimi(body);
    if (error) return;

    return data.success ? send(data.success) : send(data.error || "No response from SimSimi.");
  }
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const send = (msg) => api.sendMessage(msg, threadID, messageID);

  if (args.length === 0) return send("Please type something for SimSimi to reply.");

  const command = args[0].toLowerCase();

  switch (command) {
    case "on":
      if (global.simsimi.has(threadID)) return send("SimSimi is already enabled in this chat.");
      global.simsimi.set(threadID, messageID);
      return send("SimSimi has been activated for this chat.");

    case "off":
      if (!global.simsimi.has(threadID)) return send("SimSimi is not enabled in this chat.");
      global.simsimi.delete(threadID);
      return send("SimSimi has been deactivated for this chat.");

    default:
      const input = args.join(" ");
      const { data, error } = await simsimi(input);
      if (error) return send("Failed to connect to SimSimi API.");
      return data.success ? send(data.success) : send(data.error || "SimSimi did not respond.");
  }
};
