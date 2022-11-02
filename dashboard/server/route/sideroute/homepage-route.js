const { renderTemplate } = require('../../../functions/renderTemplate/renderTemplate');

module.exports = ({ app }) => {
    // Index endpoint.
    app.get('/', (req, res) => {
        renderTemplate(
            res,
            req,
            'index.ejs',
            {
                discordInvite: app.settings.config.discordInvite,
            },
            app.settings.bot
        );
    });
};
