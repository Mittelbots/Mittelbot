/**
 * 
 * @param {user} user
 */

module.exports.getAllRoles = (user) => {
    let r = [];
    user.roles.cache.map(role => (role.name !== '@everyone') ? r.push(role.id) : '')
    return r;
}