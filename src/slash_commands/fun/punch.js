const { EmbedBuilder } = require("discord.js");
const { punchConfig } = require("../_config/fun/punch");

module.exports.run = async ({ main_interaction, bot }) => {
    const user = main_interaction.options.getUser("user");

    const punchGifs = [
        'https://media.tenor.com/kw5lYGbw8oAAAAAC/one-punch-man.gif',
        'https://media.tenor.com/IkF34bYMTs0AAAAC/bear-bunny.gif',
        'https://media.tenor.com/FFYqOVVbrJAAAAAM/markiplier-punch.gif',
        'https://media.tenor.com/5iVv64OjO28AAAAM/milk-and-mocha-bear-couple.gif',
        'https://media.tenor.com/DWI_Vtq_9_cAAAAM/slap-face.gif',
        'https://media.tenor.com/__oycZBexeAAAAAM/slap.gif',
        'https://media.tenor.com/WsKM5ZDigvgAAAAM/penguin-penguins.gif',
    ];

    await main_interaction
        .reply({
            content: `||${user}||`,
            embeds: [
                new EmbedBuilder()
                    .setDescription(
                        global.t.trans(['info.fun.punch', user], main_interaction.guild.id)
                    )
                    .setImage(punchGifs[Math.floor(Math.random() * punchGifs.length)])
            ]
        })
        .catch((err) => {console.log(err)});

};

module.exports.data = punchConfig;
