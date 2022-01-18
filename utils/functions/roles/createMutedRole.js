async function createMutedRole(message) {
    try {
        let MutedRole;
        MutedRole = await message.guild.roles.create({
            name: 'Muted',
            color: 'BLUE',
            reason: 'Automatically created "Muted" Role.',
            permissions: []
        });
        await message.guild.channels.cache.map(async channel => {
            await channel.permissionOverwrites.create(MutedRole, {
                VIEW_CHANNEL: false,
                SEND_MESSAGES: false,
                ADD_REACTIONS: false,
                SPEAK: false,
                CONNECT: false
            });
        });
        return MutedRole;
    }catch(err){
        return message.reply(`I don't have permission to create the muted role.`)
    }
}

module.exports = {createMutedRole}