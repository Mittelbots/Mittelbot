const config = require('../src/assets/json/_config/config.json');
const token = require('../_secret/token.json').BOT_TOKEN;
const route = require('./assets/config/route.json');

module.exports = {
    port: 8089, // Port to listen on
    prefix: '/', // Prefix for commands
    id: config.DISCORD_APPLICATION_ID, // Discord Bot ID
    usingCustomDomain: false, // Use a custom domain for the bot
    domain: 'http://', // Custom domain
    discordInvite: 'https://discord.gg/', // Discord Invite URL
    mongodbUrl: 'MONGO_URI', // MongoDB connection URL
    clientSecret: config.DISCORD_SECRET, // Client Secret from Discord Application
    token: token, // Bot Token from Discord Application,
    sessionSecret: '', // Session Secret
    discordAuthLink: '',
    route,
    mode: 'dev',
};
