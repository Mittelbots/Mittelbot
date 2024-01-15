const { checkInfractions } = require('~src/events/checkInfraction');
const { checkTemproles } = require('~src/events/checkTemproles');
const { twitch_notifier } = require('~src/events/notfifier/twitch_notifier');
const {
    createSlashCommands,
    loadCommandList,
} = require('~utils/functions/createSlashCommands/createSlashCommands');
const { setActivity } = require('~utils/functions/activity');
const database = require('~src/db/db');
const Guilds = require('~utils/classes/Guilds');
const { reddit_notifier } = require('~src/events/notfifier/reddit_notifier');
const { timer } = require('~src/events/timer/timer');
const logs = require('discord-logs');
const Music = require('~utils/classes/Music');
const YouTubeNotification = require('~utils/classes/Notifications/YouTube/YouTubeNotification');

module.exports.startBot = async (bot) => {
    return new Promise(async (resolve, reject) => {
        try {
            logs(bot);
            await database.init();
            await setActivity(bot, true);
            await Promise.resolve(this.fetchCache(bot));
            //await bot.player.extractors.loadDefault();
            new Music(null, bot, true).generateQueueAfterRestart();

            /**
                ---- Events & Timer ----
            */
            new YouTubeNotification().init(bot);
            twitch_notifier({
                bot,
            });
            reddit_notifier(bot);
            timer(bot);
            checkInfractions(bot);
            checkTemproles(bot);
            /**
                ----END ----
            */

            const botList = await loadCommandList(bot);
            bot.commands = botList.cmd;

            setActivity(bot);
            if (process.env.NODE_ENV === 'production') {
                await createSlashCommands(bot);
            }

            console.info(
                `****Ready! Logged in as ${bot.user.username}! I'm on ${bot.guilds.cache.size} Server(s)****`
            );

            return resolve(true);
        } catch (err) {
            return reject(err);
        }
    });
};

module.exports.fetchCache = async (bot) => {
    return new Promise(async (resolve, reject) => {
        try {
            console.info(`Starting to fetch ${bot.guilds.cache.size} guilds...`);
            console.time(`Fetching guilds in:`);
            const guilds = await bot.guilds.fetch();
            console.timeEnd('Fetching guilds in:');

            console.time('Checking data in database:');
            await this.checkGuildsInDatabase(guilds);

            console.timeEnd('Checking data in database:');

            console.time('Fetching users in:');
            await Promise.resolve(this.fetchUsers(bot, guilds));
            console.timeEnd('Fetching users in:');

            return resolve(true);
        } catch (err) {
            return reject(err);
        }
    });
};

module.exports.fetchUsers = async (bot, guilds) => {
    return new Promise(async (resolve, reject) => {
        let i = 0;
        let length = guilds.size;

        await guilds.map(async (guild) => {
            await bot.guilds.cache
                .get(guild.id)
                .members.fetch()
                .then(() => {
                    console.info(`Members from ${guild.name}(${guild.id}) successfully fetched`);
                    i = i + 1;
                });
            if (i === length) {
                return resolve(true);
            }
        });
    });
};

module.exports.checkGuildsInDatabase = async (guilds) => {
    return new Promise(async (resolve) => {
        await guilds.map(async (guild) => {
            new Guilds().create(guild.id).catch(() => {});
        });
        resolve(true);
    });
};
