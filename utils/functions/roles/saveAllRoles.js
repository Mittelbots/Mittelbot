const MemberInfo = require('~utils/classes/MemberInfo');

module.exports.saveAllRoles = async (roles, member, guild) => {
    let guild_id;
    let user_id;
    try {
        guild_id = typeof guild === 'string' ? guild : guild.id;
        user_id = typeof member === 'string' ? member : member.id;
    } catch (err) {
        return false;
    }

    if (!guild_id || !user_id) return false;

    const memberInfo = await new MemberInfo().get({ guild_id, user_id });
    if (!memberInfo) {
        return await new MemberInfo().add({
            guild_id,
            user_id,
            member_roles: roles,
            user_joined: new Date(member.joinedAt),
        });
    } else {
        return await new MemberInfo().update({
            guild_id,
            user_id,
            member_roles: roles,
        });
    }
};
