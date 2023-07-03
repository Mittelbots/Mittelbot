const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { readFile } = require('fs/promises');
const { delay } = require('~utils/functions/delay');
const Canvas = require('@napi-rs/canvas');
const { request } = require('undici');
const { shipConfig } = require('../_config/fun/ship');

module.exports.run = async ({ main_interaction, bot }) => {
    const user = main_interaction.options.getUser('user');

    if (user === main_interaction.user) {
        return main_interaction
            .reply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(
                            global.t.trans(
                                ['error.fun.ship.cannotShip', 'yourself'],
                                main_interaction.guild.id
                            )
                        )
                        .setColor(global.t.trans(['general.colors.error'])),
                ],
                ephemeral: true,
            })
            .catch((err) => {});
    } else if (user.bot) {
        return main_interaction
            .reply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(
                            global.t.trans(
                                ['error.fun.ship.cannotShip', 'bots'],
                                main_interaction.guild.id
                            )
                        )
                        .setColor(global.t.trans(['general.colors.error'])),
                ],
                ephemeral: true,
            })
            .catch((err) => {});
    }

    await main_interaction
        .reply({
            files: [
                new AttachmentBuilder(
                    'https://media.tenor.com/images/c2f392370c8b20cc99d04148c7b6bebc/tenor.gif'
                ),
            ],
        })
        .catch((err) => {});

    const ship = Math.floor(Math.random() * 100) + 1;

    const generateQuote = () => {
        const quotes = global.t.trans(['info.fun.ship.quotes'], main_interaction.guild.id);

        try {
            if (ship >= 70) {
                return quotes[0]['100_70'][Math.floor(Math.random() * quotes[0]['100_70'].length)];
            } else if (ship >= 40) {
                return quotes[0]['69_40'][Math.floor(Math.random() * quotes[0]['69_40'].length)];
            } else if (ship >= 10) {
                return quotes[0]['39_10'][Math.floor(Math.random() * quotes[0]['39_10'].length)];
            } else {
                return quotes[0]['9_0'][Math.floor(Math.random() * quotes[0]['9_0'].length)];
            }
        } catch (err) {
            return null;
        }
    };

    let quote;
    let tries = 0;
    do {
        quote = generateQuote();
        tries++;
        if (tries > 10) {
            quote = '';
            break;
        }
    } while (quote === null);

    const canvas = Canvas.createCanvas(950, 550);
    const context = canvas.getContext('2d');

    //! Background
    const background = new Canvas.Image();
    background.src = await readFile('./src/assets/img/ship/ship_bg.jpg');
    context.drawImage(background, 0, 0, canvas.width, canvas.height);
    // Set the color of the stroke
    context.strokeStyle = '#ffffff';
    context.lineWidth = 9;
    // Draw a rectangle with the dimensions of the entire canvas
    context.strokeRect(0, 0, canvas.width, canvas.height);

    //! User 1
    context.strokeRect(0, 0, canvas.width, canvas.height);
    const user1 = await request(main_interaction.user.displayAvatarURL({ format: 'jpg' }));
    const avatar1 = new Canvas.Image();
    avatar1.src = Buffer.from(await user1.body.arrayBuffer());
    context.drawImage(avatar1, 50, 100, 250, 250);

    //! User 2
    context.strokeRect(0, 0, canvas.width, canvas.height);
    const user2 = await request(user.displayAvatarURL({ format: 'jpg' }));
    const avatar2 = new Canvas.Image();
    avatar2.src = Buffer.from(await user2.body.arrayBuffer());
    context.drawImage(avatar2, canvas.width - 300, 100, 250, 250);

    //! score
    context.font = 'bold 70px sans-serif';
    context.fillStyle = '#e80d40';
    context.fillText(ship + '%', 420, 190);

    const attachment = new AttachmentBuilder(canvas.toBuffer('image/png'), `test.png`);

    const newEmbed = new EmbedBuilder().setDescription(
        global.t.trans(
            [
                'success.fun.ship.showResult',
                user.username,
                main_interaction.user.username,
                ship,
                quote,
            ],
            main_interaction.guild.id
        )
    );

    await delay(Math.floor(Math.random() * (3000 - 1000) + 3000));

    await main_interaction.editReply({
        files: [attachment],
    });

    return main_interaction.channel.send({
        embeds: [newEmbed],
    });
};

module.exports.data = shipConfig;
