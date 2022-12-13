require('dotenv').config();

const { Client, Options, GatewayIntentBits, Collection, Partials } = require('discord.js');

const config = require('./src/assets/json/_config/config.json');
const version = require('./package.json').version;

const { errorhandler } = require('./utils/functions/errorhandler/errorhandler');
const { db_backup } = require('./src/db/db_backup');
const { setActivity } = require('./utils/functions/data/activity');
const { processErrorHandler } = require('./utils/functions/errorhandler/processErrorHandler');
const { startBot, restartBot, acceptBotInteraction } = require('./bot/core/core');
const { delay } = require('./utils/functions/delay/delay');

processErrorHandler();

const bot = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildBans,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
    makeCache: Options.cacheWithLimits({
        MessageManager: 10,
        PresenceManager: 10,
        GuildMemberManager: 10,
    }),
    shards: 'auto',
});
bot.setMaxListeners(10);

bot.commands = new Collection();

bot.version = version;

if (!JSON.parse(process.env.DEBUG)) {
    setTimeout(() => {
        db_backup();
    }, 60000);

    setTimeout(() => {
        db_backup();
    }, 86400000); // 24h
}

bot.once('ready', async () => {
    await startBot(bot)
        .then(() => {
            acceptBotInteraction(bot);
        })
        .catch(async (err) => {
            errorhandler({
                err,
                message: 'Error at startBot function',
                fatal: true,
            });
            await delay(10000);
            //await restartBot();
        });

    setInterval(() => {
        setActivity(bot);
    }, 3600000); // 1h
});

bot.login(process.env.DISCORD_TOKEN);
