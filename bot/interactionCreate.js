const { handleSlashCommands } = require("../src/slash_commands");
const { manageNewWelcomeSetting } = require("../utils/functions/data/welcomechannel");
const config = require("../src/assets/json/_config/config.json");
const { getConfig } = require("../utils/functions/data/getConfig");

const defaultCooldown = new Set();

module.exports.interactionCreate = ({
    bot
}) => {
    bot.on('interactionCreate', async (main_interaction) => {

        var {cooldown} = await getConfig({
            guild_id: main_interaction.guild.id,
        });

        if(main_interaction.isCommand()) {
            if(main_interaction.user.id !== config.Bot_Owner_ID){
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