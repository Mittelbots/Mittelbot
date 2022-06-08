const { handleSlashCommands } = require("../src/slash_commands");
const { manageNewWelcomeSetting } = require("../utils/functions/data/welcomechannel");
const config = require("../src/assets/json/_config/config.json");

const defaultCooldown = new Set();

module.exports.interactionCreate = ({
    bot
}) => {
    bot.on('interactionCreate', async (main_interaction) => {
        if(main_interaction.isCommand()) {
            if(main_interaction.user.id !== config.Bot_Owner_ID){
                if (defaultCooldown.has(message.author.id)) {
                    return main_interaction.reply({
                        content: `You have to wait ${cooldown / 1000 + 's'|| config.defaultCooldown.text} after each Command.`,
                        ephemeral: true
                    }).catch(err => {})
                } else {

                    defaultCooldown.add(message.author.id);
                    setTimeout(async () => {
                        defaultCooldown.delete(message.author.id);
                    }, cooldown || config.defaultCooldown.format);

                    return handleSlashCommands({
                        main_interaction,
                        bot
                    })
                }
            }else {
                //BOT OWNER BYPASS ;)
                return handleSlashCommands({
                    main_interaction,
                    bot
                })
            }
            
          }else {
                await main_interaction.deferUpdate();
              switch(main_interaction.customId) {
                    case "welcomemessage":
                        manageNewWelcomeSetting({
                            main_interaction,
                        })
                    break;
              }
          }
      });
}