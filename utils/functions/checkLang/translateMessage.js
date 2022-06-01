const translatte = require('translatte');
const { errorhandler } = require('../errorhandler/errorhandler');

module.exports.translateMessage = async ({message}) => {
        translatte(message.content, {to: 'en'}).then(res => {
            message.guild.channels.cache.get('978333138201759754').send(`${message.author} ${message.channel} | ${res.text}`);
        }).catch(err => {
            errorhandler({err: err, fatal: true});
        });
}