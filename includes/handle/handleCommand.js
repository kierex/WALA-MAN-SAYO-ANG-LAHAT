module.exports = function ({ api, models, Users, Threads, Currencies }) {
    const stringSimilarity = require('string-similarity'),
        escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        logger = require("../../utils/log.js");
    const moment = require("moment-timezone");

    return async function ({ event }) {
        const currentTimestamp = Date.now();
        const formattedTime = moment.tz("Asia/Kolkata").format("HH:MM:ss DD/MM/YYYY");
        const { allowInbox, PREFIX, ADMINBOT, DeveloperMode, adminOnly } = global.config;

        const { userBanned, threadBanned, threadInfo, threadData, commandBanned } = global.data;
        const { commands, cooldowns } = global.client;

        var { body, senderID, threadID, messageID } = event;
        senderID = String(senderID);
        threadID = String(threadID);

        const threadSettings = threadData.get(threadID) || {};
        const prefixPattern = new RegExp(`^(<@!?${senderID}>|${escapeRegex((threadSettings.hasOwnProperty("PREFIX")) ? threadSettings.PREFIX : PREFIX)})\\s*`);

        if (!prefixPattern.test(body)) return;

        // Check if user or thread is banned or if inbox messages are disallowed
        if (userBanned.has(senderID) || threadBanned.has(threadID) || (!allowInbox && senderID === threadID)) {
            if (!ADMINBOT.includes(senderID.toString())) {
                if (userBanned.has(senderID)) {
                    const { reason, dateAdded } = userBanned.get(senderID) || {};
                    return api.sendMessage(global.getText("handleCommand", "userBanned", reason, dateAdded), threadID, async (err, info) => {
                        await new Promise(resolve => setTimeout(resolve, 5000));
                        return api.unsendMessage(info.messageID);
                    }, messageID);
                } else if (threadBanned.has(threadID)) {
                    const { reason, dateAdded } = threadBanned.get(threadID) || {};
                    return api.sendMessage(global.getText("handleCommand", "threadBanned", reason, dateAdded), threadID, async (err, info) => {
                        await new Promise(resolve => setTimeout(resolve, 5000));
                        return api.unsendMessage(info.messageID);
                    }, messageID);
                }
            }
        }

        // Parse command
        const [matchedPrefix] = body.match(prefixPattern);
        const args = body.slice(matchedPrefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();
        var command = commands.get(commandName);

        // Suggest similar command if not found
        if (!command) {
            let allCommandNames = [];
            const commandKeys = commands.keys();
            for (const cmd of commandKeys) allCommandNames.push(cmd);
            const bestMatch = stringSimilarity.findBestMatch(commandName, allCommandNames);
            if (bestMatch.bestMatch.rating >= 0.5) {
                command = client.commands.get(bestMatch.bestMatch.target);
            } else {
                return api.sendMessage(global.getText("handleCommand", "commandNotExist", bestMatch.bestMatch.target), threadID);
            }
        }

        // Check if command is banned for user or thread
        if (commandBanned.get(threadID) || commandBanned.get(senderID)) {
            if (!ADMINBOT.includes(senderID)) {
                const bannedThreads = commandBanned.get(threadID) || [];
                const bannedUsers = commandBanned.get(senderID) || [];
                if (bannedThreads.includes(command.config.name)) {
                    return api.sendMessage(global.getText("handleCommand", "commandThreadBanned", command.config.name), threadID, async (err, info) => {
                        await new Promise(resolve => setTimeout(resolve, 5000));
                        return api.unsendMessage(info.messageID);
                    }, messageID);
                }
                if (bannedUsers.includes(command.config.name)) {
                    return api.sendMessage(global.getText("handleCommand", "commandUserBanned", command.config.name), threadID, async (err, info) => {
                        await new Promise(resolve => setTimeout(resolve, 5000));
                        return api.unsendMessage(info.messageID);
                    }, messageID);
                }
            }
        }

        // NSFW check
        if (command.config.commandCategory.toLowerCase() === 'nsfw' &&
            !global.data.threadAllowNSFW.includes(threadID) &&
            !ADMINBOT.includes(senderID)) {
            return api.sendMessage(global.getText("handleCommand", "threadNotAllowNSFW"), threadID, async (err, info) => {
                await new Promise(resolve => setTimeout(resolve, 5000));
                return api.unsendMessage(info.messageID);
            }, messageID);
        }

        // Get group info
        var currentThreadInfo;
        if (event.isGroup === true) {
            try {
                currentThreadInfo = threadInfo.get(threadID) || await Threads.getInfo(threadID);
                if (Object.keys(currentThreadInfo).length === 0) throw new Error();
            } catch (err) {
                logger(global.getText("handleCommand", "cantGetInfoThread", "error"));
            }
        }

        // Permission levels
        let permission = 0;
        const info = threadInfo.get(threadID) || await Threads.getInfo(threadID);
        const isAdmin = info.adminIDs.find(el => el.id === senderID);
        if (ADMINBOT.includes(senderID.toString())) permission = 2;
        else if (isAdmin) permission = 1;

        if (command.config.hasPermssion > permission) {
            return api.sendMessage(global.getText("handleCommand", "permssionNotEnough", command.config.name), threadID, messageID);
        }

        // Cooldown check
        if (!client.cooldowns.has(command.config.name)) {
            client.cooldowns.set(command.config.name, new Map());
        }
        const timestamps = client.cooldowns.get(command.config.name);
        const cooldownDuration = (command.config.cooldowns || 1) * 1000;

        if (timestamps.has(senderID) && currentTimestamp < timestamps.get(senderID) + cooldownDuration) {
            return api.setMessageReaction('😼', messageID, err =>
                err ? logger('Error occurred in setMessageReaction', 2) : '', true);
        }

        // Get language function
        let getText2;
        if (command.languages && typeof command.languages === 'object' && command.languages.hasOwnProperty(global.config.language)) {
            getText2 = (...values) => {
                let langString = command.languages[global.config.language][values[0]] || '';
                for (let i = values.length; i > 0; i--) {
                    const regex = RegExp('%' + i, 'g');
                    langString = langString.replace(regex, values[i]);
                }
                return langString;
            };
        } else getText2 = () => {};

        // Run command
        try {
            const context = {
                api,
                event,
                args,
                models,
                Users,
                Threads,
                Currencies,
                permssion: permission,
                getText: getText2
            };
            command.run(context);
            timestamps.set(senderID, currentTimestamp);

            if (DeveloperMode === true) {
                logger(global.getText("handleCommand", "executeCommand", formattedTime, commandName, senderID, threadID, args.join(" "), (Date.now()) - currentTimestamp), "[ DEV MODE ]");
            }
            return;
        } catch (error) {
            return api.sendMessage(global.getText("handleCommand", "commandError", commandName, error), threadID);
        }
    };
};
