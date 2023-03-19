const defaultModuleSettings = require('../../../src/assets/json/modules/modules.json');
const { GuildConfig } = require('./Config');

module.exports = class Modules {
    constructor(guild_id, bot) {
        this.guild_id = guild_id;
        this.bot = bot;
    }

    getDefaultSettings() {
        return defaultModuleSettings;
    }

    get() {
        return new Promise(async (resolve) => {
            const config = await GuildConfig.get(this.guild_id).catch(() => {});
            if (!config) return resolve(false);

            return resolve(config.modules);
        });
    }

    checkEnabled(requestedModule) {
        return new Promise(async (resolve) => {
            let isAutoDisabled = false;
            try {
                isAutoDisabled = this.getDefaultSettings()[requestedModule].autoDisable;
            } catch (e) {}
            const isDisabled = await this.get().catch(() => {});

            if (isAutoDisabled) return resolve(false);
            if (isDisabled.disabled.includes(requestedModule)) return resolve(false);

            return resolve(true);
        });
    }

    manageDisable(requestedModule, disable = false) {
        return new Promise(async (resolve) => {
            const config = await GuildConfig.get(this.guild_id).catch(() => {});
            if (!config) return resolve(false);

            const modules = config.modules;

            if (disable) {
                if (!modules.disabled.includes(requestedModule))
                    modules.disabled.push(requestedModule);
            } else {
                if (modules.disabled.includes(requestedModule))
                    modules.disabled.splice(modules.disabled.indexOf(requestedModule), 1);
            }

            await GuildConfig.update({
                guild_id: this.guild_id,
                value: modules,
                valueName: 'modules',
            }).catch(() => {});

            return resolve(true);
        });
    }
};
