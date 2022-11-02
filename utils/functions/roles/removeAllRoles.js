/**
 * 
 * @param {messag.member} member 
 */

async function removeAllRoles(member) {
    await member.roles.cache.forEach(role => {
        if(role.name != '@everyone' && role.name != 'Muted'){
            member.roles.remove(role).catch(err => {/** NO PERMISSIONS */})
        }
    })
    return;
}


module.exports = {removeAllRoles}