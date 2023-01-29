const { MemberInfo } = require('../data/MemberInfo');

module.exports.saveAllRoles = async (roles, member, guild) => {
    const guild_id = guild.id || guild;
    const user_id = member.id || member;

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
