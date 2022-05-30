module.exports.modroles = [];
module.exports.joinroles = [];
module.exports.config = [];
module.exports.logs = [];
module.exports.xp = [];
module.exports.memberInfo = [];
module.exports.global = [];
module.exports.warnroles = [];

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

module.exports.addValueToCache = async ({cacheName, param_id, value, valueName}) => {
    if(!cacheName || !param_id || !value || !valueName) return false;

    for(let i in this[cacheName]) {
        if(this[cacheName][i].id === param_id) {
            const length = this[cacheName][i][valueName].length;
            const obj = {
                id: this[cacheName][i][valueName][length - 1].id + 1,
                role_id: value,
            }
            this[cacheName][i][valueName].push(obj);
        }
    }
}

module.exports.getFromCache = async ({cacheName, param_id}) => {
    if(!cacheName || !param_id) return false;
    let response = [];
    for (let i in this[cacheName]) {
        try {
            if(cacheName[i].id === param_id) {
                response.push(cacheName[i])
            }
        }catch(e){}
    }

    if(response.length === 0) {
        try {
            this[cacheName].map(res => {
                if(res.id === param_id) {
                    response.push(res);
                }
            })
        }catch(err) {}
    }

    return (response.length > 0) ? response : false;
}

/**
 * 
 * @param {String} cacheName - Name of the cache 
 * @param {String} param_id - Value to get the right cacheValue
 * @param {String} updateVal - new Value to update the cache
 * @returns {}
 */
module.exports.updateCache = async ({cacheName, param_id, updateVal = undefined, updateValName}) => {
    if(!cacheName || !param_id || updateVal === undefined) return false;
    
        for(let i in this[cacheName]) {
            if(this[cacheName][i].id === param_id || this[cacheName][i].role_id === param_id) {

                if(typeof updateVal === 'object') {
                    for (const [index, [key, value]] of Object.entries(Object.entries(updateVal))) {
                        if(key === updateValName) {
                            this[cacheName][i][key] = updateVal;
                        }
                    }
                }else {
                    this[cacheName][i][updateValName] = updateVal;
                }

            }
        }
}

module.exports.deleteFromCache = async ({cacheName, param_id, cachValueName}) => {
    if(!cacheName || !param_id) return false;

    for(let i in this[cacheName]) {
        if(this[cacheName][i].id === param_id) {
            console.log(this[cacheName][i])
            delete this[cacheName][i].id;
            this[cacheName][i].filter(Boolean);
            return;
        }
    }
}