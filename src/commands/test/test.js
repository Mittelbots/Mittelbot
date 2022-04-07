const config = require('../../../src/assets/json/_config/config.json');

const BetterMarkdown = require('discord-bettermarkdown');
const markdown = new BetterMarkdown();

module.exports.run = async (bot, message, args) => {
    if(message.author.id !== config.Bot_Owner_ID) return;


    markdown.format('Hello World', 'BOLD', 'RED', 'WHITE', true);

    message.channel.send(markdown.toCodeblock());
}

module.exports.help = {
    name: "test"
}