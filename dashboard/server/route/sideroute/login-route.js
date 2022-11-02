const jwt = require('jsonwebtoken');

module.exports = ({ app }) => {
    app.get('/login', (req, res) => {
        const loginToken = req.cookies.token;
        if (!loginToken) {
            return res.redirect(app.settings.config.discordAuthLink);
        }

        jwt.verify(loginToken, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.redirect(app.settings.config.discordAuthLink);
            }

            req.user = decoded;
            return res.redirect('/dashboard');
        });
    });
};
