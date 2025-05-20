module.exports.config = {
    name: "sim",
    version: "4.3.7",
    hasPermssion: 0,
    credits: "Vrax (Fixed & Maintained by Vern)",
    description: "Chat with SimSimi AI.",
    commandCategory: "AI Chat",
    usages: "[message] | on | off",
    cooldowns: 5,
    dependencies: {
        axios: ""
    },
    envConfig: {
        APIKEY: "Priyansh_1234567890"
    }
};

const axios = require("axios");

// SimSimi API caller
async function simsimi(query) {
    const { APIKEY } = global.configModule.sim;
    try {
        const { data } = await axios.get(`https://simsimi.ooguy.com/sim?query=${encodeURIComponent(query)}&apikey=${APIKEY}`);
        return { error: false, data };
    } catch (err) {
        return { error: true, data: {} };
    }
}

// Initialize the global map
module.exports.onLoad = async function () {
    if (typeof global.manhG === "undefined") global.manhG = {};
    if (typeof global.manhG.simsimi === "undefined") global.manhG.simsimi = new Map();
};

// Handle incoming messages if SimSimi is active in the thread
module.exports.handleEvent = async function ({ api, event }) {
    const { threadID, messageID, senderID, body } = event;

    if (!global.manhG.simsimi.has(threadID)) return;
    if (senderID === api.getCurrentUserID() || !body || messageID === global.manhG.simsimi.get(threadID)) return;

    const { data, error } = await simsimi(body);
    if (error) return;

    return api.sendMessage(data.answer || data.error || "SimSimi didn't respond.", threadID, messageID);
};

// Command to turn SimSimi on/off or send a message
module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID } = event;

    function send(msg) {
        return api.sendMessage(msg, threadID, messageID);
    }

    if (args.length === 0) {
        return send("[ SIM ] - You haven't entered a message yet.");
    }

    const command = args[0].toLowerCase();

    switch (command) {
        case "on":
            if (global.manhG.simsimi.has(threadID)) {
                return send("[ SIM ] - SimSimi is already active in this thread.");
            }
            global.manhG.simsimi.set(threadID, messageID);
            return send("[ SIM ] - SimSimi has been enabled for this thread.");

        case "off":
            if (!global.manhG.simsimi.has(threadID)) {
                return send("[ SIM ] - SimSimi is not currently active in this thread.");
            }
            global.manhG.simsimi.delete(threadID);
            return send("[ SIM ] - SimSimi has been disabled for this thread.");

        default:
            const { data, error } = await simsimi(args.join(" "));
            if (error) return send("[ SIM ] - Something went wrong while contacting the AI.");
            return send(data.answer || data.error || "No response from SimSimi.");
    }
};
