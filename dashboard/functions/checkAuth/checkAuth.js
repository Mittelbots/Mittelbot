// We declare a checkAuth function middleware to check if an user is logged in or not, and if not redirect him.
const jwt = require('jsonwebtoken');

module.exports.checkAuth = (req, res, next) => {
    const loginToken = req.cookies.token;
    const guilds = req.cookies.guilds;
    if (!loginToken) {
        return res.redirect('/login');
    }
    //verify jwt
    jwt.verify(loginToken, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.redirect('/login');
        }

        req.user = decoded;
        req.user.guilds = guilds;
        next();
    });
};
