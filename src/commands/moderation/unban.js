const config = require('../../../config.json');
const { hasPermission } = require('../../../utils/functions/hasPermissions');
const { insertDataToClosedInfraction } = require('../../../utils/functions/insertDataToDatabase');
const { setNewModLogMessage } = require('../../../utils/modlog/modlog');
const { publicModResponses } = require('../../../utils/publicResponses/publicModResponses');
const { Database } = require('../../db/db')

module.exports.run = async (bot, message, args) => {
    if(config.deleteModCommandsAfterUsage  == 'true') {
        message.delete();
    }

    if(!await hasPermission(message, 0, 1)) {
        message.delete();
        return message.channel.send(`<@${message.author.id}> ${config.errormessages.nopermission}`).then(msg => {
            setTimeout(() => msg.delete(), 5000);
        });
    }

    let Member = args[0];
    if (!Member) return message.reply(`<@${message.author.id}> You have to mention a user`);
    Member = await Member.replace('<', '').replace('@', '').replace('!', '').replace('>', '');

    let reason = args.slice(1).join(" ");
    if(!reason) return message.channel.send('Please add a reason!');

    const database = new Database();

    await database.query(`SELECT * FROM open_infractions WHERE user_id AND ban = 1`, [Member]).then(async res => {
        if(res.length > 0) {
            await insertDataToClosedInfraction(Member, res[0].mod_id, res[0].mute, res[0].ban, 0, 0, res[0].till_date, res[0].reason, res[0].infraction_id)
            await database.query(`DELETE FROM open_infractions WHERE infraction_id = ?`, [res[0].infraction_id]);
        }
    }).catch(err => {
        console.log(err);
        return message.reply(`${config.errormessages.databasequeryerror}`);
    })

    try {
        setNewModLogMessage(bot, config.defaultModTypes.unban, message.author.id, Member, reason, null, message.guild.id);
        publicModResponses(message, config.defaultModTypes.unban, message.author.id, Member, reason);
        if(config.debug == 'true') console.info('Ban Command passed!')
        return await message.guild.members.unban(`${Member}`, `${reason}`);
    }catch(err) {
        return await message.reply(`The User is not banned.`);
    }
}

module.exports.help = {
    name:"unban",
    description: "Unban an User",
    usage: "unban <Mention User> <Reason>"
}