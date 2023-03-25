const { GuildConfig } = require('../../../utils/functions/data/Config');
const guilds = require('../Models/tables/guilds.model');

(async () => {
    const allGuilds = await guilds.findAll();

    for (let i in allGuilds) {
        const config = await GuildConfig.get(allGuilds[i].guild_id);

        if (
            !config.modules ||
            !config.modules.enabled ||
            !config.modules.disabled ||
            config.modules == '{}'
        ) {
            const newModules = {
                enabled: [],
                disabled: [],
            };

            await GuildConfig.update({
                guild_id: allGuilds[i].guild_id,
                value: newModules,
                valueName: 'modules',
            });

            console.log(`Updated guild ${allGuilds[i].guild_id} modules`);
        }

        if (config.tickets == null) {
            await GuildConfig.update({
                guild_id: allGuilds[i].guild_id,
                value: [],
                valueName: 'tickets',
            });

            console.log(`Updated guild ${allGuilds[i].guild_id} tickets`);
        }
    }
})();
