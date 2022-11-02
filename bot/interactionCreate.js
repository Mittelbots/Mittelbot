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
    getGuildConfig
} = require("../utils/functions/data/getConfig");
const { InteractionType } = require("discord.js");
const { manageScam } = require("../utils/functions/data/scam");
const { handlerAFKInput } = require("../utils/functions/data/afk");
const { getGlobalConfig } = require("../utils/functions/data/ignoreMode");
const { errorhandler } = require("../utils/functions/errorhandler/errorhandler");

const defaultCooldown = new Set();

module.exports.interactionCreate = ({
    bot
}) => {
    bot.on('interactionCreate', async (main_interaction) => {

        if(main_interaction.user.bot || main_interaction.user.system) return;

        const {ignoreMode} = await getGlobalConfig();

        if(JSON.parse(ignoreMode) && main_interaction.user.id !== config.Bot_Owner_ID) {
            return main_interaction.reply({
                content: "Sorry, I am currently in ignore mode. Join the support server to get more information https://blackdayz.de/mittelbot/support.",
                ephemeral: true
            }).catch(err => {})
        }

        var {
            settings
        } = await getGuildConfig({
            guild_id: main_interaction.guild.id,
        });

        main_interaction.bot = bot;
        if (main_interaction.type === InteractionType.ApplicationCommand) {
            if (main_interaction.user.id !== config.Bot_Owner_ID) {
                if (defaultCooldown.has(main_interaction.user.id)) {

                    errorhandler({fatal: false, message: `${main_interaction.user.username} is on slash command cooldown.`});

                    return main_interaction.reply({
                        content: `You have to wait ${settings.cooldown / 1000 + 's'|| config.defaultCooldown.text} after each Command.`,
                        ephemeral: true
                    }).catch(err => {})
                } else {

                    defaultCooldown.add(main_interaction.user.id);
                    setTimeout(async () => {
                        defaultCooldown.delete(main_interaction.user.id);
                    }, settings.cooldown || config.defaultCooldown.format);

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

        } else if(main_interaction.type === InteractionType.ModalSubmit) {
            if(main_interaction.customId == 'afk_modal') {
                handlerAFKInput({main_interaction})
            }  
        }
        else {
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

            if(main_interaction.customId.indexOf('scam') === 0) {
                manageScam({main_interaction})
                    .then(res => {
                        main_interaction.reply({
                            content: res,
                            ephemeral: true
                        }).catch(err => {})
                    }).catch(err => {
                        main_interaction.reply({
                            content: err,
                            ephemeral: true
                        }).catch(err => {})
                    })
            }
        }
    });
}