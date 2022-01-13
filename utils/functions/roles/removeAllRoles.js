/**
 * 
 * @param {messag.member} member 
 */

async function removeAllRoles(member) {
    setTimeout(async () => {
        await member.roles.cache.forEach(role => {
            if(role.name != '@everyone' && role.name != 'Muted'){
                member.roles.remove(role)
            }
        })
        return;
    }, 700);
}


module.exports = {removeAllRoles}