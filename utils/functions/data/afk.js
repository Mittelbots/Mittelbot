const { userAFK } = require('./variables');

module.exports.handlerAFKInput = ({ main_interaction }) => {
    const reason = main_interaction.fields.fields.get('afk_reason').value || 'No reason given.';
    var date = new Date();
    date = date.setHours(date.getHours() - 1);

    const obj = {
        user_id: main_interaction.user.id,
        reason: reason,
        time: Math.floor(date / 1000) + 3600,
        guild_id: main_interaction.guild.id,
    };

    userAFK.push(obj);

    return main_interaction
        .reply({
            content: `✅ You are now afk. \`Reason: ${reason}\``,
            ephemeral: true,
        })
        .catch((err) => {});
};

module.exports.checkAFK = ({ message }) => {
    const mentions = message.mentions.users;

    let isAFK = false;

    if (mentions.size === 0) return isAFK;

    mentions.map((user) => {
        const isUserAFK = userAFK.find(
            (afk) => afk.user_id === user.id && afk.guild_id === message.guild.id
        );
        if (isUserAFK) {
            return (isAFK = isUserAFK);
        }
    });

    return isAFK;
};
