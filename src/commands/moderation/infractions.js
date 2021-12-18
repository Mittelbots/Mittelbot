const config = require('../../../config.json');
const { hasPermission } = require('../../../utils/functions/hasPermissions');
const { publicInfractionResponse } = require('../../../utils/publicResponses/publicModResponses');
const {
    database
} = require('../../db/db');

module.exports.run = async (bot, message, args) => {
    if (config.deleteModCommandsAfterUsage == 'true') {
        message.delete();
    }

    if (!hasPermission(message, 0, 0)) {
        message.delete();
        return message.channel.send(`<@${message.author.id}> ${config.errormessages.nopermission}`).then(msg => {
            setTimeout(() => msg.delete(), 5000);
        });
    }

    var Member;
    if(args[0] == undefined) {
        Member = message.author;
    }else {
        try {
            Member = message.mentions.members.first() || await message.guild.members.fetch(args[0]);
        }catch(err) {
            return message.reply(`User not found`).then(msg => setTimeout(() => msg.delete(), 5000));
        }
    }

    var closed = []
    var open = []
    try {
        await database.query(`SELECT * FROM closed_infractions WHERE user_id = ?`, [Member.id], async (err, res) => {
            if (err) {
                console.log(err);
                return message.reply(`${config.errormessages.databasequeryerror}`);
            }
            closed.push(await res);
        });
        await database.query(`SELECT * FROM open_infractions WHERE user_id = ?`, [Member.id], async (err, res) => {
            if (err) {
                console.log(err);
                return message.reply(`${config.errormessages.databasequeryerror}`);
            }
            open.push(await res);
        });
    }catch(e){}

    message.reply(`This request can take a few Seconds!`).then((msg) => setTimeout(() => msg.delete(), 5000))

    setTimeout(() => {
        if(closed[0].length <= 0 && open[0].length <= 0) {
            return message.reply(`This User dont have any infractions!`);
        }
        if(config.debug == 'true') console.info('Infraction Command passed!')
        return publicInfractionResponse(message, Member, closed[0], open[0]);
    }, 5000);
}

module.exports.help = {
    name:"infractions",
    aliases: ["inf"]
}