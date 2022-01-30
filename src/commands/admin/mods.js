const config = require('../../../config.json');
const commandconfig = require('../../../command_config.json');
const {
    Permissions,
    MessageEmbed,
    MessageActionRow,
    MessageButton 
} = require('discord.js');
const { log } = require('../../../logs');

const {Database} = require('../../db/db');
const { errorhandler } = require('../../../utils/functions/errorhandler/errorhandler');
const { removeMention } = require('../../../utils/functions/removeCharacters');
const { insertPermsToModroles, deletePermsFromModroles, updatePermsFromModroles } = require('../../../utils/functions/insertDataToDatabase');

module.exports.run = async (bot, message, args) => {

    const database = new Database();

    if (config.deleteModCommandsAfterUsage == 'true') {
        message.delete();
    }
    if (!message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
        database.close();
        message.delete();
        return message.channel.send(`<@${message.author.id}> ${config.errormessages.nopermission}`).then(msg => {
            setTimeout(() => msg.delete(), 5000);
        });
    }

    let setting = args[0]


    //? ADD OR REMOVE MODROLES //
    if (setting === commandconfig.mods.modroles.command || setting === commandconfig.mods.modroles.alias) {

        let value = args[1];

        const isadmin = 'isadmin';
        const isadminLabel = 'Admin';
        var db_isadmin;

        const ismod = 'ismod';
        const ismodLabel = 'Moderator';
        var db_ismod;

        const ishelper = 'ishelper';
        const ishelperLabel = 'Helper';
        var db_ishelper;

        const remove = 'remove';
        const removeLabel = 'Remove';


        var roleid;

        var status = false;

        args[1] = removeMention(args[1])

        await database.query(`SELECT * FROM ${message.guild.id}_guild_modroles WHERE role_id = ?`, [args[1]]).then(async res => {
            if(await res.length > 0) {
                roleid = await res[0].role_id;
                db_isadmin = await res[0].isadmin
                db_ismod = await res[0].ismod
                db_ishelper = await res[0].ishelper
                status = true;
            }
        }).catch(err => {
            return errorhandler(err, config.errormessages.databasequeryerror, message.channel, log, config);
        });
        
        if(roleid == null) value = removeMention(value);
        else value = roleid;

        const role = await bot.guilds.cache.get(message.guild.id).roles.fetch(value)

        let modroleembed = new MessageEmbed()
        .setTitle(`Choose setting for _${role.name}_. \n\nCurrent: **${(db_isadmin) ? 'Admin': (db_ismod) ? 'Moderator': (db_ishelper) ? 'Helper' : 'Not set yet'}**`)

        const row = new MessageActionRow()

        if(db_isadmin !== 1){
            row.addComponents(
                new MessageButton()
                .setCustomId(isadmin)
                .setLabel(isadminLabel)
                .setStyle('PRIMARY')
            );
            modroleembed.addField('Admin Permissions', 'This role can use commands like ban, unban, etc.', true)
        }
        if(db_ismod !== 1) {
            row.addComponents(
                new MessageButton()
                .setCustomId(ismod)
                .setLabel(ismodLabel)
                .setStyle('PRIMARY')
            );
            modroleembed.addField('Moderator Permissions', 'This role can use commands like mute, kick, etc.', true)
        }
        if(db_ishelper !== 1) {
            row.addComponents(
                new MessageButton()
                .setCustomId(ishelper)
                .setLabel(ishelperLabel)
                .setStyle('PRIMARY')
            );
            modroleembed.addField('Helper Permissions', 'This role can use commands like warn, mute, etc.', true)
        }
        if(db_isadmin !== undefined || db_ismod !== undefined || db_ishelper !== undefined) {
            row.addComponents(
                new MessageButton()
                .setCustomId(remove)
                .setLabel(removeLabel)
                .setStyle('DANGER')
            )
        }

        
        const embedMessage = await message.channel.send({embeds: [modroleembed], components: [row]});

        const collector = embedMessage.createMessageComponentCollector({
            filter: ({user}) => user.id === message.author.id,
            time: 15000,
            max: 1
        });

        collector.on('collect', async interaction => {
            interaction.deferUpdate();
            if(interaction.customId === isadmin) {
                if(db_isadmin == 1) return;
                if(status) {
                    return await updatePermsFromModroles(message.guild.id, value, 1, 0, 0)
                }
                else {
                    return await insertPermsToModroles(message.guild.id, value, 1, 0, 0) 
                }
            }else if(interaction.customId === ismod) {
                if(db_ismod == 1) return;
                if(status) {
                    return await updatePermsFromModroles(message.guild.id, value, 0, 1, 0)
                }
                else {
                    return await insertPermsToModroles(message.guild.id, value, 0, 1, 0) 
                }
            } else if(interaction.customId === ishelper) {
                if(db_ishelper == 1) return;
                if(status){
                    return await updatePermsFromModroles(message.guild.id, value, 0, 0, 1)
                }
                else{
                    return await insertPermsToModroles(message.guild.id, value, 0, 0, 1)
                }
            } else {
                return await deletePermsFromModroles(message.guild.id, value)
            }
        });

        collector.on('end', (collected, reason) => {
            if(reason == 'time'){
                for(let i in row.components) {
                    row.components[i].setStyle('DANGER');
                    row.components[i].setDisabled(true)
                }
                embedMessage.edit({content: '**Time limit reached**', embeds: [modroleembed], components: [row]})
            }
            collected.forEach(x => {
                for(let i in row.components) {
                    if(row.components[i].customId === x.customId) {
                        row.components[i].setStyle('SUCCESS');
                    }else {
                        row.components[i].setStyle('SECONDARY');
                    }
                    row.components[i].setDisabled(true)
                }
                embedMessage.edit({embeds: [modroleembed], components: [row]})
            });
            
            return database.close();
        });
        return;

    } else return;
}

module.exports.help = {
    name: 'mods'
};