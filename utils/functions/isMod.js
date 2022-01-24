async function isMod(member, message, database) {
    return database.query(`SELECT * FROM ${message.guild.id}_guild_modroles`).then(async (res) => {
        var isMod = false
        for (let i in await res) {
            if(member.roles.cache.find(r => r.id === res[i].role_id) !== undefined) {
                isMod = true;
                break;
            }
        }
        return isMod;
    }).catch(err => console.log(err))
}

module.exports = {isMod}