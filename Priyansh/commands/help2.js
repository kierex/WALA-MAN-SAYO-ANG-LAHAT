module.exports.config = {
    name: "help2",
    version: "1.0.2",
    hasPermssion: 0,
    credits: "Vrax",
    description: "Beginner's guide to commands",
    commandCategory: "System",
    usages: "[Module name]",
    cooldowns: 1,
    envConfig: {
        autoUnsend: true,
        delayUnsend: 300 // time in seconds before message is unsent
    }
};

module.exports.languages = {
    "en": {
        "moduleInfo": "「 %1 」\n%2\n\n❯ Usage: %3\n❯ Category: %4\n❯ Cooldown: %5 second(s)\n❯ Permission: %6\n\n» Module coded by %7 «",
        "helpList": '[ There are %1 commands available. Use: "%2help [command name]" for details! ]',
        "user": "User",
        "adminGroup": "Group Admin",
        "adminBot": "Bot Admin"
    }
};

module.exports.handleEvent = function ({ api, event, getText }) {
    const { commands } = global.client;
    const { threadID, messageID, body } = event;

    if (!body || typeof body === "undefined" || !body.toLowerCase().startsWith("help")) return;

    const splitBody = body.trim().split(/\s+/);
    if (splitBody.length === 1 || !commands.has(splitBody[1].toLowerCase())) return;

    const threadSetting = global.data.threadData.get(parseInt(threadID)) || {};
    const command = commands.get(splitBody[1].toLowerCase());
    const prefix = threadSetting.hasOwnProperty("PREFIX") ? threadSetting.PREFIX : global.config.PREFIX;

    return api.sendMessage(
        getText(
            "moduleInfo",
            command.config.name,
            command.config.description,
            `${prefix}${command.config.name} ${(command.config.usages || "")}`,
            command.config.commandCategory,
            command.config.cooldowns,
            command.config.hasPermssion === 0
                ? getText("user")
                : command.config.hasPermssion === 1
                ? getText("adminGroup")
                : getText("adminBot"),
            command.config.credits
        ),
        threadID,
        messageID
    );
};

module.exports.run = function ({ api, event, args, getText }) {
    const { commands } = global.client;
    const { threadID, messageID } = event;
    const command = commands.get((args[0] || "").toLowerCase());
    const threadSetting = global.data.threadData.get(parseInt(threadID)) || {};
    const { autoUnsend, delayUnsend } = global.configModule[this.config.name];
    const prefix = threadSetting.hasOwnProperty("PREFIX") ? threadSetting.PREFIX : global.config.PREFIX;

    if (!command) {
        const allCommands = [];
        const page = parseInt(args[0]) || 1;
        const itemsPerPage = 9999;
        let msg = "";
        let i = 0;

        for (const [name] of commands) {
            allCommands.push(name);
        }

        allCommands.sort(); // Alphabetical sorting

        const start = itemsPerPage * (page - 1);
        const paginatedCommands = allCommands.slice(start, start + itemsPerPage);
        i = start;

        for (const cmd of paginatedCommands) {
            msg += `「 ${++i} 」${prefix}${cmd}\n`;
        }

        const header = `Command List 📄\nCreated by Vraxyxx 🥀\nType "${prefix}help [command name]" for more info ✨`;
        const footer = `\nPage (${page}/${Math.ceil(allCommands.length / itemsPerPage)})`;

        return api.sendMessage(header + "\n\n" + msg + footer, threadID, async (error, info) => {
            if (autoUnsend) {
                await new Promise(resolve => setTimeout(resolve, delayUnsend * 1000));
                return api.unsendMessage(info.messageID);
            }
        }, messageID);
    }

    // Send command details if one was provided
    return api.sendMessage(
        getText(
            "moduleInfo",
            command.config.name,
            command.config.description,
            `${prefix}${command.config.name} ${(command.config.usages || "")}`,
            command.config.commandCategory,
            command.config.cooldowns,
            command.config.hasPermssion === 0
                ? getText("user")
                : command.config.hasPermssion === 1
                ? getText("adminGroup")
                : getText("adminBot"),
            command.config.credits
        ),
        threadID,
        messageID
    );
};
