const {
    isValidDiscordAttachmentsLink,
} = require('~utils/functions/validate/isValidDiscordAttachmentsLink');

describe('It will validate a Discord attachments link', () => {
    it('should return true if the link is valid', () => {
        const link =
            'https://cdn.discordapp.com/attachments/123456789012345678/123456789012345678/123456789012345678.png';

        expect(isValidDiscordAttachmentsLink(link)).toBe(true);
    });

    it('should return false if the link is not valid', () => {
        const link =
            'https://discord.com/attachments/123456789012345678/123456789012345678/123456789012345678.png';

        expect(isValidDiscordAttachmentsLink(link)).toBe(false);
    });
});
