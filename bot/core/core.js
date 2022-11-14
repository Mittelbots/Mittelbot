const { spawn } = require('child_process');
const { checkInfractions } = require('../../src/events/checkInfraction');
const { checkTemproles } = require('../../src/events/checkTemproles');
const { twitch_notifier } = require('../../src/events/notfifier/twitch_notifier');
const { handleUploads } = require('../../src/events/notfifier/yt_notifier');
const { auditLog } = require('../../utils/auditlog/auditlog');
const {
    createSlashCommands,
} = require('../../utils/functions/createSlashCommands/createSlashCommands');
const { setActivity } = require('../../utils/functions/data/activity');
const { handleAddedReactions } = require('../../utils/functions/data/reactionroles');
const { delay } = require('../../utils/functions/delay/delay');
const { errorhandler } = require('../../utils/functions/errorhandler/errorhandler');
const { deployCommands } = require('../../utils/functions/deployCommands/deployCommands');
const { guildCreate } = require('../guildCreate');
const { guildMemberAdd } = require('../guildMemberAdd');
const { guildMemberRemove } = require('../guildMemberRemove');
const { interactionCreate } = require('../interactionCreate');
const { messageCreate } = require('../messageCreate');
const database = require('../../src/db/db');
const { rateLimit } = require('../rateLimit');
const { Guilds } = require('../../utils/functions/data/Guilds');
const { loadScam } = require('../../utils/checkForScam/checkForScam');

module.exports.restartBot = async () => {
    await delay(5000);

    await database.close();
    spawn(process.argv[1], process.argv.slice(2), {
        detached: true,
        stdio: ['ignore', null, null],
    }).unref();
    process.exit();
};

module.exports.stopBot = async () => {
    await database.close();
    errorhandler({
        message: 'Bot stopped due function call',
        fatal: false,
    });
    process.exit();
};

module.exports.startBot = async (bot) => {
    return new Promise(async (resolve, reject) => {
        try {
            await database.init();
            await setActivity(bot, true);
            await deployCommands(bot);
            await createSlashCommands();
            await Promise.resolve(this.fetchCache(bot));
            await loadScam();
            auditLog(bot);
            handleUploads({
                bot,
            });
            twitch_notifier({
                bot,
            });
            checkInfractions(bot);
            checkTemproles(bot);
            setActivity(bot);

            console.info(
                `****Ready! Logged in as ${bot.user.tag}! I'm on ${bot.guilds.cache.size} Server(s)****`
            );
            errorhandler({
                message:
                    'BOT SUCCESSFULLY STARTED' +
                    `${new Date().getDay()}/${new Date().getMonth()}/${new Date().getFullYear()} ${new Date().getHours()}:${new Date().getMinutes()}`,
                fatal: false,
            });

            return resolve(true);
        } catch (err) {
            return reject(err);
        }
    });
};

module.exports.acceptBotInteraction = (bot) => {
    bot.on('guildCreate', async (guild) => {
        guildCreate(guild, bot);
    });

    bot.on('guildMemberAdd', (member) => {
        guildMemberAdd(member, bot);
    });

    bot.on('guildMemberRemove', (member) => {
        guildMemberRemove({
            member,
        });
    });

    bot.on('messageCreate', (message) => {
        messageCreate(message, bot);
    });

    bot.on('messageReactionAdd', (reaction, user) => {
        handleAddedReactions({
            reaction,
            user,
            bot,
        });
    });

    bot.on('messageReactionRemove', (reaction, user) => {
        handleAddedReactions({
            reaction,
            user,
            bot,
            remove: true,
        });
    });

    interactionCreate({
        bot,
    });

    bot.on('rateLimit', (rateLimitData) => {
        rateLimit({ rateLimitData });
    });

    bot.on('debug', (err) => {
        if (err.substr(6, 3) === '429') {
            rateLimit({ rateLimitData: err });
        }
    });
};

module.exports.fetchCache = async (bot) => {
    return new Promise(async (resolve, reject) => {
        try {
            console.time('Fetching guilds in:');
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

        return await guilds.map(async (guild) => {
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
    return new Promise(async (resolve, reject) => {
        await guilds.map(async (guild) => {
            Guilds.create(guild.id).catch((err) => {});
        });
        resolve(true);
    });
};
