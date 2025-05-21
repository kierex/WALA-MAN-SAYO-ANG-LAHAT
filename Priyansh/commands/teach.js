module.exports.config = {
    name: "teach",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Priyansh Rajput",
    description: "Sim learning by teaching",
    commandCategory: "Sim",
    usages: "",
    cooldowns: 2,
    dependencies: {
        "axios": ""
    }
};
var API_KEY = "";
module.exports.run = ({ api, event, args }) => {
    const { threadID, messageID, senderID } = event;
    return api.sendMessage("[SIM] - Please reply to this message with a question for Simmi.", threadID, (err, info) => {
        global.client.handleReply.push({
            step: 1,
            name: this.config.name,
            messageID: info.messageID,
            content: {
                id: senderID,
                ask: "",
                ans: ""
            }
        })
    }, messageID);
}
module.exports.handleReply = async({ api, event, Users, handleReply }) => {
    const axios = require("axios");
    const fs = require("fs");
    const moment = require("moment-timezone");
    var timeZ = moment.tz("Asia/Kolkata").format("HH:mm:ss | DD/MM/YYYY");
    const { threadID, messageID, senderID, body } = event;
    let by_name = (await Users.getData(senderID)).name;
    if (handleReply.content.id != senderID) return;
    const input = body.trim();
    const sendC = (msg, step, content) => api.sendMessage(msg, threadID, (err, info) => {
        global.client.handleReply.splice(global.client.handleReply.indexOf(handleReply), 1);
        api.unsendMessage(handleReply.messageID);
        global.client.handleReply.push({
            step: step,
            name: this.config.name,
            messageID: info.messageID,
            content: content
        })
    }, messageID);
    const send = async(msg) => api.sendMessage(msg, threadID, messageID);

    let content = handleReply.content;
    switch (handleReply.step) {
        case 1:
            content.ask = input;
            sendC("[SIM] - Now reply to this message with the answer.", 2, content);
            break;

        case 2:
            content.ans = input;
            global.client.handleReply.splice(global.client.handleReply.indexOf(handleReply), 1);
            api.unsendMessage(handleReply.messageID);
            let c = content;
            let res = await axios.get(encodeURI(`https://sim-api-by-priyansh.glitch.me/sim?type=teach&ask=${c.ask}&ans=${c.ans}&apikey=PriyanshVip`));
            if (res.data.error) return send(`Error: ${res.data.error}`);
            send(`[SIM] - Teaching successful! Preview:\n\nQuestion:\n${c.ask}\nAnswer:\n${c.ans}\n\nTime recorded: ${timeZ}`);
            break;
        default:
            break;
    }
}
