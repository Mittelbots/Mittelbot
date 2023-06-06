module.exports = (req, res) => {
    const guild_id = req.query.guild_id;
    const user_id = req.query.user_id;
    const bot = req.data.bot;

    console.log(bot.user);

    if (!guild_id || !user_id) {
        return res.status(400).json({
            message: 'Missing guild id or user id',
        });
    }
};

module.exports.config = {
    path: '/get/config',
    method: 'get',
    bypassAuth: false,
};
