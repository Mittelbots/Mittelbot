const translatte = require('translatte');
const { errorhandler } = require('../errorhandler/errorhandler');

module.exports.translateMessage = async ({message}) => {
    if(message.guild.id === '967081567929380924' && message.channel.id === '978313607752335390') {
        translatte(message.content, {to: 'en'}).then(res => {
            message.guild.channels.cache.get('978333138201759754').send(`${message.author} ${message.channel} | ${res.text}`);
        }).catch(err => {
            errorhandler({err: err, fatal: true});
        });
    }
}