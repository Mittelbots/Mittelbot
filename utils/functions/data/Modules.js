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

    getDefault(name) {
        return new Promise(async (resolve) => {
            for (let i in defaultModuleSettings) {
                if (defaultModuleSettings[i].name == name) {
                    return resolve(defaultModuleSettings[i]);
                }
            }

            return resolve(false);
        });
    }

    checkEnabled(requestedModule) {
        return new Promise(async (resolve) => {
            const defaultModule = await this.getDefault(requestedModule.name || requestedModule);
            if (!defaultModule) return resolve(true);

            const isAutoDisabled = defaultModule.autoDisable;
            const isDisabled = await this.get().catch(() => {});

            if (isAutoDisabled && !isDisabled.enabled.includes(defaultModule.name))
                return resolve(false);

            if (isDisabled.disabled.includes(defaultModule.name)) return resolve(false);

            return resolve(true);
        });
    }

    manageDisable(requestedModule, disable = false) {
        return new Promise(async (resolve) => {
            const config = await GuildConfig.get(this.guild_id).catch(() => {});
            if (!config) return resolve(false);

            const modules = config.modules;

            if (disable) {
                if (modules.enabled.includes(requestedModule))
                    modules.enabled.splice(modules.enabled.indexOf(requestedModule), 1);

                if (!modules.disabled.includes(requestedModule))
                    modules.disabled.push(requestedModule);
            } else {
                if (modules.disabled.includes(requestedModule))
                    modules.disabled.splice(modules.disabled.indexOf(requestedModule), 1);

                if (!modules.enabled.includes(requestedModule))
                    modules.enabled.push(requestedModule);
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
