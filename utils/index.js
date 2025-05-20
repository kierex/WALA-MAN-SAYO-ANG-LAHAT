const assets = require('@miraipr0ject/assets');
const crypto = require('crypto');
const os = require("os");

// Sends an error message for a specific command
module.exports.throwError = function (command, threadID, messageID) {
    const threadSetting = global.data.threadData.get(parseInt(threadID)) || {};
    const prefix = threadSetting.PREFIX || global.config.PREFIX;
    return global.client.api.sendMessage(
        global.getText("utils", "throwError", prefix, command),
        threadID,
        messageID
    );
}

// Cleans HTML tags and entities from Anilist API responses
module.exports.cleanAnilistHTML = function (text) {
    return text
        .replace('<br>', '\n')
        .replace(/<\/?(i|em)>/g, '*')
        .replace(/<\/?b>/g, '**')
        .replace(/~!|!~/g, '||')
        .replace("&amp;", "&")
        .replace("&lt;", "<")
        .replace("&gt;", ">")
        .replace("&quot;", '"')
        .replace("&#039;", "'");
}

// Downloads a file from a URL and saves it to a specified path
module.exports.downloadFile = async function (url, path) {
    const { createWriteStream } = require('fs');
    const axios = require('axios');

    const response = await axios({
        method: 'GET',
        responseType: 'stream',
        url
    });

    const writer = createWriteStream(path);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
    });
}

// Fetches content (usually JSON/text) from a URL
module.exports.getContent = async function (url) {
    try {
        const axios = require("axios");
        const response = await axios.get(url);
        return response;
    } catch (error) {
        console.log(error);
    }
}

// Generates a random string of specified length (letters only)
module.exports.randomString = function (length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

// Access fonts, images, and data from the assets library
module.exports.assets = {
    async font(name) {
        if (!assets.font.loaded) await assets.font.load();
        return assets.font.get(name);
    },
    async image(name) {
        if (!assets.image.loaded) await assets.image.load();
        return assets.image.get(name);
    },
    async data(name) {
        if (!assets.data.loaded) await assets.data.load();
        return assets.data.get(name);
    }
}

// AES encryption/decryption helper
module.exports.AES = {
    encrypt(cryptKey, cryptIv, plainData) {
        const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(cryptKey), Buffer.from(cryptIv));
        let encrypted = cipher.update(plainData);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return encrypted.toString('hex');
    },
    decrypt(cryptKey, cryptIv, encrypted) {
        const encryptedBuffer = Buffer.from(encrypted, "hex");
        const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(cryptKey), Buffer.from(cryptIv));
        let decrypted = decipher.update(encryptedBuffer);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return String(decrypted);
    },
    makeIv() {
        return crypto.randomBytes(16).toString('hex').slice(0, 16);
    }
}

// Returns user's home directory and operating system type
module.exports.homeDir = function () {
    let homeDir;
    let systemType;
    const home = process.env.HOME;
    const user = process.env.LOGNAME || process.env.USER || process.env.LNAME || process.env.USERNAME;

    switch (process.platform) {
        case "win32":
            homeDir = process.env.USERPROFILE || (process.env.HOMEDRIVE + process.env.HOMEPATH) || home || null;
            systemType = "win32";
            break;
        case "darwin":
            homeDir = home || (user ? `/Users/${user}` : null);
            systemType = "darwin";
            break;
        case "linux":
            homeDir = home || (process.getuid() === 0 ? '/root' : (user ? `/home/${user}` : null));
            systemType = "linux";
            break;
        default:
            homeDir = home || null;
            systemType = "unknown";
            break;
    }

    return [typeof os.homedir === 'function' ? os.homedir() : homeDir, systemType];
}
