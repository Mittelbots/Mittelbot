const _ = require('underscore');

let session = null;

function generateSession(user, guild) {
    const timestamp = Date.now();
    const randomValue = _.random(0, 999999).toString();
    const sessionId = `${timestamp}-${randomValue}`;

    if (user && guild) {
        session = dataTransformer({ user, guild }, sessionId);
    }

    setTimeout(() => {
        // remove session after 5 seconds
        removeSession();
    }, 1000 * 5); // 5 seconds
}

function removeSession() {
    session = null;
}

function dataTransformer(data, sessionId) {
    return {
        sessionId,
        user: {
            id: data.user.id,
            username: data.user.username,
            discriminator: data.user.discriminator,
            avatar: data.user.avatar,
            bot: data.user.bot,
            system: data.user.system,
        },
        guild: {
            id: data.guild.id,
            name: data.guild.name,
            available: data.guild.available,
            shardId: data.guild.shardId,
            memberCount: data.guild.memberCount,
            joinedTimestamp: data.guild.joinedTimestamp,
            ownerId: data.guild.ownerId,
        },
    };
}

getSession = () => session || [];

module.exports = {
    generateSession,
    getSession,
    removeSession,
};
