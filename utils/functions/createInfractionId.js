const { getInfractionById } = require('./data/infractions');

function generate() {
    return Math.random().toString(30).substr(2, 50);
}

module.exports.createInfractionId = async () => {
    let infractionid = generate();

    let open_infractions = await getInfractionById({
        inf_id: infractionid,
    });

    if (open_infractions) return this.createInfractionId();

    return infractionid;
};
