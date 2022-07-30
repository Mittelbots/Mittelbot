const database = require("../../../src/db/db")
const { errorhandler } = require("../errorhandler/errorhandler")

module.exports.getAllYoutubeUploads = async () => {
    return await database.query('SELECT * FROM guild_uploads')
        .catch(err => {
            errorhandler({err, fatal: true})
            return false;
        })
}

module.exports.getAllTwitchStreams = async () => {
    return await database.query('SELECT * FROM twitch_streams')
        .catch(err => {
            errorhandler({err, fatal: true})
            return false;
        })
}