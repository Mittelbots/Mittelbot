const { BaseMocks } = require('@lambocreeper/mock-discord.js');
const { generateSession, getSession } = require('~src/assets/js/sessionID');

describe('A session will be created from a user and a guild', () => {
    it('Should return a valid session object', () => {
        const user = BaseMocks.getUser();
        const guild = BaseMocks.getGuild();

        generateSession(user, guild);
        const session = getSession();

        expect(session).not.toBeNull();

        expect(session.sessionId).not.toBeNull();
        expect(typeof session.user).toBe('object');
        expect(typeof session.guild).toBe('object');
    });
});
