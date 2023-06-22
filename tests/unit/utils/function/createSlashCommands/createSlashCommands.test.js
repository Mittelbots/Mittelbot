const { createSlashCommands } = require('~utils/functions/createSlashCommands/createSlashCommands');

describe('Slashcommands can be generated on the developer guild', () => {
    it('should be able to generate slashcommands', async () => {
        expect.assertions(1);
        await createSlashCommands({})
            .then((result) => {
                expect(result).toBe(true);
            })
            .catch((error) => {
                throw error;
            });
    }, 20000);
});
