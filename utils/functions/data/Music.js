module.exports = class Music {
    constructor(main_interaction, bot) {
        this.main_interaction = main_interaction;
        this.bot = bot;
    }

    isBotMuted() {
        return new Promise(async (resolve) => {
            const me = await this.main_interaction.guild.members.fetchMe();
            resolve(me.voice.serverMute);
        })
    }

    isUserInChannel() {
        return new Promise(async (resolve) => {
            return resolve(this.main_interaction.member.voice.channel);
        })
    }

    pause() {
        return new Promise(async (resolve) => {
            const queue = this.bot.player.getQueue(this.main_interaction.guild);
            await queue.setPaused(true);
            return resolve();
        })
    }

    resume() {
        return new Promise(async (resolve) => {
            const queue = this.bot.player.getQueue(this.main_interaction.guild);
            await queue.setPaused(false);
            return resolve();
        })
    }

    destroy() {
        return new Promise(async (resolve) => {
            const queue = this.bot.player.getQueue(this.main_interaction.guild);
            await queue.destroy();
            return resolve();
        })
    }

    getQueue() {
        return new Promise(async (resolve) => {
            const queue = this.bot.player.getQueue(this.main_interaction.guild);
            return resolve(queue);
        })
    }

    createQueue() {
        return new Promise(async (resolve) => {
            const queue = this.bot.player.createQueue(this.main_interaction.guild, {
                metadata: {
                    channel: this.main_interaction.channel
                }
            });

            if(!queue.connection) await queue.connect(this.main_interaction.member.voice.channel);
            return resolve(queue);
        })
    }

    disconnect() {
        return new Promise(async (resolve) => {
            try {
                this.destroy();
            }catch(e) {
                this.main_interaction.guild.me.voice.channel.leave()
            }finally {
                return resolve();
            }
        })
    }
}