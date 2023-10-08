const defaultModuleSettings = require('~assets/json/modules/modules.json');
const GuildConfig = require('./Config');

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
            const config = await new GuildConfig().get(this.guild_id).catch(() => {});
            if (!config) return resolve(false);

            return resolve(config.modules);
        });
    }

    getDefault(name) {
        return new Promise(async (resolve) => {
            for (let i in defaultModuleSettings) {
                if (!defaultModuleSettings[i].name) continue;
                if (defaultModuleSettings[i].name.toLowerCase() === name.toLowerCase()) {
                    return resolve(defaultModuleSettings[i]);
                }
            }

            return resolve(false);
        });
    }

    checkEnabled(requestedModule) {
        return new Promise(async (resolve) => {
            const response = {
                enabled: false,
                name: null,
            };

            const moduleJSON = this.getDefaultSettings();

            const isBypass = moduleJSON.bypassModulesAndCommands.includes(requestedModule);
            if (isBypass) {
                response.enabled = true;
                return resolve(response);
            }
            let defaultModule = await this.getDefault(requestedModule);
            if (!defaultModule) {
                for (let i in moduleJSON) {
                    if (!moduleJSON[i].extraCommands || moduleJSON[i].extraCommands.length === 0)
                        continue;

                    const isAExtraCommand = moduleJSON[i].extraCommands.includes(requestedModule);
                    if (isAExtraCommand) {
                        defaultModule = await this.getDefault(moduleJSON[i].name);
                        break;
                    }
                }
                if (!defaultModule) {
                    response.name = requestedModule.name || requestedModule;
                    return resolve(response);
                }
            }

            const isAutoDisabled = defaultModule.autoDisable;
            const isDisabled = await this.get().catch(() => {});

            if (isAutoDisabled && !isDisabled?.enabled?.includes(defaultModule.name)) {
                response.enabled = false;
                response.name = defaultModule.name;
                return resolve(response);
            }

            if (isDisabled.disabled.includes(defaultModule.name)) {
                response.enabled = false;
                response.name = defaultModule.name;
                return resolve(response);
            }

            response.enabled = true;
            return resolve(response);
        });
    }

    manageDisable(requestedModule, disable = false) {
        return new Promise(async (resolve) => {
            const config = await new GuildConfig().get(this.guild_id).catch(() => {});
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

            await new GuildConfig()
                .update({
                    guild_id: this.guild_id,
                    value: modules,
                    valueName: 'modules',
                })
                .catch(() => {});

            return resolve(true);
        });
    }
};
