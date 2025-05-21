module.exports.config = {
    name: "sim",
    version: "4.3.7",
    hasPermission: 0,
    credits: "Vraxyxx",
    description: "Chat with SimSimi AI. Fixed and maintained by Vrax.",
    commandCategory: "AI Chat",
    usages: "[message]",
    cooldowns: 5,
    dependencies: {
        axios: ""
    },
    envConfig: {
        APIKEY: "Priyansh_1234567890"
    }
}

const axios = require("axios");

async function simsimi(message) {
    const { APIKEY } = global.configModule.sim;
    const encodedMessage = encodeURIComponent(message);
    try {
        // Using a custom SimSimi API endpoint with a fixed API key
        const { data } = await axios.get(`https://sim-api-by-priyansh.glitch.me/sim?type=ask&ask=${encodedMessage}&apikey=PriyanshVip`);
        return { error: false, data };
    } catch (error) {
        return { error: true, data: {} };
    }
}

module.exports.onLoad = async function() {
    if (typeof global.manhG === "undefined") global.manhG = {};
    if (typeof global.manhG.simsimi === "undefined") global.manhG.simsimi = new Map();
};

module.exports.handleEvent = async function({ api, event }) {
    const { threadID, messageID, senderID, body } = event;

    // If SimSimi is active in this thread
    if (global.manhG.simsimi.has(threadID)) {
        // Ignore messages from the bot itself, empty messages, or duplicate messages
        if (senderID === api.getCurrentUserID() || !body || messageID === global.manhG.simsimi.get(threadID)) return;

        const { data, error } = await simsimi(body);
        if (error) return;

        // Send the AI's response or an error message
        return api.sendMessage(data.answer || "Sorry, I couldn't understand that.", threadID, messageID);
    }
}

module.exports.run = async function({ api, event, args }) {
    const { threadID, messageID } = event;

    function sendMessage(text) {
        return api.sendMessage(text, threadID, messageID);
    }

    if (args.length === 0) {
        return sendMessage("[SIM] - Please enter a message.");
    }

    const command = args[0].toLowerCase();

    switch (command) {
        case "on":
            if (global.manhG.simsimi.has(threadID)) {
                return sendMessage("[SIM] - SimSimi is already enabled in this chat.");
            }
            global.manhG.simsimi.set(threadID, messageID);
            return sendMessage("[SIM] - SimSimi has been enabled.");

        case "off":
            if (!global.manhG.simsimi.has(threadID)) {
                return sendMessage("[SIM] - SimSimi is not enabled in this chat.");
            }
            global.manhG.simsimi.delete(threadID);
            return sendMessage("[SIM] - SimSimi has been disabled.");

        default:
            const { data, error } = await simsimi(args.join(" "));
            if (error) return sendMessage("[SIM] - An error occurred while contacting the AI.");
            return sendMessage(data.answer || "Sorry, I couldn't find a response.");
    }
};
