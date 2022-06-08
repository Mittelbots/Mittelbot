const { handleSlashCommands } = require("../src/slash_commands");
const { manageNewWelcomeSetting } = require("../utils/functions/data/welcomechannel");

module.exports.interactionCreate = ({
    bot
}) => {
    bot.on('interactionCreate', async (main_interaction) => {
        if(main_interaction.isCommand()) {
            handleSlashCommands({
                main_interaction,
                bot
            })
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