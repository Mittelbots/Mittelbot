module.exports.handleSlashCommands = async ({main_interaction, bot}) => {
    let moderation = ['ban', 'infractions', 'isbanned', 'kick', 'mute', 'unban', 'unmute', 'purge', 'warn'];
    let fun = ['avatar', 'ship'];
       
    if(moderation.indexOf(main_interaction.commandName) !== -1){
        return require(`./moderation/${main_interaction.commandName}`).run({main_interaction: main_interaction, bot:bot});
    }
    else if(fun.indexOf(main_interaction.commandName) !== -1){
        return require(`./fun/${main_interaction.commandName}`).run({main_interaction: main_interaction, bot:bot});
    }
    else {
        return require(`./${main_interaction.commandName}/${main_interaction.commandName}`).run({main_interaction: main_interaction, bot:bot});
    }
}