const { BaseMocks } = require('@lambocreeper/mock-discord.js');

describe('The User is the author', () => {
    it('should return false', () => {
        const author = BaseMocks.getUser();
        const target = author;
        const type = 'mute';

        const response = checkTarget(author, target, type);

        expect(response).toBe(false);
    });
});

describe('The Type is mute and the target is a bot', () => {
    it('should return false', () => {
        const author = BaseMocks.getGuildMember().user;
        const target = BaseMocks.getUser();

        target.id = '1234567890';
        target.bot = true;
        const type = 'mute';

        const response = checkTarget(author, target, type);

        expect(response).toBe(false);
    });
});

describe('The Type is warn and the target is a bot', () => {
    it('should return false', () => {
        const author = BaseMocks.getGuildMember().user;
        const target = BaseMocks.getUser();

        target.id = '1234567890';
        target.bot = true;
        const type = 'warn';

        const response = checkTarget(author, target, type);

        expect(response).toBe(false);
    });
});

describe('The Type is mute and the target is a system', () => {
    it('should return false', () => {
        const author = BaseMocks.getGuildMember().user;
        const target = BaseMocks.getUser();

        target.id = '1234567890';
        target.system = true;
        const type = 'mute';

        const response = checkTarget(author, target, type);

        expect(response).toBe(false);
    });
});

describe('The Type is warn and the target is a system', () => {
    it('should return false', () => {
        const author = BaseMocks.getGuildMember().user;
        const target = BaseMocks.getUser();

        target.id = '1234567890';
        target.system = true;
        const type = 'warn';

        const response = checkTarget(author, target, type);

        expect(response).toBe(false);
    });
});

describe('The Type is mute and the target is not a bot nor a system', () => {
    it('should return true', () => {
        const author = BaseMocks.getGuildMember().user;
        const target = BaseMocks.getUser();

        target.id = '1234567890';
        target.bot = false;
        target.system = false;
        const type = 'mute';

        const response = checkTarget(author, target, type);

        expect(response).toBe(true);
    });
});

function checkTarget(author, target, type) {
    if (target.id === author.id) {
        return false;
    }
    if (type === 'mute' || type === 'warn') {
        if (target.bot || target.system) {
            return false;
        }
    }

    return true;
}
