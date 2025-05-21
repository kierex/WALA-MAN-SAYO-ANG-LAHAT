module.exports.config = {
  name: "fbcover",
  version: "1.0.9",
  hasPermssion: 0,
  credits: "vern",
  description: "generate a custom facebook cover.",
  commandCategory: "generate-image",
  cooldowns: 0,
  usage: "<blank>",
  dependencies: {
    "fs-extra": "",
    "request": "",
    "axios": ""
  }
};

module.exports.run = async function ({ api, args, event, permission, handleReply }) {
  const request = require('request');
  const fs = require("fs-extra");
  const axios = require("axios");
  const { threadID, messageID, senderID } = event;

  if (this.config.credits !== 'vern') {
    console.log(`[ WARN ] Credits have been changed from 'vern' — this is unauthorized.`);
    return api.sendMessage(`[ WARN ] Unauthorized credit modification detected in "${this.config.name}"`, threadID, messageID);
  }

  if (!args[0]) {
    return api.sendMessage(`You want to continue? Please reply if you want and ignore this if you don't.`, threadID, (err, info) => {
      return global.client.handleReply.push({
        type: "characters",
        name: this.config.name,
        author: senderID,
        tenchinh: args.join(" ").toUpperCase(),
        messageID: info.messageID
      });
    }, messageID);
  }
};

module.exports.handleReply = async function ({ api, event, handleReply }) {
  const axios = require("axios");
  const fs = require("fs-extra");
  const request = require("request");
  const info = await api.getUserInfo(event.senderID);
  const nameSender = info[event.senderID].name;
  const arraytag = [{ id: event.senderID, tag: nameSender }];

  if (handleReply.author !== event.senderID) return;

  const { threadID, messageID, senderID } = event;

  switch (handleReply.type) {
    case "characters":
      api.unsendMessage(handleReply.messageID);
      return api.sendMessage(`Reply to this message enter your primary name`, threadID, (err, info) => {
        global.client.handleReply.push({
          type: 'subname',
          name: 'fbcover',
          author: senderID,
          characters: event.body,
          messageID: info.messageID
        });
      }, messageID);

    case "subname":
      api.unsendMessage(handleReply.messageID);
      return api.sendMessage(`You chose ${event.body} as your main name\n(Reply to this message to enter your secondary name)`, threadID, (err, info) => {
        global.client.handleReply.push({
          type: 'number',
          name: 'fbcover',
          author: senderID,
          characters: handleReply.characters,
          name_s: event.body,
          messageID: info.messageID
        });
      }, messageID);

    case "number":
      api.unsendMessage(handleReply.messageID);
      return api.sendMessage(`You have selected "${event.body}" as your secondary name\n(Reply to this message with your phone number)`, threadID, (err, info) => {
        global.client.handleReply.push({
          type: 'address',
          name: 'fbcover',
          author: senderID,
          characters: handleReply.characters,
          subname: event.body,
          name_s: handleReply.name_s,
          messageID: info.messageID
        });
      }, messageID);

    case "address":
      api.unsendMessage(handleReply.messageID);
      return api.sendMessage(`You have selected "${event.body}" as your phone number\n(Reply to this message with your address)`, threadID, (err, info) => {
        global.client.handleReply.push({
          type: 'email',
          name: 'fbcover',
          author: senderID,
          characters: handleReply.characters,
          subname: handleReply.subname,
          number: event.body,
          name_s: handleReply.name_s,
          messageID: info.messageID
        });
      }, messageID);

    case "email":
      api.unsendMessage(handleReply.messageID);
      return api.sendMessage(`You have selected "${event.body}" as your address.\n(Reply to this message with your email address)`, threadID, (err, info) => {
        global.client.handleReply.push({
          type: 'color',
          name: 'fbcover',
          author: senderID,
          characters: handleReply.characters,
          subname: handleReply.subname,
          number: handleReply.number,
          address: event.body,
          name_s: handleReply.name_s,
          messageID: info.messageID
        });
      }, messageID);

    case "color":
      api.unsendMessage(handleReply.messageID);
      return api.sendMessage(`You have chosen "${event.body}" as your email address.\nEnter your background color (or type "no" to skip)\n(Reply to this message)`, threadID, (err, info) => {
        global.client.handleReply.push({
          type: 'create',
          name: 'fbcover',
          author: senderID,
          characters: handleReply.characters,
          subname: handleReply.subname,
          number: handleReply.number,
          address: handleReply.address,
          email: event.body,
          name_s: handleReply.name_s,
          messageID: info.messageID
        });
      }, messageID);

    case "create":
      const {
        characters, subname, number, address, email, name_s
      } = handleReply;
      const uid = senderID;
      const color = event.body;

      api.unsendMessage(handleReply.messageID);
      api.sendMessage(`Initializing...`, threadID, (err, info) => {
        setTimeout(() => {
          api.unsendMessage(info.messageID);

          const url = encodeURI(`https://api.phamvandien.xyz/fbcover/v1?name=${name_s}&uid=${uid}&address=${address}&email=${email}&subname=${subname}&sdt=${number}&color=${color}&apikey=KeyTest`);
          const outputPath = __dirname + "/cache/fbcover.png";

          request(url).pipe(fs.createWriteStream(outputPath)).on('close', () => {
            api.sendMessage({
              body: `Sender Name: ${nameSender}\nName: ${name_s}\nSub Name: ${subname}\nID: ${uid}\nColor: ${color}\nAddress: ${address}\nEmail: ${email}\nNumber: ${number}`,
              mentions: arraytag,
              attachment: fs.createReadStream(outputPath)
            }, threadID, () => fs.unlinkSync(outputPath), messageID);
          });
        }, 1000);
      });
      break;
  }
};
