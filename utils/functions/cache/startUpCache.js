const { getAllConfig } = require("../getData/getConfig");
const { getAllModroles } = require("../getData/getModroles");
const { getAllJoinroles } = require("../getData/getJoinroles");
const { addToCache } = require("./cache");

module.exports.startUpCache = async () => {

    console.log('----------------------------------------');
    console.log('🚀Starting up cache...');


    console.log('🕐Getting all Data...');

    const guildConfigs = await getAllConfig();
    const guildModroles = await getAllModroles();
    const guildJoinroles = await getAllJoinroles();

    console.log('✅ Data collected...');

    console.log('🕐Adding to cache...');

    for(let i in guildConfigs) {
        if(!guildConfigs[i] || !guildConfigs[i][0].guild_id) continue;
        await addToCache({
            value: {
                name: "config",
                data: {
                    id: guildConfigs[i][0].guild_id,
                    prefix: guildConfigs[i][0].prefix,
                    welcome_channel: guildConfigs[i][0].welcome_channel,
                    cooldown: guildConfigs[i][0].cooldown,
                    deleteModCommandAfterUsage: guildConfigs[i][0].deleteModCommandAfterUsage,
                    deleeteCommandAfterUsage: guildConfigs[i][0].deleeteCommandAfterUsage,
                    levelsettings: guildConfigs[i][0].levelsettings,
                    translate_channel: guildConfigs[i][0].translate_channel,
                    translate_language: guildConfigs[i][0].translate_language,
                }
            }
        });
    }

    for(let i in guildModroles) {
        if(!guildModroles[i] || !guildModroles[i].modroles) continue;

        const isObject = typeof guildModroles[i].modroles === 'object';
        await addToCache({
            value: {
                name: "modroles",
                data: {
                    id: guildModroles[i].guild_id,
                    role_id: (isObject) ? guildModroles[i].modroles[0].role_id : '',
                    isadmin: (isObject) ? guildModroles[i].modroles[0].isadmin : '0',
                    ismod: (isObject) ? guildModroles[i].modroles[0].ismod : '0',
                    ishelper: (isObject) ? guildModroles[i].modroles[0].ishelper : '0',
                }
            }
        });
    }

    for(let i in guildJoinroles) {
        if(!guildJoinroles[i]) continue;
        await addToCache({
            value: {
                name: "joinroles",
                data: {
                    id: guildJoinroles[i].guild_id,
                    role_id: (typeof guildJoinroles[i].joinroles === "object") ? guildJoinroles[i].joinroles[0].role_id : '',
                }
            }
        });
    }
    console.log('✅ Everything is in cache...');
    console.log('----------------------------------------');
}