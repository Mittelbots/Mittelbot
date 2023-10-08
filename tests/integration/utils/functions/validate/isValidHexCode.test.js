const { isValidHexCode } = require('~utils/functions/validate/isValidHexCode');

describe('It will validate a hex code', () => {
    it('should return true if the hex code is valid', () => {
        const hexCode = '#123456';

        expect(isValidHexCode(hexCode)).toBe(true);
    });

    it('should return false if the hex code is not valid', () => {
        const hexCode = '1212121';

        expect(isValidHexCode(hexCode)).toBe(false);
    });

    it('should return false if the hex code is not valid', () => {
        const hexCode = '#XYZ123';

        expect(isValidHexCode(hexCode)).toBe(false);
    });
});
