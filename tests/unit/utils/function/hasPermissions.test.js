const { BaseMocks } = require('@lambocreeper/mock-discord.js');
const { hasPermission } = require('~utils/functions/hasPermissions');

function getData() {
    const guild = BaseMocks.getGuild();
    const user = BaseMocks.getUser();
    const bot = BaseMocks.getClient();

    return {
        guild,
        user,
        bot,
    };
}

describe('The User has no permissions', () => {
    it('should return false', () => {
        const { guild, user, bot } = getData();

        const adminOnly = false;
        const modOnly = false;

        const roleIsAdmin = false;
        const roleIsMod = false;
        const roleIsHelper = false;

        const hasPermission = checkPerms({
            role_id: user.id,
            roleIsAdmin: roleIsAdmin,
            roleIsMod: roleIsMod,
            roleIsHelper: roleIsHelper,
            user: user,
            isDashboard: false,
            adminOnly: adminOnly,
            modOnly: modOnly,
        });

        expect(hasPermission).toBe(false);
    });
});

/** HELPER */

describe('The User is Helper and the permissions are basic', () => {
    it('should return true', () => {
        const { guild, user, bot } = getData();

        const adminOnly = false;
        const modOnly = false;

        const roleIsAdmin = false;
        const roleIsMod = false;
        const roleIsHelper = true;

        const hasPermission = checkPerms({
            role_id: user.id,
            roleIsAdmin: roleIsAdmin,
            roleIsMod: roleIsMod,
            roleIsHelper: roleIsHelper,
            user: user,
            isDashboard: false,
            adminOnly: adminOnly,
            modOnly: modOnly,
        });

        expect(hasPermission).toBe(true);
    });
});

describe('The User is Helper and the permissions are Moderator only', () => {
    it('should return false', () => {
        const { guild, user, bot } = getData();

        const adminOnly = false;
        const modOnly = true;

        const roleIsAdmin = false;
        const roleIsMod = false;
        const roleIsHelper = true;

        const hasPermission = checkPerms({
            role_id: user.id,
            roleIsAdmin: roleIsAdmin,
            roleIsMod: roleIsMod,
            roleIsHelper: roleIsHelper,
            user: user,
            isDashboard: false,
            adminOnly: adminOnly,
            modOnly: modOnly,
        });

        expect(hasPermission).toBe(false);
    });
});

describe('The User is Helper and the permissions are Admin only', () => {
    it('should return false', () => {
        const { guild, user, bot } = getData();

        const adminOnly = true;
        const modOnly = false;

        const roleIsAdmin = false;
        const roleIsMod = false;
        const roleIsHelper = true;

        const hasPermission = checkPerms({
            role_id: user.id,
            roleIsAdmin: roleIsAdmin,
            roleIsMod: roleIsMod,
            roleIsHelper: roleIsHelper,
            user: user,
            adminOnly: adminOnly,
            modOnly: modOnly,
        });

        expect(hasPermission).toBe(false);
    });
});

/** MODERATOR */

describe('The User is Moderator and the permissions are Basic', () => {
    it('should return true', () => {
        const { guild, user, bot } = getData();

        const adminOnly = false;
        const modOnly = false;

        const roleIsAdmin = false;
        const roleIsMod = true;
        const roleIsHelper = false;

        const hasPermission = checkPerms({
            role_id: user.id,
            roleIsAdmin: roleIsAdmin,
            roleIsMod: roleIsMod,
            roleIsHelper: roleIsHelper,
            user: user,
            adminOnly: adminOnly,
            modOnly: modOnly,
        });

        expect(hasPermission).toBe(true);
    });
});

describe('The User is Moderator and the permissions are Moderator Only', () => {
    it('should return true', () => {
        const { guild, user, bot } = getData();

        const adminOnly = false;
        const modOnly = true;

        const roleIsAdmin = false;
        const roleIsMod = true;
        const roleIsHelper = false;

        const hasPermission = checkPerms({
            role_id: user.id,
            roleIsAdmin: roleIsAdmin,
            roleIsMod: roleIsMod,
            roleIsHelper: roleIsHelper,
            user: user,
            adminOnly: adminOnly,
            modOnly: modOnly,
        });

        expect(hasPermission).toBe(true);
    });
});

describe('The User is Moderator and the permissions are Admin Only', () => {
    it('should return false', () => {
        const { guild, user, bot } = getData();

        const adminOnly = true;
        const modOnly = false;

        const roleIsAdmin = false;
        const roleIsMod = true;
        const roleIsHelper = false;

        const hasPermission = checkPerms({
            role_id: user.id,
            roleIsAdmin: roleIsAdmin,
            roleIsMod: roleIsMod,
            roleIsHelper: roleIsHelper,
            user: user,
            adminOnly: adminOnly,
            modOnly: modOnly,
        });

        expect(hasPermission).toBe(false);
    });
});

/** ADMIN */

describe('The User is Admin and the permissions are Basic', () => {
    it('should return true', () => {
        const { guild, user, bot } = getData();

        const adminOnly = false;
        const modOnly = false;

        const roleIsAdmin = true;
        const roleIsMod = false;
        const roleIsHelper = false;

        const hasPermission = checkPerms({
            role_id: user.id,
            roleIsAdmin: roleIsAdmin,
            roleIsMod: roleIsMod,
            roleIsHelper: roleIsHelper,
            user: user,
            adminOnly: adminOnly,
            modOnly: modOnly,
        });

        expect(hasPermission).toBe(true);
    });
});

describe('The User is Admin and the permissions are Moderator Only', () => {
    it('should return true', () => {
        const { guild, user, bot } = getData();

        const adminOnly = false;
        const modOnly = true;

        const roleIsAdmin = true;
        const roleIsMod = false;
        const roleIsHelper = false;

        const hasPermission = checkPerms({
            role_id: user.id,
            roleIsAdmin: roleIsAdmin,
            roleIsMod: roleIsMod,
            roleIsHelper: roleIsHelper,
            user: user,
            adminOnly: adminOnly,
            modOnly: modOnly,
        });

        expect(hasPermission).toBe(true);
    });
});

describe('The User is Admin and the permissions are Admin Only', () => {
    it('should return true', () => {
        const { guild, user, bot } = getData();

        const adminOnly = true;
        const modOnly = false;

        const roleIsAdmin = true;
        const roleIsMod = false;
        const roleIsHelper = false;

        const hasPermission = checkPerms({
            role_id: user.id,
            roleIsAdmin: roleIsAdmin,
            roleIsMod: roleIsMod,
            roleIsHelper: roleIsHelper,
            user: user,
            adminOnly: adminOnly,
            modOnly: modOnly,
        });

        expect(hasPermission).toBe(true);
    });
});

function checkPerms({ role_id, roleIsAdmin, roleIsMod, roleIsHelper, user, adminOnly, modOnly }) {
    const userHasRole = true;

    if (
        !userHasRole ||
        (adminOnly && roleIsMod) ||
        ((modOnly || adminOnly) && roleIsHelper) ||
        (!roleIsAdmin && !roleIsMod && !roleIsHelper)
    ) {
        return false;
    }

    return true;
}
