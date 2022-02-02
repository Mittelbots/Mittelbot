/**
 * 
 * @param {messag.member} member 
 */

async function removeAllRoles(member) {
    await member.roles.cache.forEach(role => {
        if(role.name != '@everyone' && role.name != 'Muted'){
            try {
                member.roles.remove(role)
            }catch(err) {
                // NO PERMISSIONS
                console.log(err);
            }
        }
    })
    return;
}


module.exports = {removeAllRoles}