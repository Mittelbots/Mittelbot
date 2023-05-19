const TwitchNotification = require('../../../utils/functions/data/Notifications/Twitch/TwitchNotification');

const interval = 1000 * 60; // 1 minute
module.exports.twitch_notifier = async ({ bot }) => {
    console.info('🔎 Twitch streams handler started');
    const twitchNotification = new TwitchNotification(bot);

    setInterval(async () => {
        twitchNotification.check();
    }, interval);
};
