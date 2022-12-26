require('dotenv').config();

const { Client, Options, GatewayIntentBits, Collection, Partials } = require('discord.js');

const config = require('./src/assets/json/_config/config.json');
const version = require('./package.json').version;

const { errorhandler } = require('./utils/functions/errorhandler/errorhandler');
const { setActivity } = require('./utils/functions/data/activity');
const { processErrorHandler } = require('./utils/functions/errorhandler/processErrorHandler');
const { startBot, acceptBotInteraction } = require('./bot/core/core');
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
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageReactions,
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
bot.owner = config.Bot_Owner;

bot.config = config;

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
        });

    setInterval(() => {
        setActivity(bot);
    }, 3600000); // 1h
});

bot.login(process.env.DISCORD_TOKEN);
