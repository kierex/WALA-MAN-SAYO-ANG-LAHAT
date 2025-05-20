module.exports.config = {
    name: "joinNoti",
    eventType: ["log:subscribe"],
    version: "1.0.1",
    credits: "Priyansh Rajput",
    description: "Sends a welcome notification with a random gif/photo/video when a user or bot joins a group.",
    dependencies: {
        "fs-extra": "",
        "path": "",
        "pidusage": ""
    }
};

module.exports.onLoad = function () {
    const { existsSync, mkdirSync } = global.nodemodule["fs-extra"];
    const { join } = global.nodemodule["path"];

    const videoPath = join(__dirname, "cache", "joinvideo");
    const gifPath = join(videoPath, "randomgif");

    if (!existsSync(videoPath)) mkdirSync(videoPath, { recursive: true });
    if (!existsSync(gifPath)) mkdirSync(gifPath, { recursive: true });
};

module.exports.run = async function({ api, event }) {
    const { join } = global.nodemodule["path"];
    const { threadID } = event;

    // When the bot joins the group
    if (event.logMessageData.addedParticipants.some(i => i.userFbId == api.getCurrentUserID())) {
        api.changeNickname(`[ ${global.config.PREFIX} ] • ${global.config.BOTNAME || "Bot"}`, threadID, api.getCurrentUserID());
        const fs = require("fs");

        const botIntro = `
🤖 Bot Connected!

👋 Hello everyone! My name is ✦Vrax✦.

📌 Prefix: ${global.config.PREFIX}
🛠️ Use "${global.config.PREFIX}help" to see my commands.

💡 Example:
${global.config.PREFIX}quote (text)
${global.config.PREFIX}photo

👤 My owner is: Vraxyxx 

📬 Contact:
Facebook: www.facebook.com/revn.19
GitHub: http://github.com/vraxyxx 
        `;

        return api.sendMessage("", threadID, () => 
            api.sendMessage({ 
                body: botIntro,
                attachment: fs.createReadStream(__dirname + "/cache/botjoin.mp4") 
            }, threadID)
        );
    }

    // When other users join the group
    try {
        const { createReadStream, existsSync, mkdirSync, readdirSync } = global.nodemodule["fs-extra"];
        const { threadName, participantIDs } = await api.getThreadInfo(threadID);
        const threadData = global.data.threadData.get(parseInt(threadID)) || {};
        const gifFolderPath = join(__dirname, "cache", "joinvideo", "randomgif");
        const videoPath = join(__dirname, "cache", "joinvideo", `${threadID}.video`);

        let mentions = [], nameArray = [], memberCount = [], i = 0;

        for (const user of event.logMessageData.addedParticipants) {
            const userName = user.fullName;
            nameArray.push(userName);
            mentions.push({ tag: userName, id: user.userFbId });
            memberCount.push(participantIDs.length - i++);
        }

        memberCount.sort((a, b) => a - b);

        let msg = threadData.customJoin || 
`👋 Welcome {name}!

🎉 You are the {soThanhVien} member of "${threadName}" group.

🤗 Enjoy your stay and make lots of friends!

💡 Tip: Use ${global.config.PREFIX}help to see what I can do.`;

        msg = msg
            .replace(/\{name}/g, nameArray.join(', '))
            .replace(/\{type}/g, (memberCount.length > 1) ? 'friends' : 'friend')
            .replace(/\{soThanhVien}/g, memberCount.join(', '))
            .replace(/\{threadName}/g, threadName);

        let formPush;
        const randomFiles = readdirSync(gifFolderPath);

        if (existsSync(videoPath)) {
            formPush = { body: msg, attachment: createReadStream(videoPath), mentions };
        } else if (randomFiles.length !== 0) {
            const randomGif = join(gifFolderPath, `${randomFiles[Math.floor(Math.random() * randomFiles.length)]}`);
            formPush = { body: msg, attachment: createReadStream(randomGif), mentions };
        } else {
            formPush = { body: msg, mentions };
        }

        return api.sendMessage(formPush, threadID);
    } catch (e) {
        console.error(e);
    }
};
