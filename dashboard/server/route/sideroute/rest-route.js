const { updateGuildConfig, getGuildConfig } = require("../../../../utils/functions/data/getConfig");
const { checkRest } = require("../../../functions/checkRest/checkRest");

const jwt = require("jsonwebtoken");
const { hasPermission } = require("../../../../utils/functions/hasPermissions");

module.exports = ({app}) => {
    app.post(app.settings.config.route.changeSettings.path, checkRest, async (req, res) => {
        const {module, settings, guildid, type} = req.params;

        if(!module || !settings || !guildid || !type) {
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
                error: "You do not have permission to do this!"
            });
        }else {

            var config = await getGuildConfig({
                guild_id: guildid
            });

            try {
                config.settings[module] = JSON.parse(config.settings[module]);
            }catch(e) {}
            
            config.settings[module][type] = settings;



            return await updateGuildConfig({
                guild_id: guildid,
                value: JSON.stringify(config.settings[module]),
                valueName: module
            }).then(() => {
                config = null;
                res.status(200).json({
                    success: true
                });
            }).catch(err => {
                res.status(500).json({
                    error: err
                });
            })
        }
    })
}