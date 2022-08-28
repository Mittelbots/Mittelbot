module.exports.modroles = [];
module.exports.joinroles = [];
module.exports.xp = [];
module.exports.memberInfo = [];
module.exports.global = [];
module.exports.applyforms = [];
module.exports.autoMod = [];
module.exports.scamList = [];
module.exports.guildConfig = [];
module.exports.openInfractions = [];
module.exports.closedInfractions = [];
module.exports.temproles = [];
module.exports.ytUploads = [];
module.exports.twitchStreams = [];
module.exports.globalConfig = [];
module.exports.publicScamList = [];

/**
 * 
 * @param {Object} values - Object containing the values to be inserted
 * @returns {Boolean}
 */
module.exports.addToCache = async ({
    value
}) => {
    if (!value) return false;

    const obj = {
        name: value.name.toString(),
        id: value.id,
        role_id: value.role_id || null,
        ...value.data
    };
    this[value.name].push(obj);
}

module.exports.addValueToCache = async ({
    cacheName,
    param_id,
    value,
    valueName
}) => {
    if (!cacheName || !param_id || !value || !valueName) return false;

    for (let i in this[cacheName]) {

        if (this[cacheName][i].id === param_id) {
            const length = this[cacheName][i][valueName].length;
            var obj = {
                id: (length > 0) ? this[cacheName][i][valueName][length - 1].id + 1 : 1
            };
            if(cacheName === 'xp') {
                obj.xp = value;
            }else {
                obj.role_id = value;
            }
            this[cacheName][i][valueName].push(obj);
            return;
        }
    }
}

module.exports.getFromCache = async ({
    cacheName,
    param_id
}) => {
    if (!cacheName || !param_id) return false;
    let response = [];
    for (let i in this[cacheName]) {
        try {
            if (this[cacheName][i].id === param_id) {
                response.push(this[cacheName][i])
            }
        } catch (e) {}
    }

    if (response.length === 0) {
        try {
            this[cacheName].map(res => {
                if (res.id === param_id) {
                    response.push(res);
                }
            })
        } catch (err) {}
    }

    return (response.length > 0) ? response : false;
}

/**
 * 
 * @param {String} cacheName - Name of the cache 
 * @param {Array} param_id - [0] = guild_id, [1] = role_id
 * @param {String} updateVal - new Value to update the cache
 * @returns {}
 */
module.exports.updateCache = async ({
    cacheName,
    param_id,
    updateVal = undefined,
    updateValName
}) => {
    if (!cacheName || !param_id) return false;

    for (let i in this[cacheName]) {
        if (this[cacheName][i].id === param_id[0]) { // If both id's match

            if (typeof updateVal === 'object' && updateVal !== undefined) {
                for (const [index, [key, value]] of Object.entries(Object.entries(updateVal))) {
                    if (key === updateValName) {
                        this[cacheName][i][key] = updateVal;
                    }
                    if(value === updateVal.role_id) { // hardcode for modroles
                        this[cacheName][i] = updateVal;
                    }

                }
            } else { // updateval is a string or undefined
                if (updateVal === undefined) { // updateval is undefined
                    if(updateValName === 'roles' || updateValName === 'role_id') { // hardcode for warnroles
                        for(let r in this[cacheName][i][updateValName]) {
                            if(this[cacheName][i][updateValName][r].role_id === param_id[1]) {
                                delete this[cacheName][i][updateValName][r];
                            }
                        }
                        this[cacheName][i][updateValName] = this[cacheName][i][updateValName].filter(Boolean);
                    }

                } else { // updateval is a string
                    if(typeof this[cacheName][i][updateValName] === 'array') {
                        this[cacheName][i][updateValName].push(updateVal);
                    }
                    else if(cacheName === 'xp') {
                        this[cacheName][i][updateValName].find(x => x.user_id === param_id[1]).xp = updateVal;
                    }else {
                        this[cacheName][i][updateValName] = updateVal;
                    }
                }
            }

        }
    }
}

module.exports.deleteFromCache = async ({
    cacheName,
    param_id,
    cachValueName
}) => {
    if (!cacheName || !param_id) return false;

    for (let i in this[cacheName]) {
        if (this[cacheName][i].id === param_id) {
            delete this[cacheName][i].id;
            this[cacheName][i].filter(Boolean);
            return;
        }
    }
}