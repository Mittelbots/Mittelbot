async function createMutedRole({ guild }) {
    try {
        let MutedRole;
        MutedRole = await guild.roles.create({
            name: 'Muted',
            color: 'BLUE',
            reason: 'Automatically created "Muted" Role.',
            permissions: [],
        });
        await guild.channels.cache.map(async (channel) => {
            await channel.permissionOverwrites.create(MutedRole, {
                VIEW_CHANNEL: false,
                SEND_MESSAGES: false,
                ADD_REACTIONS: false,
                SPEAK: false,
                CONNECT: false,
            });
        });
        return MutedRole;
    } catch (err) {
        return {
            error: true,
            message: `I don't have permission to create the muted role.`,
        };
    }
}

module.exports = { createMutedRole };
