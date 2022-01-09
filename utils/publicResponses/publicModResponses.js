const { MessageEmbed } = require("discord.js");

async function publicModResponses(channelmessage, type, moderator, member, reason, time) {
    var publicModMessage = new MessageEmbed()
    .setColor('#0099ff')
    .setTitle(`**Member ${type}!**`)
    .addField(`Moderator`, `<@${moderator}> (${moderator})`)
    .addField(`Member`, `<@${member}> (${member})`)
    .addField(`Reason`, `${reason || "No Reason Provided!"}`)
    .setTimestamp();

    if(time) {
        publicModMessage.addField(`Time`, `**${time}** `)
    }

    channelmessage.channel.send({embeds: [publicModMessage]});
    return;
}

async function publicInfractionResponse(message, Member, closed, open, isOne) {
    if(isOne) {
        let infraction = Member;

        var type;
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
        }
        let user = await message.guild.members.fetch(infraction.user_id);
        var publicOneInfractionMessage = new MessageEmbed()
        .setAuthor(`${user.user.username}${user.user.discriminator}`)
        .addField(`${infraction.infraction_id} - ${type}`, `Reason: **${infraction.reason}** \n From: <@${infraction.mod_id}>`);
        return message.reply({embeds:[publicOneInfractionMessage]});
    }
    console.log(Member)
    var publicInfractionMessage = new MessageEmbed()
    .setAuthor(`${Member.user.username}#${Member.user.discriminator}`, Member.avatarURL(true))
    .addField(`Closed Infractions`, '‎', false);
    for(let i in closed) {
        var type;
        switch(true) {
            case closed[i].mute == 1: 
                type = 'Mute'; 
                break;

            case closed[i].ban == 1: 
                type = 'Ban'; 
                break;

            case closed[i].warn == 1: 
                type = 'Warn'; 
                break;

            case closed[i].kick == 1: 
                type = 'Kick'; 
                break;
        }
        publicInfractionMessage.addField(`${closed[i].infraction_id} - ${type}`, `Reason: ${closed[i].reason}`)
    }
    if(open.length > 0) {
        publicInfractionMessage.addField(`\n Open Infractions`, '‎', false)
        for(let i in open) {
            publicInfractionMessage.addField(`${open[i].infraction_id} - ${type}`, `Reason: ${open[i].reason} \n Till: ${open[i].till_date || 'Permanent'}`)
        }
    }

    publicInfractionMessage.setTimestamp();
    return message.reply({embeds: [publicInfractionMessage]});
}

module.exports = {publicModResponses, publicInfractionResponse}