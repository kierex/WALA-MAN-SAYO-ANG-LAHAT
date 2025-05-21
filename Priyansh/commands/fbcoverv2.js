module.exports.config = {
  name: "fbcoverv2",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Vern",
  description: "banner",
  commandCategory: "Image",
  usages: "",
  cooldowns: 5
};

module.exports.run = async function({ api, args, event }) {
  const { threadID, messageID, senderID } = event;
  const request = require("request");
  const axios = require("axios");
  const fs = require("fs-extra");

  if (args[0] == "list") {
    const res = await axios.get("https://api.nguyenmanh.name.vn/taoanhdep/list");

    let page = parseInt(args[1]) || 1;
    const limit = 11;
    const total = res.data.listAnime.length;
    const totalPages = Math.ceil(total / limit);
    let msg = "";

    for (let i = limit * (page - 1); i < limit * page; i++) {
      if (i >= total) break;
      msg += `${i}. ${res.data.listAnime[i].name}\n`;
    }

    msg += `\n» Total: ${total} characters\n» Page: ${page}/${totalPages}\n» Use ${global.config.PREFIX}fbcover list <page> to see more.`;
    return api.sendMessage(`●─● Character List ●──●\n${msg}\n●──● End ●──●`, threadID, messageID);

  } else if (args[0] == "find") {
    const char = args[1];
    const res = await axios.get(`https://api.nguyenmanh.name.vn/taoanhdep/search?key=${encodeURIComponent(char)}`);
    const id = res.data.ID;
    return api.sendMessage(`ID for "${char}" is: ${id - 1}`, threadID, messageID);

  } else if (args[0] == "color") {
    const imgUrl = "https://4.bp.blogspot.com/-_nVsmtO-a8o/VYfZIUJXydI/AAAAAAAACBQ/FHfioHYszpk/w1200-h630-p-k-no-nu/cac-mau-trong-tieng-anh.jpg";
    const filePath = `${__dirname}/cache/mautienganh.jpg`;
    const callback = () => api.sendMessage({
      body: "[ English color list ]",
      attachment: fs.createReadStream(filePath)
    }, threadID, () => fs.unlinkSync(filePath));

    request(encodeURI(imgUrl)).pipe(fs.createWriteStream(filePath)).on("close", callback);

  } else {
    return api.sendMessage(`» Reply to this message with the character ID you want to choose`, threadID, (err, info) => {
      return global.client.handleReply.push({
        type: "characters",
        name: this.config.name,
        author: senderID,
        messageID: info.messageID
      });
    }, messageID);
  }
};

module.exports.handleReply = async function({ api, event, handleReply }) {
  const axios = require("axios");
  const fs = require("fs-extra");

  const { threadID, messageID, senderID } = event;
  if (handleReply.author != senderID) return api.sendMessage('You do not have permission to reply to this message', threadID);

  switch (handleReply.type) {
    case "characters": {
      const id = parseInt(event.body);
      const res = await axios.get(`https://api.nguyenmanh.name.vn/taoanhdep/search/id?id=${id + 1}`);
      const name = res.data.name;

      api.unsendMessage(handleReply.messageID);
      return api.sendMessage(`» You selected: ${name}\n» Reply with your main name`, threadID, (err, info) => {
        return global.client.handleReply.push({
          type: 'subname',
          name: this.config.name,
          author: senderID,
          characters: event.body,
          messageID: info.messageID
        });
      }, messageID);
    }

    case "subname": {
      api.unsendMessage(handleReply.messageID);
      return api.sendMessage(`» Reply with your secondary name`, threadID, (err, info) => {
        return global.client.handleReply.push({
          type: 'color',
          name: this.config.name,
          author: senderID,
          characters: handleReply.characters,
          name_s: event.body,
          messageID: info.messageID
        });
      }, messageID);
    }

    case "color": {
      api.unsendMessage(handleReply.messageID);
      return api.sendMessage(`» Reply with your background color (use "${global.config.PREFIX}fbcover color" for reference)`, threadID, (err, info) => {
        return global.client.handleReply.push({
          type: 'create',
          name: this.config.name,
          author: senderID,
          characters: handleReply.characters,
          subname: event.body,
          name_s: handleReply.name_s,
          messageID: info.messageID
        });
      }, messageID);
    }

    case "create": {
      const { characters, name_s, subname } = handleReply;
      const color = event.body;

      api.unsendMessage(handleReply.messageID);
      return api.sendMessage(`Creating your cover photo...`, threadID, async () => {
        await new Promise(res => setTimeout(res, 3000));

        const imageStream = (await axios.get(`https://api.nguyenmanh.name.vn/fbcover/v2?name=${encodeURIComponent(name_s)}&id=${characters}&subname=${encodeURIComponent(subname)}&color=${encodeURIComponent(color)}&apikey=KeyTest`, {
          responseType: "stream"
        })).data;

        return api.sendMessage({
          body: `Here is your Facebook cover`,
          attachment: imageStream
        }, threadID, messageID);
      });
    }
  }
};
