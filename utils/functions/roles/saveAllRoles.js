<<<<<<< HEAD
const { MemberInfo } = require('../data/MemberInfo');

module.exports.saveAllRoles = async (roles, member, guild) => {
    const memberInfo = await MemberInfo.get({ guild_id: guild.id, user_id: member.id });

    if (!memberInfo) {
        return await MemberInfo.add({
=======
const { getMemberInfoById, insertMemberInfo, updateMemberInfoById } = require('../data/getMemberInfo');

module.exports.saveAllRoles = async (roles, member, guild) => {

    const memberInfo = await getMemberInfoById({guild_id: guild.id, user_id: member.id});

    if(!memberInfo) {
        return await insertMemberInfo({
>>>>>>> 3f3ba2cc101956b6e3b46b465fe39e90b376562f
            guild_id: guild.id,
            user_id: member.id,
            member_roles: roles,
            user_joined: new Intl.DateTimeFormat('de-DE').format(member.joinedAt)
        });
<<<<<<< HEAD
    } else {
        return await MemberInfo.update({
=======
    }else {
        return await updateMemberInfoById({
>>>>>>> 3f3ba2cc101956b6e3b46b465fe39e90b376562f
            guild_id: guild.id,
            user_id: member.id,
            member_roles: roles
        })
    }
}