require('dotenv').config();

const { sentryInit } = require('./sentry');
sentryInit();

const { Client, Options, GatewayIntentBits, Partials } = require('discord.js');

const config = require('~assets/json/_config/config.json');
const version = require('../../package.json').version;

const { errorhandler } = require('~utils/functions/errorhandler/errorhandler');
const { setActivity } = require('~utils/functions/activity');
const { processErrorHandler } = require('~utils/functions/errorhandler/processErrorHandler');
const { startBot } = require('./core');
const { delay } = require('~utils/functions/delay');
const { acceptBotInteraction } = require('./botEvents');
const { Player } = require('discord-player');
const { registerPlayerEvents } = require('../../bot/events/player/player-events');
const Translations = require('~utils/functions/Translations/Translations');

processErrorHandler();

const bot = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.AutoModerationConfiguration,
        GatewayIntentBits.AutoModerationExecution,
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
    makeCache: Options.cacheWithLimits({
        MessageManager: 10,
        PresenceManager: 10,
        GuildMemberManager: 10,
    }),
    shards: 'auto',
});
bot.setMaxListeners(0);

bot.version = version;
bot.ownerId = process.env.OWNER_ID;
bot.testAcc = process.env.TEST_ACCOUNTS;

bot.player = new Player(bot, {
    connectionTimeout: 60000 * 10,
    smoothVolume: true,
    ytdlOptions: {
        highWaterMark: 1 << 25,
        quality: 'highestaudio',
    },
    autoRegisterExtractor: false,
    useLegacyFFmpeg: true,
});
registerPlayerEvents(bot.player, bot);

global.t = new Translations();

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

global.bot = bot;

bot.login(process.env.DISCORD_TOKEN);
