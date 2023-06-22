const TwitchNotification = require('~utils/classes/Notifications/Twitch/TwitchNotification');

const interval = 1000 * 60; // 1 minute
module.exports.twitch_notifier = async ({ bot }) => {
    const clientId = process.env.TT_CLIENT_ID;
    const clientSecret = process.env.TT_SECRET;

    if (!clientId || !clientSecret) {
        console.error('===============================');
        console.error('TwitchNotifier: No Client ID or Client Secret found!');
        console.error('TwitchNotifier: Please check your .env file!');
        console.error('TwitchNotifier: Disabling TwitchNotifier...');
        console.error('===============================');
        return;
    }

    console.info('🔎 Twitch streams handler started');
    const twitchNotification = new TwitchNotification(bot);

    setInterval(async () => {
        twitchNotification.check();
    }, interval);
};
