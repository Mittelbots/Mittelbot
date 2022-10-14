const { getAllGuildConfig } = require('../data/getConfig');
const {
    addToCache,
    global,
    applyforms,
    autoMod,
    scamList,
    guildConfig,
    openInfractions,
    closedInfractions,
    temproles,
    ytUploads,
    twitchStreams,
    globalConfig,
    publicScamList,
    guildLevel,
    memberInfo,
} = require('./cache');
const { getAllXP } = require('../levelsystem/levelsystemAPI');
const { getAllMemberInfo } = require('../data/getMemberInfo');
const { getAllForms } = require('../data/apply_form');
const { getAllAutoMod } = require('../data/automod');
const { getScamList } = require('../data/scam');
const { getAllOpenInfractions, getAllClosedInfractions } = require('../data/infractions');
const { getAllTemproles } = require('../data/temproles');
const { getAllYoutubeUploads, getAllTwitchStreams } = require('../data/upload');
const { getGlobalConfig } = require('../data/ignoreMode');
const { errorhandler } = require('../errorhandler/errorhandler');
const axios = require('axios');

module.exports.startUpCache = async () => {
    console.info('----------------------------------------');
    console.info('🚀 Starting up cache...');

    console.info('🕐 Getting all Data...');

    try {
        var guildXp = await getAllXP();
        var guildMemberInfo = await getAllMemberInfo();
        var guildApplyForms = await getAllForms();
        var guildAutoMod = await getAllAutoMod();
        var scamListData = await getScamList();
        var guildConfig = await getAllGuildConfig();
        var openInfractions = await getAllOpenInfractions();
        var closedInfractions = await getAllClosedInfractions();
        var allTemproles = await getAllTemproles();
        var ytUploads = await getAllYoutubeUploads();
        var twitchStreams = await getAllTwitchStreams();
        var globalConfig = await getGlobalConfig();
    } catch (e) {
        errorhandler({
            err: e,
            message: 'Something went wrong while getting all data for cache.',
        });
    }

    console.info('✅ Data collected...');

    console.info('🕐 Adding to cache...');

    try {
        for (let i in guildXp) {
            if (!guildXp[i]) continue;
            await addToCache({
                value: {
                    name: 'guildLevel',
                    data: {
                        id: guildXp[i].guild_id,
                        levels: guildXp[i].levels,
                    },
                },
            });
        }

        for (let i in guildMemberInfo) {
            if (!guildMemberInfo[i]) continue;
            await addToCache({
                value: {
                    name: 'memberInfo',
                    data: {
                        id: guildMemberInfo[i].guild_id,
                        memberInfo: guildMemberInfo[i].member_info
                            ? guildMemberInfo[i].member_info
                            : '',
                    },
                },
            });
        }

        for (let i in guildApplyForms) {
            if (!guildApplyForms[i]) continue;
            await addToCache({
                value: {
                    name: 'applyforms',
                    id: guildApplyForms[i].forms[0].guild_id,
                    data: {
                        forms: guildApplyForms[i].forms || [],
                    },
                },
            });
        }

        for (let i in guildAutoMod) {
            if (!guildAutoMod[i]) continue;
            await addToCache({
                value: {
                    name: 'autoMod',
                    id: guildAutoMod[i].guild_id,
                    data: {
                        settings: guildAutoMod[i].setting || [],
                    },
                },
            });
        }

        await addToCache({
            value: {
                name: 'scamList',
                id: 0,
                data: {
                    scamList: scamListData || [],
                },
            },
        });

        for (let i in guildConfig) {
            if (!guildConfig[i]) continue;
            await addToCache({
                value: {
                    name: 'guildConfig',
                    id: guildConfig[i].guild_id,
                    data: {
                        settings: guildConfig[i] || [],
                    },
                },
            });
        }

        await addToCache({
            value: {
                name: 'openInfractions',
                id: 0,
                data: {
                    list: openInfractions || [],
                },
            },
        });

        await addToCache({
            value: {
                name: 'closedInfractions',
                id: 0,
                data: {
                    list: closedInfractions || [],
                },
            },
        });

        await addToCache({
            value: {
                name: 'temproles',
                id: 0,
                data: {
                    list: allTemproles,
                },
            },
        });

        await addToCache({
            value: {
                name: 'ytUploads',
                id: 0,
                data: {
                    list: ytUploads || [],
                },
            },
        });

        await addToCache({
            value: {
                name: 'twitchStreams',
                id: 0,
                data: {
                    list: twitchStreams || [],
                },
            },
        });

        await addToCache({
            value: {
                name: 'globalConfig',
                id: 0,
                data: globalConfig || [],
            },
        });

        axios
            .get('https://discord-phishing-backend.herokuapp.com/all')
            .then(async (res) => {
                await addToCache({
                    value: {
                        name: 'publicScamList',
                        id: 0,
                        data: {
                            scamList: (await res.data) || [],
                        },
                    },
                });
            })
            .catch((err) => {
                errorhandler({
                    err,
                    fatal: true,
                });
            });
    } catch (e) {
        errorhandler({
            err: e,
            message: 'Something went wrong while fetching cache!',
        });
    }

    console.info('✅ Cache init completed...');
    console.info('----------------------------------------');
};

module.exports.resetCache = async () => {
    return new Promise(async (resolve, reject) => {
        console.info('🔄 Cache reset starting...');
        console.info('----------------------------------------');

        try {
            global.length = 0;
            applyforms.length = 0;
            autoMod.length = 0;
            scamList.length = 0;
            guildConfig.length = 0;
            openInfractions.length = 0;
            closedInfractions.length = 0;
            temproles.length = 0;
            ytUploads.length = 0;
            twitchStreams.length = 0;
            globalConfig.length = 0;
            publicScamList.length = 0;
            guildLevel.length = 0;
            memberInfo.length = 0;
        } catch (err) {
            reject(`Something went wrong while resetting the cache: \`${err}\``);
            errorhandler({
                err,
            });
        }

        console.info('🔄 Cache reset finished...');
        console.info('----------------------------------------');
        resolve('✅ Cache reset completed...');
    });
};
