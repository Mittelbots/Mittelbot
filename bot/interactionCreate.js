const { handleSlashCommands } = require("../src/slash_commands");

module.exports.interactionCreate = ({
    bot
}) => {
    bot.on('interactionCreate', async (main_interaction) => {
        if(main_interaction.isCommand()) {
            handleSlashCommands({
                main_interaction,
                bot
            })
          }
      });
}