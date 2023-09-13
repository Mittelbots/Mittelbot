module.exports = (req, res) => {
    res.status(200).json({
        message: 'Pong!',
        data: req.data,
    });
};

module.exports.config = {
    path: '/ping',
    method: 'get',
    bypassAuth: true,
};
