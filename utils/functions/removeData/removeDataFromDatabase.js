const database = require('../../../src/db/db');
const { getAllOpenInfractions } = require('../data/infractions');
const { errorhandler } = require('../errorhandler/errorhandler');

module.exports.removeDataFromOpenInfractions = async (inf_id) => {
    await database
        .query(`DELETE FROM open_infractions WHERE infraction_id = ?`, [inf_id])
        .then(async () => {
            var infraction;
            if (openInfractions) {
                infraction = openInfractions[0].list;
            } else {
                infraction = await getAllOpenInfractions();
            }

            const filteredInfraction = infraction.filter((inf) => inf.infraction_id !== inf_id);

            openInfractions = filteredInfraction;
        })
        .catch((err) => {
            errorhandler({ err });
        });
};
