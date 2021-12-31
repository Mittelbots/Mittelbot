const config = require('../../../config.json');
const commandconfig = require('../../../command_config.json');
const {
    MessageEmbed,
    Permissions
} = require('discord.js');
const {
    Database
} = require('../../db/db');
const { viewSetting } = require('../../../utils/functions/viewSetting');

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

    let setting = args[0]
    let value = args.slice(1).join(" ");

    if(value == '') {
        const database = new Database();
        var modroles = database.query(`SELECT * FROM ${message.guild.id}_guild_modroles`).then(async res => {
            return await res
        }).catch(err => {
            console.log(err);
            return message.channel.send(`${config.errormessages.databasequeryerror}`);
        });

        var passed = false;
        for(let i in commandconfig) {
            if(setting == commandconfig.mods.modroles.alias) {
                // viewSetting(bot, commandconfig.mods.modroles.name, commandconfig.mods.modroles.desc, commandconfig.mods.modroles.icon, modroles));
            }
        }
        if(!passed) return;

    }else {

    }
}

module.exports.help = {
    name:"mods"
}