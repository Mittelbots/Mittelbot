const { SlashCommandBuilder } = require("discord.js");
const { delay } = require("../../../utils/functions/delay/delay");

module.exports.run = async ({main_interaction, bot}) => {

    const maxNumber = Math.floor(Math.random() * 30) + 1

    await main_interaction.reply(`Guess the number between 1 and ${maxNumber}`).catch(err => {});

    const originalNumber = () => {
        let number = Math.floor(Math.random() * 29) + 1;
        if(number < maxNumber) {
            return number;
        }else {
            return originalNumber();
        }
    }

    const message_collector = await main_interaction.channel.createMessageCollector({
        max: 1,
        time: 10000,
        filter: (m) => m.author.id === main_interaction.user.id
    })

    const number = originalNumber();
    await message_collector.on('collect', async (message) => {
        const guess = parseInt(message.content);
        
        if (guess === number) {
            await message.reply(`✅ You guessed the number! It was ${number}`).catch(err => {});
            message_collector.stop();
        } else if (guess > number) {
            await message.reply(`❌ Your guess was too high! It was ${number}`).catch(err => {});
        } else if (guess < number) {
            await message.reply(`❌ Your guess was too low! It was ${number}`).catch(err => {});
        }
    });

    await message_collector.on('end', async (reason) => {
        if(reason === 'time') {
            await main_interaction.channel.send(`❌ You didn't guess the number! It was ${number}`).catch(err => {});
        }
    });

}

module.exports.data = new SlashCommandBuilder()
	.setName('guessnumber')
	.setDescription('Guess the number between two random numbers!')