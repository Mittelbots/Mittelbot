const { MessageActionRow, MessageButton, MessageEmbed } = require("discord.js");
const { generateModEmote } = require("../functions/generateModEmote");
const config = require('../../src/assets/json/_config/config.json');

async function publicModResponses(channelmessage, type, moderator, member, reason, time, bot) {
    var publicModMessage = new MessageEmbed()
    .setColor('#0099ff')
    .setTitle(`${await generateModEmote(config, bot, type) }**Member ${type}!**`)
    .addField(`Moderator`, `<@${moderator}> (${moderator})`)
    .addField(`Member`, `<@${member}> (${member})`)
    .addField(`Reason`, `${reason || "No Reason Provided!"}`)
    .setTimestamp();

    if(time) {
        publicModMessage.addField(`Time`, `**${time}** `)
    }

    return channelmessage.channel.send({embeds: [publicModMessage]});
}

async function publicInfractionResponse(message, Member, closed, open, isOne) {
    if(isOne) {
        let infraction = Member;

        let type;
        switch(true) {
            case infraction.mute == 1: 
                type = 'Mute'; 
                break;

            case infraction.ban == 1: 
                type = 'Ban'; 
                break;

            case infraction.warn == 1: 
                type = 'Warn'; 
                break;

            case infraction.kick == 1: 
                type = 'Kick'; 
                break;

            default: 
                break;
        }
        let user = await message.guild.members.fetch(infraction.user_id);
        var publicOneInfractionMessage = new MessageEmbed()
        .setAuthor(`${user.user.username}${user.user.discriminator}`)
        .addField(`${infraction.infraction_id} - ${type} **${infraction.till_date}**`, `Reason: **${infraction.reason}** \n From: <@${infraction.mod_id}>`);
        return message.reply({embeds:[publicOneInfractionMessage]});
    }else {
        const backId = 'back'
        const forwardId = 'forward'
        const backButton = new MessageButton({
        style: 'SECONDARY',
        label: 'Back',
        emoji: '⬅️',
        customId: backId
        });
        const forwardButton = new MessageButton({
        style: 'SECONDARY',
        label: 'Forward',
        emoji: '➡️',
        customId: forwardId
        });

        const data = [...open,...closed]

        const generateEmbed = async start => {
            const current = data.slice(start, start + 10);

            return new MessageEmbed({
                title: `Showing infractions ${start + 1}-${start + current.length} out of ${data.length}`,
                fields: await Promise.all(
                    current.map(async inf => ({
                        name: `${inf.infraction_id} - ${inf.mute == 1 ? `${'Mute'}`: inf.kick == 1 ? `${'Kick'}` : inf.warn == 1 ? `${'Warn'}` : `${'Ban'}`}`,
                        value: `Reason: ${inf.reason} \n ${inf.till_date ? `${`Till: ${inf.till_date}`}` : inf.mute == 1 ? `${'Till: Permanent'}` : inf.ban == 1 ? `${'Till: Permanent'}` : `${''}`}`
                    }))
                )
            })
        }

        const canFitOnOnePage = data.length <= 10;
        const embedMessage = await message.channel.send({
            embeds: [await generateEmbed(0)],
            components: canFitOnOnePage ? [] : [new MessageActionRow({components: [forwardButton]})]
        });

        if(canFitOnOnePage) return;

        const collector = embedMessage.createMessageComponentCollector({
            filter: ({user}) => user.id === message.author.id
        });

        let currentIndex = 0;
        collector.on('collect', async interaction => {
            interaction.customId === backId ? (currentIndex -= 10) : (currentIndex += 10)

            await interaction.update({
                embeds: [await generateEmbed(currentIndex)],
                components: [
                    new MessageActionRow({
                        components: [
                            ...(currentIndex ? [backButton] : []),
                            ...(currentIndex + 10 < data.length ? [forwardButton] : [])
                        ]
                    })
                ]
            });
        });
    }
    return;
}

module.exports = {publicModResponses, publicInfractionResponse}