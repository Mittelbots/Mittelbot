const {
    SlashCommandBuilder
} = require('discord.js');
const {
    hasPermission
} = require('../../../utils/functions/hasPermissions');
const {
    publicInfractionResponse
} = require('../../../utils/publicResponses/publicModResponses');
const database = require('../../db/db');
const config = require('../../../src/assets/json/_config/config.json');

const { errorhandler } = require('../../../utils/functions/errorhandler/errorhandler');
const { getClosedInfractionsByUserId, getOpenInfractionsByUserId } = require('../../../utils/functions/data/infractions');



module.exports.run = async ({
    main_interaction,
    bot
}) => {

    const hasPermissions = await hasPermission({
        guild_id: main_interaction.guild.id,
        adminOnly: false,
        modOnly: false,
        user: main_interaction.member,
        bot
    })

    if (!hasPermissions) {
        return main_interaction.reply({
            content: `<@${main_interaction.user.id}> ${config.errormessages.nopermission}`,
            ephemeral: true
        }).catch(err => {});
    }

    switch (main_interaction.options.getSubcommand()) {
        case 'all':
            const user = main_interaction.options.getUser('user');

            var closed = [];
            var open = [];

            const closed_infractions = await getClosedInfractionsByUserId({user_id: user.id});

            const open_infractions = await getOpenInfractionsByUserId({user_id: user.id});

            if(!closed_infractions || !open_infractions) {
                return main_interaction.reply({
                    content: config.errormessages.databasequeryerror,
                    ephemeral: true
                }).catch(err => {});
            }else {
                closed = closed_infractions;
                open = open_infractions;
            }

            if (closed.length <= 0 && open.length <= 0) {
                return main_interaction.reply({
                    content:`${user} dont have any infractions!`,
                    ephemeral: true
                }).catch(err => {});
            }
            if (config.debug == 'true') console.info('Infraction Command passed!')

            await publicInfractionResponse({
                member: user.id,
                closed: closed,
                open: open,
                main_interaction,
            });
            
            break;

        case 'view':
            const inf_id = main_interaction.options.getString('infractionid');

            var infraction = [];

            await database.query(`SELECT * FROM closed_infractions WHERE infraction_id = ? LIMIT 1`, [inf_id]).then(async res => {
                if (res.length > 0) {
                    return infraction.push(res[0]);
                }
                await database.query(`SELECT * FROM open_infractions WHERE infraction_id = ? LIMIT 1`, [inf_id]).then(async res => {
                    if (res.length > 0) {
                        return infraction.push(res[0]);
                    }
                }).catch(err => {
                    return errorhandler({err, fatal: true});
                });
            }).catch(err => {
                return errorhandler({err, fatal: true});
            });
            
            const response = await publicInfractionResponse({
                guild: main_interaction.guild,
                isOne: true,
                infraction: infraction[0]
            });

            main_interaction.reply({
                embeds: [response.message],
                ephemeral: true
            }).catch(err => {});
        break;
        
        case 'remove':
            const infraction_id = main_interaction.options.getString('infractionid');

            let inf_exists = false;
            let table = '';
            await database.query(`SELECT id FROM closed_infractions WHERE infraction_id = ? LIMIT 1`, [infraction_id]).then(async res => {
                if (res.length > 0) {
                    table = 'closed_infractions';
                    return inf_exists = true;
                }

                await database.query(`SELECT id FROM open_infractions WHERE infraction_id = ? LIMIT 1`, [infraction_id]).then(async res => {
                    if (res.length > 0) {
                        table = 'open_infractions';
                        return inf_exists = true;
                    }
                }).catch(err => {
                    return errorhandler({err, fatal: true});
                });
            }).catch(err => {
                return errorhandler({err, fatal: true});
            });

            if(inf_exists) {

                database.query(`DELETE FROM ${table} WHERE infraction_id = ?`, [infraction_id])
                    .then(() => {
                        main_interaction.reply({
                            content: `Infraction with id \`${infraction_id}\` has been removed!`,
                            ephemeral: true
                        }).catch(err => {});
                    })
                    .catch(err => {
                        main_interaction.reply({
                            content: `Infraction with id \`${infraction_id}\` could not be removed!`,
                            ephemeral: true
                        }).catch(err => {});
                        return errorhandler({err, fatal: true});
                    })
                
            }else {
                return main_interaction.reply({
                    content: `Infraction with id \`${infraction_id}\` does not exist!`,
                    ephemeral: true
                }).catch(err => {});
            }
        break;
    }


}

module.exports.data = new SlashCommandBuilder()
    .setName('infractions')
    .setDescription('See infractions of a user')
    .addSubcommand(command =>
        command.setName('all')
        .setDescription('See all infractions of a user')
        .addUserOption(option =>
            option.setName('user')
            .setRequired(true)
            .setDescription('The user to see infractions of')
        )
    )
    .addSubcommand(command =>
        command.setName('view')
        .setDescription('View an specific infraction')
        .addStringOption(option =>
            option.setName('infractionid')
            .setRequired(true)
            .setDescription('The id of the infraction to view')
        )
    )
    .addSubcommand(command =>
        command.setName('remove')
        .setDescription('Remove an specific infraction')
        .addStringOption(option =>
            option.setName('infractionid')
            .setRequired(true)
            .setDescription('The id of the infraction to remove')
        )
    )