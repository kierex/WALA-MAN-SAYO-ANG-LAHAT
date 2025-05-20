const axios = require("axios");

module.exports.config = {
  name: "sim1",
  version: "4.3.7",
  hasPermssion: 0,
  credits: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭",
  description: "Chat with SimSimi AI. Fixed by 𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡",
  commandCategory: "Chat same sim",
  usages: "[args]",
  cooldowns: 5,
  dependencies: {
    axios: ""
  }
};

async function simsimi(query) {
  const apiKey = "free"; // Use 'free' or your real key if you have one
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

  if (global.simsimi.has(threadID)) {
    if (senderID == api.getCurrentUserID() || !body || messageID == global.simsimi.get(threadID)) return;

    const { data, error } = await simsimi(body);
    if (error) return;

    return !data.success ? send(data.error) : send(data.success);
  }
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const send = (msg) => api.sendMessage(msg, threadID, messageID);

  if (args.length === 0) return send("Jee BoLo Meri Jaan (ღ˘⌣˘ღ)");

  switch (args[0]) {
    case "on":
      if (global.simsimi.has(threadID)) return send("Sim is already on.");
      global.simsimi.set(threadID, messageID);
      return send("SimSimi is now enabled.");
    case "off":
      if (!global.simsimi.has(threadID)) return send("Sim is already off.");
      global.simsimi.delete(threadID);
      return send("SimSimi is now disabled.");
    default:
      const input = args.join(" ");
      const { data, error } = await simsimi(input);
      if (error) return;
      return !data.success ? send(data.error) : send(data.success);
  }
};
