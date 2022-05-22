const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageAttachment } = require("discord.js");
const { MessageEmbed } = require("discord.js");
const { readFile } = require('fs/promises');
const { delay } = require("../../../utils/functions/delay/delay");
const Canvas = require('@napi-rs/canvas');
const { request } = require('undici');

module.exports.run = async ({main_interaction, bot}) => {
    const user = main_interaction.options.getUser('user');

    if(user === main_interaction.user) {
        return main_interaction.reply({
            content: `You can't ship with yourself!`,
            ephemeral: true
        }).catch(err => {})
    }
    // else if(user.bot) {
    //     return main_interaction.reply({
    //         content: `You can't ship with bots!`,
    //         ephemeral: true
    //     }).catch(err => {})
    // }

    await main_interaction.reply({
        files: [new MessageAttachment('https://media.tenor.com/images/c2f392370c8b20cc99d04148c7b6bebc/tenor.gif')]
    }).catch(err => {})


    const ship = Math.floor(Math.random() * 100);

    const quotes = [{
        "100_70": ["Damn! You really have to hangout together", "Wow!", "Wedding, when?"],
        "69_40": ["hm. Maybe with a little more effort it can be something special", "That's a good start"],
        "39_10": ["IDK. Maybe you should go out with someone else"],
        "9_0": ["I'm not sure if you can be friends with someone like that", "This is bad. Really bad.", "Sorry for that"]
    }];

    var quote = '';
    if(ship >= 70) {
        quote = quotes[0]["100_70"][Math.floor(Math.random() * quotes[0]["100_70"].length)];
    }else if(ship >= 40) {
        quote = quotes[0]["69_40"][Math.floor(Math.random() * quotes[0]["69_40"].length)];
    }else if(ship >= 10) {
        quote = quotes[0]["39_10"][Math.floor(Math.random() * quotes[0]["39_10"].length)];
    }else {
        quote = quotes[0]["9_0"][Math.floor(Math.random() * quotes[0]["9_0"].length)];
    }

    const canvas = Canvas.createCanvas(950, 550);
    const context = canvas.getContext('2d');

    //! Background
    const backgroundFile = await readFile('./src/assets/img/ship/ship_bg.jpg');
    const background = new Canvas.Image();
    background.src = backgroundFile;
    context.drawImage(background, 0, 0, canvas.width, canvas.height);
    // Set the color of the stroke
	context.strokeStyle = '#ffffff';
    context.lineWidth = 9
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

    context.fillText(ship+'%', 420, 190);

    const attachment = new MessageAttachment(canvas.toBuffer(), `test.png`);

    const newEmbed = new MessageEmbed()
        .setDescription(`**${user.username}** and **${main_interaction.user.username}** are \`${ship}%\` compatible! \n\n\`${quote}\``)

    await delay(Math.floor(Math.random() * (3000 - 1000) + 3000));

    await main_interaction.editReply({
        files: [attachment]
    });
    
    return main_interaction.channel.send({
        embeds: [newEmbed]
    });
}

module.exports.data = new SlashCommandBuilder()
	.setName('ship')
	.setDescription('Ship you and a mentioned user and see if they are compatible.')
    .addUserOption(option => 
        option.setName('user')
        .setDescription('The user you want to ship.')
        .setRequired(true)
        )