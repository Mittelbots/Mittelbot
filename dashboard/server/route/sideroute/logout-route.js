const axios = require('axios');
const url = require('url');
const { checkAuth } = require('../../../functions/checkAuth/checkAuth');

module.exports = ({ app }) => {
    // Logout endpoint.
    app.get(app.settings.config.route.logout.path, checkAuth, async (req, res) => {
        //revokle the access token from discord

        const formData = new url.URLSearchParams({
            client_id: app.settings.config.id,
            client_secret: app.settings.config.clientSecret,
            token: req.user.access_token,
        });

        try {
            const response = await axios.post(
                'https://discordapp.com/api/v8/oauth2/token/revoke',
                formData.toString(),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        Authorization: `Bearer ${req.user.access_token}`,
                    },
                }
            );

            res.clearCookie('token');
            req.session.destroy();

            res.redirect('/');
        } catch (err) {
            console.error(err);
            return res.sendStatus(400);
        }
    });
};
