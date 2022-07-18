const {
    handleSlashCommands
} = require("../src/slash_commands");
const {
    manageNewWelcomeSetting
} = require("../utils/functions/data/welcomechannel");
const {
    manageNewForm, manageApplication
} = require("../utils/functions/data/apply_form");
const config = require("../src/assets/json/_config/config.json");
const {
    getConfig
} = require("../utils/functions/data/getConfig");
const { InteractionType } = require("discord-api-types/v10");

const defaultCooldown = new Set();

module.exports.interactionCreate = ({
    bot
}) => {
    bot.on('interactionCreate', async (main_interaction) => {
        var {
            cooldown
        } = await getConfig({
            guild_id: main_interaction.guild.id,
        });

        main_interaction.bot = bot;
        if (main_interaction.type === InteractionType.ApplicationCommand) {
            if (main_interaction.user.id !== config.Bot_Owner_ID) {
                if (defaultCooldown.has(main_interaction.user.id)) {
                    return main_interaction.reply({
                        content: `You have to wait ${cooldown / 1000 + 's'|| config.defaultCooldown.text} after each Command.`,
                        ephemeral: true
                    }).catch(err => {})
                } else {

                    defaultCooldown.add(main_interaction.user.id);
                    setTimeout(async () => {
                        defaultCooldown.delete(main_interaction.user.id);
                    }, cooldown || config.defaultCooldown.format);

                    return handleSlashCommands({
                        main_interaction,
                        bot
                    })
                }
            } else {
                //BOT OWNER BYPASS ;)
                return handleSlashCommands({
                    main_interaction,
                    bot
                })
            }

        } else {
            switch (main_interaction.customId) {
                case "welcomemessage":
                    await main_interaction.deferUpdate();
                    manageNewWelcomeSetting({
                        main_interaction,
                    })
                    break;

                case 'manage_apply':
                    await main_interaction.deferUpdate();
                    manageNewForm({
                        main_interaction
                    }).catch(err => {
                        main_interaction.reply({
                            content: err,
                            ephemeral: true
                        }).catch(err => {})
                    })
                    break;
            }

            let apply_regex = /apply_[1-9][0-9]+/i;
            if (apply_regex.test(main_interaction.customId)) {
                manageApplication({
                    main_interaction,
                    apply_id: main_interaction.customId.match(apply_regex)[0].replace('apply_', '')
                })
            }
        }
    });
}