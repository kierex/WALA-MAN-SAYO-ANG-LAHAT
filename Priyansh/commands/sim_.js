module.exports.config = {
    name: "sim",
    version: "4.3.7",
    hasPermssion: 0,
    credits: "Vrax",
    description: "Chat with SimSimi AI. Fixed and maintained by Priyansh Rajput.",
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

async function simsimi(message) {
    const { APIKEY } = global.configModule.sim;
    const encodedMessage = encodeURIComponent(message);
    try {
        const { data } = await axios({
            url: `https://sim-api-by-priyansh.glitch.me/sim?type=ask&ask=${encodedMessage}&apikey=PriyanshVip`,
            method: "GET"
        });
        return { error: false, data };
    } catch (err) {
        return { error: true, data: {} };
    }
}

module.exports.onLoad = async function () {
    if (typeof global.manhG === "undefined") global.manhG = {};
    if (typeof global.manhG.simsimi === "undefined") global.manhG.simsimi = new Map();
};

module.exports.handleEvent = async function ({ api, event }) {
    const { threadID, messageID, senderID, body } = event;

    if (!global.manhG.simsimi.has(threadID)) return;
    if (senderID === api.getCurrentUserID() || !body || messageID === global.manhG.simsimi.get(threadID)) return;

    const { data, error } = await simsimi(body);
    if (error) return;

    return api.sendMessage(data.answer || data.error, threadID, messageID);
};

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
            return send(data.answer || data.error);
    }
};
