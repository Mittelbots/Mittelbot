const config = require('../../../src/assets/json/_config/config.json');
const {TextInputBuilder} = require('discord.js')
const BetterMarkdown = require('discord-bettermarkdown');

module.exports.run = async (bot, message, args) => {
 
    if(message.author.id !== config.Bot_Owner_ID) return;

    const textInput = new TextInputBuilder()
        .setLabel('Text')
        .setCustomId('text')

    
}

module.exports.help = {
    name: "test"
}