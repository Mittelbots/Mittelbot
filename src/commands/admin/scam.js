const config = require('../../../config.json');
const commandconfig = require('../../../command_config.json');
const advancedScamList = require('../../../advancedScamList.json')

const {
    MessageEmbed,
    Permissions,
    MessageActionRow,
    MessageButton
} = require('discord.js');
const { removeHttp } = require('../../../utils/functions/removeCharacters');

const dns = require('dns');
const url = require('url');

const fs = require('fs')

module.exports.run = async (bot, message, args) => {

    if (config.deleteModCommandsAfterUsage == 'true') {
        message.delete();
    }
    if (!message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
        message.delete();
        return message.channel.send(`<@${message.author.id}> ${config.errormessages.nopermission}`).then(msg => {
            setTimeout(() => msg.delete(), 5000);
        });
    }

    const setting = args[0];

    if(setting === commandconfig.scam.add.command) {

        for(let i in advancedScamList.requestblacklist) {
            if(advancedScamList.requestblacklist[i] === message.guild.id) return message.reply('Your server is on request blacklist! You can\'t sent any requests until the bot moderators removes your server from it.');
        }

        var value = args[1];

        if(value == undefined) return message.reply('Please add an valid URL');

        if(value.search('http://') !== -1 && value.search('https://') !== -1) {
            value = `http://${value}/`;
        }
        console.log(value)
        const parsedLookupUrl = url.parse(value);

        dns.lookup(parsedLookupUrl.protocol ? parsedLookupUrl.host : parsedLookupUrl.path, async (err, address, family) => {
            if(!err) {
                //? URL IS VALID
                
                value = removeHttp(value);

                const accept = 'accept';
                const deny = 'deny';

                const blacklist = 'blacklist';
                const blacklistLabel = 'Blacklist Server';

                for(let i in advancedScamList.link) {
                    if(advancedScamList.link[i] === value) return message.reply('This URL already exits');
                }

                const newScamLinkembed = new MessageEmbed()
                    .setTitle('New Advanced ScamList request')
                    .addField('**LINK:**', `\n${value}`)
                    .addField('**VIEW SCAN**', `https://www.urlvoid.com/scan/${value}/`)
                    .addField('**SERVER:**', `\n${message.guild.id} (${message.guild.name})`)
                    .setTimestamp()

                const buttons = new MessageActionRow()
                    .addComponents(
                        new MessageButton()
                            .setCustomId(accept)
                            .setLabel(accept)
                            .setStyle('PRIMARY')                        
                    )
                    .addComponents(
                        new MessageButton()
                            .setCustomId(deny)
                            .setLabel(deny)
                            .setStyle('PRIMARY')                        
                    )
                    .addComponents(
                        new MessageButton()
                            .setCustomId(blacklist)
                            .setLabel(blacklistLabel)
                            .setStyle('DANGER')                        
                    )

                const sentMessage = await bot.guilds.cache.get(config.DEVELOPER_DISCORD_GUILD_ID).channels.cache.get('937032777583427586').send({embeds: [newScamLinkembed], components: [buttons]})

                const collector = sentMessage.createMessageComponentCollector({
                    max: 1
                });

                collector.on('collect', async interaction => {
                    interaction.deferUpdate();
                    if(interaction.customId === accept) {
                        advancedScamList.link.push(value)
                        if(advancedScamList.length <= 0) return message.reply('Something went wrong. Data is empty!');
                        fs.writeFile('./advancedScamList.json', JSON.stringify(advancedScamList), (err) => console.log(err))
                        
                        return await message.author.send(`Your ScamList request was accepted! \n Link: \`${value}\` `).catch(err => {})
                    }else if(interaction.customId === deny) {
                        return await message.author.send(`Your ScamList request was denied! \n Link: \`${value}\` `).catch(err => {})
                    }else {
                        advancedScamList.requestblacklist.push(message.guild.id);
                        if(advancedScamList.length <= 0) return message.reply('Something went wrong. Data is empty!');
                        fs.writeFile('./advancedScamList.json', JSON.stringify(advancedScamList), (err) => console.log(err))

                        return await message.author.send(`Your Server got added to the blacklist!`).catch(err => {})
                    }
                });

                collector.on('end', (collected, reason) => {
                    collected.forEach(x => {
                        for(let i in buttons.components) {
                            if(buttons.components[i].customId === x.customId) {
                                buttons.components[i].setStyle('SUCCESS');
                            }
                            buttons.components[i].setDisabled(true)
                        }
                        sentMessage.edit({embeds: [newScamLinkembed], components: [buttons]})
                    });
                    
                    return;
                });
                
            } else {
                //! URL IS INVALID
                return message.reply('Invalid URL!');
            }
        });

    }
}


module.exports.help = {
    name: "scam"
}