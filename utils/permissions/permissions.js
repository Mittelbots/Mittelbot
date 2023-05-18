module.exports.hasPermissionsFor = (dcchannel, me, permissions) => {
    return dcchannel.permissionsFor(me).has(permissions);
};
