const Banappeal = require('~utils/classes/Banappeal');

module.exports.banAppealModule = async (message, bot) => {
    const banappeal = new Banappeal(bot);
    const guild_id = await banappeal.getBanAppealMessage(message, bot);
    const userBanAppeal = await banappeal.getBanappeal(guild_id, message.author.id);
    if (!userBanAppeal) return;

    const isOverCooldown = await banappeal.isOverCooldown(userBanAppeal.id);
    if (!isOverCooldown) {
        return message
            .reply({
                content: `You can not send a new appeal yet.`,
            })
            .catch((err) => {});
    }

    if (userBanAppeal.appeal_msg && userBanAppeal.isAccepted === undefined) {
        return message
            .reply({
                content: 'You already sent an appeal. Please wait for an answer.',
            })
            .catch((err) => {});
    } else if (userBanAppeal.isAccepted || !userBanAppeal.isAccepted) {
        message
            .reply({
                content: `Your appeal was ${
                    userBanAppeal.isAccepted ? 'accepted' : 'denied'
                }. You can not send a new appeal.`,
            })
            .catch((err) => {});
        return;
    }

    const cleanedMessage = banappeal.cleanUserInput(message.content);
    if (cleanedMessage.length < 10) {
        return message
            .reply({
                content: 'Your appeal is too short. Please write a longer appeal.',
            })
            .catch((err) => {});
    } else if (cleanedMessage.length > 19000) {
        return message
            .reply({
                content: 'Your appeal is too long. Please write a shorter appeal.',
            })
            .catch((err) => {});
    }

    banappeal.updateBanappeal(guild_id, message.author.id, cleanedMessage, 'appeal_msg');
    banappeal
        .sendAppealToAdmins(guild_id, message.author.id, bot)
        .then(() => {
            message
                .reply({
                    content: 'Your appeal was sent to the admins. Please wait for an answer.',
                })
                .catch((err) => {});
        })
        .catch((err) => {
            message
                .reply({
                    content: `An error occurred while sending your appeal. Please try again later. Error: **${err}**`,
                })
                .catch((err) => {});
        });
    return;
};
