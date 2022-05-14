const {
    SlashCommandBuilder
} = require('@discordjs/builders');
const {
    hasPermission
} = require('../../../utils/functions/hasPermissions');
const {
    publicInfractionResponse
} = require('../../../utils/publicResponses/publicModResponses');
const database = require('../../db/db');
const config = require('../../../src/assets/json/_config/config.json');

const { errorhandler } = require('../../../utils/functions/errorhandler/errorhandler');



module.exports.run = async ({
    main_interaction,
    bot
}) => {

    if (!await hasPermission(main_interaction, 0, 0)) {
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

            await database.query(`SELECT * FROM closed_infractions WHERE user_id = ? ORDER BY ID DESC`, [user.id]).then(async res => closed.push(await res)).catch(err => {
                errorhandler(err, true);
                return main_interaction.reply({
                    content: config.errormessages.databasequeryerror,
                    ephemeral: true
                }).catch(err => {});
            });
            await database.query(`SELECT * FROM open_infractions WHERE user_id = ? ORDER BY ID DESC`, [user.id]).then(async res => open.push(await res)).catch(err => {
                errorhandler(err, true);
                return main_interaction.reply({
                    content: config.errormessages.databasequeryerror,
                    ephemeral: true
                }).catch(err => {});
            });

            if (closed[0].length <= 0 && open[0].length <= 0) {
                return main_interaction.reply({
                    content:`${user} dont have any infractions!`,
                    ephemeral: true
                }).catch(err => {});
            }
            if (config.debug == 'true') console.info('Infraction Command passed!')

            await publicInfractionResponse({
                member: user.id,
                closed: closed[0],
                open: open[0],
                main_interaction,
                isOne: false
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
                    return errorhandler(err, true);
                });
            }).catch(err => {
                return errorhandler(err, true);
            });
            const response = await publicInfractionResponse({
                member: infraction[0],
                guild: main_interaction.guild,
                closed: null,
                open: null,
                isOne: true
            });

            main_interaction.reply({
                embeds: [response.message],
                ephemeral: true
            }).catch(err => {});
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