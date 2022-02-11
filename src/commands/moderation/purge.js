const config = require('../../../src/assets/json/_config/config.json');
const { hasPermission } = require('../../../utils/functions/hasPermissions');


module.exports.run = async (bot, message, args) => {
    if(!await hasPermission(message, 0, 1)) {        
        message.delete();
        return message.channel.send(`<@${message.author.id}> ${config.errormessages.nopermission}`).then(msg => {
            setTimeout(() => msg.delete(), 5000);
        });
    }
    var amount = args[0];
    // try {
    //     var user = message.mentions.members.first() || await message.guild.members.fetch(args[0]) || '';
    // }catch(err) {
    //     //NO MEMBER GIVEN
    //    amount = args[0];
    //}

    if(isNaN(amount)) {
        return message.channel.send(`That isn't a valid number!`);
    }else if (amount < 1 || amount >= Number(config.bulkDeleteLimit)) {
        return message.channel.send('you need to input a number between 1 and 99.');
    }


    // if(user) {
    //     message.channel.messages.fetch({limit: 100}).then(async (messages) => {
    //         let userMessages = [];
    //         let msg = await messages.filter(m => m.author.id === user.id);

    //         let x = 0;
    //         for(let i of msg) {
    //             if(x > amount) break;
    //             return console.log(i);
    //             userMessages.push(i);
    //             x++;
    //         }

    //         message.channel.bulkDelete(userMessages).then(() => {
    //             message.channel.send(`Successfully pruned ${amount} messages`).then(msg => setTimeout(() => msg.delete(), 5000))
    //         }).catch(err => {
    //             console.log(err);
    //             message.channel.send('there was an error trying to prune messages in this channel!');
    //         })
    //     });
    // }else {
        await message.channel.bulkDelete(amount, true).then(message.channel.send(`Successfully pruned ${amount} messages`).then(msg => setTimeout(() => msg.delete(), 5000))).catch(err => {
            if(config.debug == 'true') console.log(err);
            message.channel.send('there was an error trying to prune messages in this channel! (I can only delete messages younger then 14 Days!)');
        });
        return message.delete();
    // }
}

module.exports.help = {
    name:"purge"
}