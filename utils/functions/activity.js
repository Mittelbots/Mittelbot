const { getLinesOfCode } = require('./getLinesOfCode/getLinesOfCode');
const { ActivityType } = require('discord.js');

const fs = require('fs');

module.exports.setActivity = async (bot, restart = false) => {
    if (restart) {
        return bot.user.setActivity({
            name: 'files to load...',
            type: ActivityType.Watching,
        });
    }

    const settings = fs.readFileSync(
        `src/assets/json/_config/activity_${
            process.env.NODE_ENV === 'production' ? 'prod' : 'dev'
        }.json`,
        'utf8'
    );
    const texts = JSON.parse(settings).texts;
    const activity = texts[Math.floor(Math.random() * texts.length)];
    let newActivity = activity;

    if (activity.indexOf('{guildCount}') !== -1) {
        const guildCount = bot.guilds.cache.size;
        newActivity = newActivity.replaceAll('{guildCount}', guildCount);
    }

    if (activity.indexOf('{memberCount}') !== -1) {
        const memberCount = bot.guilds.cache
            .map((guild) => guild.memberCount)
            .reduce((a, b) => a + b, 0);
        newActivity = newActivity.replaceAll('{memberCount}', memberCount);
    }

    if (activity.indexOf('{loc}') !== -1) {
        const loc = await getLinesOfCode();
        newActivity = newActivity.replaceAll('{loc}', loc);
    }

    if (activity.indexOf('{version}') !== -1) {
        newActivity = newActivity.replaceAll('{version}', require('../../package.json').version);
    }

    bot.user.setActivity({
        name: 'Custom  Status',
        state: newActivity,
        type: ActivityType.Custom,
    });
};
