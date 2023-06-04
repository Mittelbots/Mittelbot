const discordTranscripts = require('discord-html-transcripts');

module.exports = class TicketTransscript {
    constructor() {}

    generateTranscript(channel) {
        return new Promise(async (resolve, reject) => {
            try {
                const attachments = await discordTranscripts.createTranscript(channel, {
                    limit: -1,
                });
                resolve(attachments);
            } catch (e) {
                reject(e.message);
            }
        });
    }
};
