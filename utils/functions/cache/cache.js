module.exports.modroles = [];
module.exports.joinroles = [];
module.exports.config = [];
module.exports.logs = [];
module.exports.xp = [];
module.exports.memberInfo = [];
module.exports.global = [];

/**
 * 
 * @param {Object} values - Object containing the values to be inserted
 * @returns {Boolean}
 */
module.exports.addToCache = async ({value}) => {
    if(!value) return false;
    const obj = {
        name: value.name.toString(),
        id: value.id,
        role_id: value.role_id || null,
        ...value.data
    };
    this[value.name].push(obj);
}

module.exports.getFromCache = async ({cacheName, param_id}) => {
    if(!cacheName || !param_id) return false;
    let response = [];
    for (let i in this[cacheName]) {
        if(cacheName[i].id === param_id) {
            response.push(cacheName[i])
        }
    }
    return (response.length > 0) ? response : false;
}

//! TODO: FIX UPDATE CACHE
/**
 * bugs: cache wird geupdated, aber beim nächsten aufrufen von getFromCache wird nur der erste eintrag zurückgegeben
 */
module.exports.updateCache = async ({cacheName, param_id, updateVal}) => {
    if(!cacheName || !param_id || !updateVal) return false;
        for(let i in this[cacheName]) {
            if(this[cacheName][i].id === param_id || this[cacheName][i].role_id === param_id) {
                for (const [index, [key, value]] of Object.entries(Object.entries(updateVal))) {
                    this[cacheName][i][key] = (value) ? JSON.parse('1') : JSON.parse('0');
                }
            }
        }
}

module.exports.deleteFromCache = async ({cacheName, param_id}) => {
    if(!cacheName || !param_id) return false;

    for(let i in this[cacheName]) {
        if(this[cacheName][i].id === param_id) {
            delete this[cacheName][i].id;
            this[cacheName][i].filter(Boolean);
            return;
        }
    }
}