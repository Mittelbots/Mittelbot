const { ActionRowBuilder, ButtonBuilder, EmbedBuilder, ButtonStyle } = require("discord.js");
const { generateModEmote } = require("../functions/generateModEmote");

async function publicModResponses(type, moderator, member, reason, time, bot) {
    var publicModMessage = new EmbedBuilder()
    .setColor('#0099ff')
    .setTitle(`${await generateModEmote({bot, type}) }**Member ${type}!**`)
    .addFields([
        {name: `Moderator`, value: `${moderator} (${moderator.id})`},
        {name: `Member`, value: `<@${member}> (${member})`},
        {name: `Reason`, value: `${reason || "No Reason Provided!"}`}
    ])
    .setTimestamp();

    if(time) {
        publicModMessage.addFields([{name: `Time`, value: `**${time}** `}])
    }

    return {
        error: false,
        message: publicModMessage
    }
}

async function publicInfractionResponse({member, closed, open, main_interaction, isOne}) {
    if(isOne) {
        let infraction = member;

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
        //let user = await guild.members.fetch(infraction.user_id);
        var publicOneInfractionMessage = new EmbedBuilder()
        //.setAuthor(`${user.user.username}${user.user.discriminator}`)
        .addFields([{name: `${infraction.infraction_id} - ${type} **${infraction.till_date}**`, value: `Reason: **${infraction.reason}** \n From: <@${infraction.mod_id}>`}]);
        
        return {
            error: false,
            message: publicOneInfractionMessage
        }

    }else {
        const backId = 'back'
        const forwardId = 'forward'
        const backButton = new ButtonBuilder({
        style: ButtonStyle.Secondary,
        label: 'Back',
        emoji: '⬅️',
        customId: backId
        });
        const forwardButton = new ButtonBuilder({
        style: ButtonStyle.Secondary,
        label: 'Forward',
        emoji: '➡️',
        customId: forwardId
        });

        const data = [...open,...closed]

        const generateEmbed = async start => {
            const current = data.slice(start, start + 10);

            return new EmbedBuilder({
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
        
        const embedMessage = await main_interaction.channel.send({
            embeds: [await generateEmbed(0)],
            components: canFitOnOnePage ? [] : [new ActionRowBuilder({components: [forwardButton]})]
        }).catch(err => {});

        if(canFitOnOnePage) return;

        const collector = embedMessage.createMessageComponentCollector({
            filter: ({user}) => user.id === main_interaction.user.id
        });

        let currentIndex = 0;
        collector.on('collect', async interaction => {
            interaction.customId === backId ? (currentIndex -= 10) : (currentIndex += 10)

            await interaction.update({
                embeds: [await generateEmbed(currentIndex)],
                components: [
                    new ActionRowBuilder({
                        components: [
                            ...(currentIndex ? [backButton] : []),
                            ...(currentIndex + 10 < data.length ? [forwardButton] : [])
                        ]
                    })
                ]
            }).catch(err => {})
        });
    }
    return;
}

module.exports = {publicModResponses, publicInfractionResponse}