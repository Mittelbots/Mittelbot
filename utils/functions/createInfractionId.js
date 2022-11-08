<<<<<<< HEAD
const { Infractions } = require('./data/Infractions');
=======
const { getInfractionById } = require("./data/infractions");
>>>>>>> 3f3ba2cc101956b6e3b46b465fe39e90b376562f

function generate() {
    return Math.random().toString(30).substr(2, 50)
}

<<<<<<< HEAD
module.exports.createInfractionId = async (guild_id) => {
    const infractionid = generate();
    const open_infractions = await Infractions.get({
        inf_id: infractionid,
        guild_id,
    });

    return open_infractions.length > 0 ? this.createInfractionId(guild_id) : infractionid;
};
=======
module.exports.createInfractionId = async () => {

    let infractionid = generate();

    let open_infractions = await getInfractionById({
        inf_id: infractionid
    });

    if(open_infractions) return this.createInfractionId();
    
    return infractionid;
}
>>>>>>> 3f3ba2cc101956b6e3b46b465fe39e90b376562f
