module.exports.config = {
  name: "roast",
  version: "1.0.0",
  hasPermssion: 2,
  credits: "Vrax",
  description: "Playfully roasts the tagged user",
  commandCategory: "fun",
  usages: "@tag",
  cooldowns: 10,
  dependencies: {}
};

module.exports.run = async function({ api, event }) {
  const mention = Object.keys(event.mentions)[0];
  if (!mention) return api.sendMessage("Please tag someone to roast!", event.threadID);

  const name = event.mentions[mention];
  const arraytag = [{ id: mention }];
  const send = msg => api.sendMessage({ body: msg, mentions: arraytag }, event.threadID);

  const roasts = [
    "You're like a cloud. When you disappear, it’s a beautiful day.",
    "You're not stupid; you just have bad luck thinking.",
    "You're proof that even evolution takes a break sometimes.",
    "You're the reason the gene pool needs a lifeguard.",
    "You bring everyone so much joy… when you leave the room.",
    "You're not lazy, you're just on energy-saving mode.",
    "You're like a software update — nobody really wants you, but eventually we accept it.",
    "Your secrets are always safe with me. I never even listen when you tell me them.",
    "You're the human version of a participation trophy.",
    "You have something on your chin... no, the third one down.",
    "You're not ugly — you're just... creatively designed.",
    "You're like a mystery box. Disappointing and full of surprises no one asked for."
  ];

  for (let i = 0; i < roasts.length; i++) {
    setTimeout(() => send(roasts[i]), i * 4000);
  }
};
