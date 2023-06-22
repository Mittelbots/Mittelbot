const { createSlashCommands } = require('~utils/functions/createSlashCommands/createSlashCommands');

describe('Slashcommands can be generated on the developer guild', () => {
    it('should be able to generate slashcommands', async () => {
        expect(async () => {
            await createSlashCommands({});
        }).not.toThrow();
    });
});
