const { isValidLink } = require('~utils/functions/validate/isValidLink');

describe('It will validate a link', () => {
    it('should return true if the link is valid', () => {
        const link = 'https://google.com';

        expect(isValidLink(link)).toBe(true);
    });

    it('should return false if the link is not valid', () => {
        const link = 'https://google';

        expect(isValidLink(link)).toBe(false);
    });
});
