const { MemberInfo } = require('../data/MemberInfo');

module.exports.saveAllRoles = async (roles, member, guild) => {
    const guild_id = typeof guild === 'string' ? guild : guild.id;
    const user_id = typeof member === 'string' ? member : member.id;

    const memberInfo = await MemberInfo.get({ guild_id, user_id });
    if (!memberInfo) {
        return await MemberInfo.add({
            guild_id,
            user_id,
            member_roles: roles,
            user_joined: new Date(member.joinedAt),
        });
    } else {
        return await MemberInfo.update({
            guild_id,
            user_id,
            member_roles: roles,
        });
    }
};
