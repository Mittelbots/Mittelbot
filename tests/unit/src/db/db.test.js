const database = require('~src/db/db');

describe('Database is available', () => {
    it('should not throw any errors and load all models', async () => {
        await database
            .init()
            .then((result) => {
                expect(result).toBe(true);
            })
            .catch((error) => {
                throw error;
            });
    });
});
