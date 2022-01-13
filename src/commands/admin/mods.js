const config = require('../../../config.json');
const commandconfig = require('../../../command_config.json');
const {
    Permissions
} = require('discord.js');
const {
    Database
} = require('../../db/db');
const {
    viewSetting
} = require('../../../utils/functions/viewSetting');
const { log } = require('../../../logs');

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


    //? ADD OR REMOVE MODROLES
    if (setting === commandconfig.mods.modroles.command || setting === commandconfig.mods.modroles.alias) {

        let value = args[1];
        let type = args.slice(2).join(" ");

        if (value == '') return message.reply(`You have to mention a role!`);
        if (type == '') return message.reply(`You have to pass options! (exp.: ${config.defaultprefix}${commandconfig.mods.modroles.command} ${setting} ${value || '@role'} **true false false**)`)

        value = value.replaceAll('<', '').replaceAll('@', '').replaceAll('&', '').replaceAll('>', '');

        if (!message.guild.roles.cache.get(value)) return message.reply(`<@&${value[i]}> not found`);


        const database = new Database();

        let x = await database.query(`SELECT * FROM ${message.guild.id}_guild_modroles`).then(res => {
            if (res.length > 0) {
                for (let i in res) {
                    if (value === res[i].role_id) {
                        message.reply(`<@&${value}> is already a Mod role. It will be removed!`);
                        database.query(`DELETE FROM ${message.guild.id}_guild_modroles WHERE role_id = ?`, [res[i].role_id])
                        return false;
                    }
                }
            }
        }).catch(err => {
            log.fatal(err);
            if(config.debug == 'true') console.log(err);
            return message.channel.send(`${config.errormessages.databasequeryerror}`);
        });

        if(await x === false) return;

        type = type.split(' ');

        for (let i in type) {
            if (type[i] != '1' && type[i] != '0' && type[i].toLowerCase() != 'true' && type[i].toLowerCase() != 'false') return message.reply(`Wrong options! Only 0/1 or true or false allowed.`)
            if (type[i].toLowerCase() == 'true') type[i] = '1';
            if (type[i].toLowerCase() == 'false') type[i] = '0';
        }

        if(type[0] == ' ') return message.reply(`You have an space betweeen your role mention and the options!`)

        database.query(`INSERT INTO ${message.guild.id}_guild_modroles (role_id, isadmin, ismod, ishelper) VALUES (?, ?, ?, ?)`, [value, type[0], type[1], type[2]]).then(() => {
            return message.reply(`<@&${value}> successfully saved as a new Modrole!`);
        }).catch(err => {
            log.fatal(err);
            if(config.debug == 'true') console.log(err);
            return message.channel.send(`${config.errormessages.databasequeryerror}`);
        });
    } else return;
}

module.exports.help = {
    name: 'mods'
};