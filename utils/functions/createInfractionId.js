const Infractions = require('~utils/classes/Infractions');

function generate() {
    return Math.random().toString(30).substr(2, 50);
}

module.exports.createInfractionId = async (guild_id) => {
    const infractionid = generate();
    const open_infractions = await new Infractions().get({
        inf_id: infractionid,
        guild_id,
    });

    return open_infractions.length > 0 ? this.createInfractionId(guild_id) : infractionid;
};
