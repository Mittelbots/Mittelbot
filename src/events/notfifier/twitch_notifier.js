const TwitchNotification = require('../../../utils/functions/data/Notifications/TwitchNotification');

const interval = 1000 * 10; // 1 minute
module.exports.twitch_notifier = async ({ bot }) => {
    console.info('🔎 Twitch streams handler started');

    setInterval(async () => {
        new TwitchNotification(bot).check();
    }, interval);
};
