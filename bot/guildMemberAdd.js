const {
    giveAllRoles
} = require("../utils/functions/roles/giveAllRoles");
const {
    errorhandler
} = require('../utils/functions/errorhandler/errorhandler');
const database = require('../src/db/db');
const { getJoinroles } = require('../utils/functions/data/joinroles');
const { insertMemberInfo, getMemberInfoById, updateMemberInfoById } = require('../utils/functions/data/getMemberInfo');
const { sendWelcomeMessage } = require('../utils/functions/data/welcomechannel');
const { getConfig } = require("../utils/functions/data/getConfig");

async function guildMemberAdd(member, bot) {

    var {disabled_modules} = await getConfig({
        guild_id: member.guild.id,
    });

    disabled_modules = JSON.parse(disabled_modules);

    if(disabled_modules.indexOf('welcomemessage') === -1) {
        sendWelcomeMessage({
            guild_id: member.guild.id,
            bot,
            joined_user: member
        }).catch(err => {
            console.log(err);
        })
    }

    const memberInfo = await getMemberInfoById({
        guild_id: member.guild.id,
        user_id: member.id
    })

    if (memberInfo.error) return;
    else if(!memberInfo) {
        await insertMemberInfo({
            guild_id: member.guild.id,
            user_id: member.id,
            member_roles: [],
            user_joined: new Date()
        })
    }

    if(memberInfo.user_joined == null) {
        await updateMemberInfoById({
            guild_id: member.guild.id,
            user_id: member.id,
            user_joined: new Date(),
            member_roles: memberInfo.member_roles || []
        })
    }


    await database.query(`SELECT * FROM open_infractions WHERE user_id = ? AND guild_id = ? AND mute = ?`, [member.user.id, member.guild.id, 1]).then(async inf => {
        if (await inf.length !== 0) {
            member.roles.add([member.guild.roles.cache.find(r => r.name === 'Muted')]).catch(err => {});
        } else {
            let user_roles = await memberInfo.member_roles;
            if(!user_roles) return;
            
            user_roles = JSON.parse(user_roles);

            //? IF MUTED ROLE IS IN USERS DATASET -> MUTED ROLE WILL BE REMOVED
            const indexOfMuteRole = user_roles.indexOf(member.guild.roles.cache.find(r => r.name === 'Muted').id)
            if (user_roles !== null && indexOfMuteRole !== -1) {
                user_roles = await user_roles.filter(r => r !== member.guild.roles.cache.find(r => r.name === 'Muted').id)
            }
            setTimeout(async () => {
                if(user_roles) await giveAllRoles(member.id, member.guild, user_roles);
            }, 2000);
        }
    }).catch(err => {
        return errorhandler({err, fatal: true})
    });

    if(!member.user.bot) {
        const joinroles = await getJoinroles({
            guild_id: member.guild.id
        });

        if(!joinroles) return;

        joinroles.map(role => {
            let j_role = member.guild.roles.cache.find(r => r.id === role.role_id);
            //setTimeout(function () {
            try {
                member.roles.add(j_role).catch(err => {})
            } catch (err) {
                //NO PERMISSONS
                return  
            }
        })
    }
}

module.exports = {
    guildMemberAdd
}