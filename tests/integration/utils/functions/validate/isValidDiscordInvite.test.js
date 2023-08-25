const { isValidDiscordInvite } = require('~utils/functions/validate/isValidDiscordInvite');

describe('It will validate a Discord invite link', () => {
    it('should return true if the link is valid', () => {
        const link = 'https://discord.gg/AADDDDBBBB';

        expect(isValidDiscordInvite(link)).toBe(true);
    });

    it('should return false if the link is not valid', () => {
        const link = 'https://discord.com/invite/AADDDDBBBB';

        expect(isValidDiscordInvite(link)).toBe(false);
    });
});
