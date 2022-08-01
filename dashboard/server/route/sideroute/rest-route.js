const {
    updateGuildConfig,
    getGuildConfig
} = require("../../../../utils/functions/data/getConfig");
const {
    checkRest
} = require("../../../functions/checkRest/checkRest");

const jwt = require("jsonwebtoken");
const {
    hasPermission
} = require("../../../../utils/functions/hasPermissions");
const { errorhandler } = require("../../../../utils/functions/errorhandler/errorhandler");

module.exports = ({
    app
}) => {
    app.post(app.settings.config.route.changeSettings.path, checkRest, async (req, res) => {
        const {
            module,
            settings,
            guildid,
            type
        } = req.params;

        if (!module || !settings || !guildid || !type) {
            res.status(400).send({
                error: "Missing parameters"
            });
            return;
        }

        const token = req.cookies.token;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const hasPermissions = await hasPermission({
            guild_id: guildid,
            adminOnly: true,
            modOnly: false,
            user: decoded.id,
            isDashboard: true,
            bot: app.settings.bot
        })

        if (!hasPermissions) {
            return res.status(401).json({
                success: false,
                error: "You do not have permission to do this!"
            });
        } else {

            var config = await getGuildConfig({
                guild_id: guildid
            });

            try {
                config.settings[module] = JSON.parse(config.settings[module]);
            } catch (e) {}

            if (module === "welcome_channel") {
                try {
                    config.settings[module][type] = settings;
                } catch (e) {
                    config.settings[module][type] = {};
                    config.settings[module][type] = settings;
                }
            }

            if (module === "joinroles") {
                try {
                    config.settings[module] = JSON.parse(settings);
                } catch (e) {
                    config.settings[module] = {};
                    config.settings[module] = JSON.parse(settings);
                }
            }

            await updateGuildConfig({
                guild_id: guildid,
                value: JSON.stringify(config.settings[module]),
                valueName: module
            }).then(() => {
                config = null;
                try { 
                res.status(200).json({
                    success: true
                });
            } catch (e) {}
            }).catch(err => {
                errorhandler({err, fatal: true})
                try {
                    res.status(500).json({
                        error: err
                    });
                } catch (e) {}
            })
        }
    })
}