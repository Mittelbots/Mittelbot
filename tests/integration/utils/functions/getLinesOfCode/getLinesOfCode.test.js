const { getLinesOfCode } = require('~utils/functions/getLinesOfCode/getLinesOfCode');

describe('The code base will be scanned for lines of code', () => {
    it('should return the number of lines of code', async () => {
        const loc = await getLinesOfCode();
        expect(typeof loc).toBe('number');
    }, 20000);
});
