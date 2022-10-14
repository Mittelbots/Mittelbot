const { spawn } = require('child_process');
const { checkInfractions } = require('../../src/events/checkInfraction');
const { checkTemproles } = require('../../src/events/checkTemproles');
const { twitch_notifier } = require('../../src/events/notfifier/twitch_notifier');
const { handleUploads } = require('../../src/events/notfifier/yt_notifier');
const { auditLog } = require('../../utils/auditlog/auditlog');
const { startUpCache } = require('../../utils/functions/cache/startUpCache');
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
const { insertIntoAllGuildId } = require('../../utils/functions/data/all_guild_id');
const { insertGuildIntoGuildConfig } = require('../../utils/functions/data/getConfig');
const { insertIntoGuildAutomod } = require('../../utils/functions/data/automod');
const { rateLimit } = require('../rateLimit');

module.exports.restartBot = async () => {
    await delay(5000);

    spawn(process.argv[1], process.argv.slice(2), {
        detached: true,
        stdio: ['ignore', null, null],
    }).unref();
    process.exit();
};

module.exports.stopBot = async () => {
    errorhandler({
        message: 'Bot stopped due function call',
        fatal: false,
    });
    process.exit();
};

module.exports.startBot = async (bot) => {
    return new Promise(async (resolve, reject) => {
        try {
            await setActivity(bot, true);

            await deployCommands(bot);

            await createSlashCommands();

            await startUpCache();

            await Promise.resolve(this.fetchCache(bot));

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
                message: '------------BOT SUCCESSFULLY STARTED------------' + new Date(),
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
};

module.exports.fetchCache = async (bot) => {
    return new Promise(async (resolve, reject) => {
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
    guilds.map(async (guild) => {
        await database
            .query(
                `SELECT * FROM all_guild_id WHERE guild_id = ?; SELECT id FROM guild_config WHERE guild_id = ?; SELECT id FROM guild_automod WHERE guild_id = ?`,
                [guild.id, guild.id, guild.id]
            )
            .then(async (res) => {
                if (res[0].length === 0) {
                    await insertIntoAllGuildId(guild.id)
                        .then(() => {
                            console.log(`Inserted ${guild.id} into all_guild_id.`);
                        })
                        .catch(() => {
                            console.log(`Failed to insert ${guild.id} into all_guild_id`);
                        });
                }
                if (res[1].length === 0) {
                    await insertGuildIntoGuildConfig(guild.id)
                        .then(() => {
                            console.log(`Inserted ${guild.id} into guild_config.`);
                        })
                        .catch(() => {
                            console.log(`Failed to insert ${guild.id} into guild_config`);
                        });
                }
                if (res[2].length === 0) {
                    await insertIntoGuildAutomod(guild.id)
                        .then(() => {
                            console.log(`Inserted ${guild.id} into guild_config.`);
                        })
                        .catch(() => {
                            console.log(`Failed to insert ${guild.id} into guild_config`);
                        });
                }
            })
            .catch((err) => {
                errorhandler({
                    err,
                });
            });
    });
};
