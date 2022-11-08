const { MemberInfo } = require('../data/MemberInfo');

module.exports.saveAllRoles = async (roles, member, guild) => {
    const memberInfo = await MemberInfo.get({ guild_id: guild.id, user_id: member.id });

    if (!memberInfo) {
        return await MemberInfo.add({
            guild_id: guild.id,
            user_id: member.id,
            member_roles: roles,
            user_joined: new Intl.DateTimeFormat('de-DE').format(member.joinedAt),
        });
    } else {
        return await MemberInfo.update({
            guild_id: guild.id,
            user_id: member.id,
            member_roles: roles,
        });
    }
};
