const { getMemberInfoById, insertMemberInfo, updateMemberInfoById } = require('../data/getMemberInfo');

module.exports.saveAllRoles = async (roles, member, guild) => {

    const memberInfo = await getMemberInfoById({guild_id: guild.id, user_id: member.id});

    if(!memberInfo) {
        return await insertMemberInfo({
            guild_id: guild.id,
            user_id: member.id,
            member_roles: roles,
            user_joined: new Intl.DateTimeFormat('de-DE').format(member.joinedAt)
        });
    }else {
        return await updateMemberInfoById({
            guild_id: guild.id,
            user_id: member.id,
            member_roles: roles
        })
    }
}