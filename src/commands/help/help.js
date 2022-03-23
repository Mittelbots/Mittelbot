const cmd_help = require('../../../src/assets/json/command_config/command_help.json');
const {
    MessageEmbed
} = require('discord.js');

module.exports.run = async (bot, message, args) => {
    const helpEmbedMessage = new MessageEmbed()
        .setTitle('Everything you need to know from each Command \n Choose a category')
        .setDescription('Something wrong? Report it on my discord https://discord.gg/5d5ZDFQM4E \n _I\'ll use the default prefix \'!\'_ ')

    for (const [index, [key, value]] of Object.entries(Object.entries(cmd_help))) {
        helpEmbedMessage.addField(`${value._icon} ${key.charAt(0).toUpperCase() + key.slice(1)}`, value._desc);
    }

    

    await message.channel.send({
        embeds: [helpEmbedMessage]
    }).then(async msg => {

        var filterEmoji = [];

        function addCloseReaction() {
            msg.react('❌');
            if(filterEmoji.indexOf('❌') === -1) filterEmoji.push('❌');
        }

        function addHomeReactions() {
            for (let i in cmd_help) {
                msg.react(cmd_help[i]._icon);
                if(filterEmoji.indexOf(cmd_help[i]._icon) === -1) filterEmoji.push(cmd_help[i]._icon)
            }
        }
        addCloseReaction();
        addHomeReactions();

        const filter = (reaction, user) => filterEmoji.indexOf(reaction.emoji.name) !== -1 && user.id === message.author.id;
    
        const collector = msg.createReactionCollector({
            filter,
            time: 60000
        });
        
        collector.on('collect', async (reaction, user) => {
            await reaction.users.remove(user);
            
            if(reaction.emoji.name === '❌') {
                message.delete();
                return await msg.delete();
            }

            if(reaction.emoji.name === '🔼') {
                msg.edit({
                    embeds: [helpEmbedMessage]
                });
                msg.reactions.removeAll().catch(err => {});
                addCloseReaction();
                addHomeReactions();
            }

            for (const [index, [key, value]] of Object.entries(Object.entries(cmd_help))) {
                if(value._icon === reaction.emoji.name) {

                    const edithelpEmbedMessage = new MessageEmbed()
                        .setTitle(`Settings for ${key.charAt(0).toUpperCase() + key.slice(1)}`)
                        .setDescription('Something wrong? Report it on my discord https://discord.gg/5d5ZDFQM4E \n _I\'ll use the default prefix \'!\'_ ')

                    for(let i in value) {
                        if(typeof value[i] === 'object') {
                            edithelpEmbedMessage.addField(`${value[i].icon || ''} ${value[i].name.charAt(0).toUpperCase() + value[i].name.slice(1)}`, `${value[i].description || 'Not set yet'} \n${'**!'+value[i].usage+'**' || 'Not set'}`)
                        }
                    }

                    msg.edit({
                        embeds: [edithelpEmbedMessage]
                    });

                    msg.reactions.removeAll().catch(err => {});

                    addCloseReaction();
                    msg.react('🔼');
                    if(filterEmoji.indexOf('🔼') === -1) filterEmoji.push('🔼');
                    return;
                }
            }
        });

        collector.on('end', (collected, reason) => {
            try {
                if(reason === 'time') {
                    msg.edit({content: '**Time limit reached**'});
                    msg.reactions.removeAll().catch(err => {});
                }else {
                    msg.edit({content: `**Collector ended cause: ${reason}**`});
                    msg.reactions.removeAll().catch(err => {});
                }
            }catch(err) {}
        });
    })


}

module.exports.help = cmd_help.utility.help;