module.exports.config = {
    name: "out",
    version: "1.0.0",
    hasPermssion: 2, // Only bot admins can use this command
    credits: "Vrax",
    description: "Makes the bot leave the group or removes it from another group by ID",
    commandCategory: "Admin",
    usages: "out [groupID]",
    cooldowns: 10,
};

module.exports.run = async function({ api, event, args }) {
    // If no arguments are provided, remove the bot from the current group
    if (!args[0]) {
        return api.removeUserFromGroup(api.getCurrentUserID(), event.threadID);
    }

    // If a valid group ID is provided, remove the bot from that group instead
    if (!isNaN(args[0])) {
        return api.removeUserFromGroup(api.getCurrentUserID(), args[0]);
    }
};
