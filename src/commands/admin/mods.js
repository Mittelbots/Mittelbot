const config = require('../../../src/assets/json/_config/config.json');
const commandconfig = require('../../assets/json/command_config/command_config.json');
const cmd_help = require('../../../src/assets/json/command_config/command_help.json');
const {
    PermissionFlagsBits,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} = require('discord.js');

const { errorhandler } = require('../../../utils/functions/errorhandler/errorhandler');
const { removeMention } = require('../../../utils/functions/removeCharacters');
const { updatePermsFromModroles } = require('../../../utils/functions/data/modroles');
const database = require('../../db/db');
const { getGuildConfig } = require('../../../utils/functions/data/getConfig');

module.exports.run = async (bot, message, args) => {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
        message.delete().catch((err) => {});
        return message.channel
            .send(`<@${message.author.id}> ${config.errormessages.nopermission}`)
            .then((msg) => {
                setTimeout(() => msg.delete(), 5000);
            })
            .catch((err) => {});
    }

    let setting = args[0];

    //? ADD OR REMOVE MODROLES //
    if (
        setting === commandconfig.mods.modroles.command ||
        setting === commandconfig.mods.modroles.alias
    ) {
        let value = args[1];
        if (!value || value === '') return message.reply('No role provied!');

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

        args[1] = removeMention(args[1]);

        const config = await getGuildConfig({
            guild_id: message.guild.id,
        });
        var modroles;
        try {
            modroles = JSON.parse(config.settings.modroles);
        } catch (e) {
            modroles = config.settings.modroles;
        }
        for (let i in modroles) {
            if (modroles[i].role === args[1]) {
                roleid = modroles[i].role;
                db_isadmin = modroles[i].isadmin;
                db_ismod = modroles[i].ismod;
                db_ishelper = modroles[i].ishelper;
            }
        }

        if (roleid == null) value = removeMention(value);
        else value = roleid;

        const role = await bot.guilds.cache.get(message.guild.id).roles.fetch(value);

        if (!role) {
            return message.reply(
                `I could't found any role with this id. Please provide a existing one. (User ID doesnt work!)`
            );
        }

        let modroleembed = new EmbedBuilder().setTitle(
            `Choose setting for _${role.name}_. \n\nCurrent: **${
                db_isadmin
                    ? 'Admin'
                    : db_ismod
                    ? 'Moderator'
                    : db_ishelper
                    ? 'Helper'
                    : 'Not set yet'
            }**`
        );

        const isAdminButton = new ButtonBuilder()
            .setCustomId(isadmin)
            .setLabel(isadminLabel)
            .setStyle(ButtonStyle.Primary);

        const isModButton = new ButtonBuilder()
            .setCustomId(ismod)
            .setLabel(ismodLabel)
            .setStyle(ButtonStyle.Primary);

        const isHelperButton = new ButtonBuilder()
            .setCustomId(ishelper)
            .setLabel(ishelperLabel)
            .setStyle(ButtonStyle.Primary);

        const isRemoveButton = new ButtonBuilder()
            .setCustomId(remove)
            .setLabel(removeLabel)
            .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder();
        if (db_isadmin !== 1) {
            row.addComponents(isAdminButton);

            modroleembed.addFields([
                {
                    name: 'Admin Permissions',
                    value: 'This role can use commands like ban, unban, etc.',
                    inline: true,
                },
            ]);
        }
        if (db_ismod !== 1) {
            row.addComponents(isModButton);

            modroleembed.addFields([
                {
                    name: 'Moderator Permissions',
                    value: 'This role can use commands like mute, kick, etc.',
                    inline: true,
                },
            ]);
        }
        if (db_ishelper !== 1) {
            row.addComponents(isHelperButton);

            modroleembed.addFields([
                {
                    name: 'Helper Permissions',
                    value: 'This role can use commands like warn, mute, etc.',
                    inline: true,
                },
            ]);
        }
        if (db_isadmin !== undefined || db_ismod !== undefined || db_ishelper !== undefined) {
            row.addComponents(isRemoveButton);
        }

        let pass = true;
        const embedMessage = await message.channel
            .send({
                embeds: [modroleembed],
                components: [row],
            })
            .catch((err) => {
                pass = false;
                return errorhandler({
                    err,
                });
            });

        if (!pass) return;

        const collector = embedMessage.createMessageComponentCollector({
            filter: ({ user }) => user.id === message.author.id,
            time: 15000,
            max: 1,
        });

        collector.on('collect', async (interaction) => {
            if (interaction.customId === isadmin) {
                if (db_isadmin == 1) return;

                updatePermsFromModroles({
                    guild_id: message.guild.id,
                    role_id: value,
                    isadmin: 1,
                    ismod: 0,
                    ishelper: 0,
                })
                    .then((res) => {
                        isAdminButton.setStyle(ButtonStyle.Success);
                        message.reply(res).catch((err) => {});
                    })
                    .catch((err) => {
                        isAdminButton.setStyle(ButtonStyle.Danger);
                        message.reply(err).catch((err) => {});
                    });
            } else if (interaction.customId === ismod) {
                if (db_ismod == 1) return;

                updatePermsFromModroles({
                    guild_id: message.guild.id,
                    role_id: value,
                    isadmin: 0,
                    ismod: 1,
                    ishelper: 0,
                })
                    .then((res) => {
                        isModButton.setStyle(ButtonStyle.Success);
                        message.reply(res).catch((err) => {});
                    })
                    .catch((err) => {
                        isModButton.setStyle(ButtonStyle.Danger);
                        message.reply(err).catch((err) => {});
                    });
            } else if (interaction.customId === ishelper) {
                if (db_ishelper == 1) return;
                updatePermsFromModroles({
                    guild_id: message.guild.id,
                    role_id: value,
                    isadmin: 0,
                    ismod: 0,
                    ishelper: 1,
                })
                    .then((res) => {
                        isHelperButton.setStyle(ButtonStyle.Success);
                        message.reply(res).catch((err) => {});
                    })
                    .catch((err) => {
                        isHelperButton.setStyle(ButtonStyle.Danger);
                        message.reply(err).catch((err) => {});
                    });
            } else {
                updatePermsFromModroles({
                    guild_id: message.guild.id,
                    role_id: value,
                    isadmin: 0,
                    ismod: 0,
                    ishelper: 0,
                })
                    .then((res) => {
                        isRemoveButton.setStyle(ButtonStyle.Success);
                        message.reply(res).catch((err) => {});
                    })
                    .catch((err) => {
                        isRemoveButton.setStyle(ButtonStyle.Danger);
                        message.reply(err).catch((err) => {});
                    });
            }

            isAdminButton.setDisabled(true);
            isModButton.setDisabled(true);
            isHelperButton.setDisabled(true);
            isRemoveButton.setDisabled(true);
            interaction.update({
                components: [row],
            });
        });

        collector.on('end', (collected, reason) => {
            if (reason == 'time') {
                embedMessage.edit({
                    content: '**Time limit reached**',
                    embeds: [modroleembed],
                    components: [],
                });
            }
        });
    } else return;
};

module.exports.help = cmd_help.admin.mods;
