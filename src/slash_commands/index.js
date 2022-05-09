module.exports.handleSlashCommands = async ({main_interaction, bot}) => {
    require(`./${main_interaction.commandName}/${main_interaction.commandName}`).run({main_interaction: main_interaction, bot:bot});
}