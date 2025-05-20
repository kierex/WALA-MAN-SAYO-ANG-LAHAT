module.exports.config = {
    name: "war",
    version: "1.0.0",
    hasPermssion: 2,
    credits: "Vrax (edited by Vern)",
    description: "Group war message - Pinoy version for Vern Pogi",
    commandCategory: "group",
    usages: "war @mention",
    cooldowns: 10,
    dependencies: {
        "fs-extra": "",
        "axios": ""
    }
}

module.exports.run = async function({ api, args, Users, event }) {
    var mention = Object.keys(event.mentions)[0];
    let name = event.mentions[mention];
    var arraytag = [];
    arraytag.push({ id: mention });

    var send = (msg) => api.sendMessage(msg, event.threadID);

    send(`🔔 Makinig kay Vern Pogi, mga tropa!`);
    setTimeout(() => { send({ body: "🔥 Hoy " + name + ", si Vern ang pinaka-astig dito!" }) }, 3000);
    setTimeout(() => { send({ body: "😎 Walang makakatalo sa kagwapuhan ni Vern Pogi." }) }, 5000);
    setTimeout(() => { send({ body: "💪 Kasing lakas ni Vern ang tatlong dragon!" }) }, 7000);
    setTimeout(() => { send({ body: "🎤 Kahit sa rap battle, titirisin kayo ni Vern!" }) }, 9000);
    setTimeout(() => { send({ body: "🎮 Sa ML? MVP palagi si boss Vern!" }) }, 12000);
    setTimeout(() => { send({ body: "🚀 Kahit aliens, sumusuko kay Vern!" }) }, 15000);
    setTimeout(() => { send({ body: "💥 Legend na, gwapo pa. Gano’n si Vern." }) }, 17000);
    setTimeout(() => { send({ body: "🔥 Simulan na natin ang paghanga kay Vern!" }) }, 20000);
    setTimeout(() => { send({ body: "😂 Kung si Vern meme, viral agad!" }) }, 23000);
    setTimeout(() => { send({ body: "🎉 Palakpakan para kay Vern Pogi mga kaibigan!" }) }, 25000);
    setTimeout(() => { send({ body: "🙌 Maraming salamat sa suporta ninyo kay Vern!" }) }, 28500);
    setTimeout(() => { send({ body: "🕶️ Si Vern lang ang kayang tumalo sa sarili niya." }) }, 31000);
    setTimeout(() => { send({ body: "⏳ Pahinga muna, sobrang idol kasi si Vern." }) }, 36000);
    setTimeout(() => { send({ body: "📢 Ready na ulit? Ituloy natin ang hype!" }) }, 40000);
    setTimeout(() => { send({ body: "🔥 Mula ulo hanggang paa – Vern yan!" }) }, 65000);
    setTimeout(() => { send({ body: "🎤 Kung may concert, front row dapat si Vern!" }) }, 70000);
    setTimeout(() => { send({ body: "🌟 Si Vern ang tunay na bituin ng GC na ‘to." }) }, 75000);
    setTimeout(() => { send({ body: "🏆 Kahit award, kusang lumalapit kay Vern." }) }, 80000);
    setTimeout(() => { send("😮 Grabe, hindi ko na kaya ang pogi powers ni Vern!") }, 85000);
    setTimeout(() => { send({ body: "📝 Boss update ka na, dagdagan pa natin!" }) }, 90000);
    setTimeout(() => { send({ body: "🎬 Salamat sa pakikinig, hanggang sa susunod na Vern Special!" }) }, 95000);
    setTimeout(() => { send({ body: "👋 Paalam muna mga tropa, idol pa rin si Vern!" }) }, 100000);
};
