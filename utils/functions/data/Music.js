const { QueryType } = require('discord-player');
const { errorhandler } = require('../errorhandler/errorhandler');

module.exports = class Music {
    constructor(main_interaction, bot) {
        this.main_interaction = main_interaction;
        this.bot = bot;

        (async () => {
            this.queue = await this.getQueue();
        })();
    }

    isYoutubeLink(target) {
        return new Promise(async (resolve) => {
            try {
                const url = new URL(target);
                return resolve(url.hostname === 'www.youtube.com' || url.hostname === 'youtu.be');
            } catch (e) {
                return resolve(false);
            }
        });
    }

    isBotMuted() {
        return new Promise(async (resolve) => {
            const me = await this.main_interaction.guild.members.fetchMe();
            resolve(me.voice.serverMute);
        });
    }

    isUserInChannel() {
        return new Promise(async (resolve) => {
            return resolve(this.main_interaction.member.voice.channel);
        });
    }

    isBotInAnotherChannel() {
        return new Promise(async (resolve) => {
            const me = await this.main_interaction.guild.members.fetchMe();
            return resolve(
                me.voice.channel &&
                    me.voice.channel.id !== this.main_interaction.member.voice.channel.id
            );
        });
    }

    isBotInAVoiceChannel() {
        return new Promise(async (resolve) => {
            const me = await this.main_interaction.guild.members.fetchMe();
            return resolve(me.voice.channel);
        });
    }

    isPlaying() {
        return new Promise(async (resolve) => {
            return resolve(this.queue && this.queue.node.isPlaying());
        });
    }

    isPaused() {
        return new Promise(async (resolve) => {
            return resolve(this.queue && this.queue.node.isPaused());
        });
    }

    play() {
        return new Promise(async (resolve, reject) => {
            try {
                await this.queue.node.play();
                return resolve();
            } catch (e) {
                errorhandler({
                    err: e,
                });
                return reject();
            }
        });
    }

    skip() {
        return new Promise(async (resolve) => {
            await this.queue.node.skip();
            return resolve();
        });
    }

    pause() {
        return new Promise(async (resolve) => {
            await this.queue.node.pause();
            return resolve();
        });
    }

    resume() {
        return new Promise(async (resolve) => {
            await this.queue.node.resume();
            return resolve();
        });
    }

    destroy() {
        return new Promise(async (resolve, reject) => {
            try {
                await this.queue.delete();
                return resolve();
            } catch (e) {
                return reject();
            }
        });
    }

    getQueue() {
        return new Promise(async (resolve) => {
            try {
                this.queue = this.bot.player.nodes.get(this.main_interaction.guild);
            } catch (e) {
                this.queue = false;
            }

            return resolve(this.queue);
        });
    }

    createQueue() {
        return new Promise(async (resolve) => {
            try {
                this.queue = this.bot.player.nodes.create(this.main_interaction.guild, {
                    metadata: {
                        client: this.main_interaction.client.me,
                        channel: this.main_interaction.channel,
                        requestedBy: this.main_interaction.user,
                    },
                    leaveOnEnd: false,
                    leaveOnEndCooldown: 60000 * 5,
                    leaveOnEmpty: false,
                    leaveOnEmptyCooldown: 60000 * 5,
                    leaveOnStop: false,
                });

                await this.queue.connect(this.main_interaction.member.voice.channel.id, {
                    deaf: true,
                });

                return resolve(this.queue);
            } catch (e) {
                errorhandler({
                    err: e,
                });
                return resolve(false);
            }
        });
    }

    disconnect() {
        return new Promise(async (resolve) => {
            try {
                this.destroy();
            } catch (e) {
                this.main_interaction.guild.me.voice.channel.leave();
            } finally {
                return resolve();
            }
        });
    }

    spotifySearch(target) {
        return new Promise(async (resolve) => {
            return resolve(
                await this.bot.player.search(target, {
                    requestedBy: this.main_interaction.user,
                    searchEngine: QueryType.SPOTIFY,
                })
            );
        });
    }

    soundcloudSearch(target) {
        return new Promise(async (resolve) => {
            return resolve(
                await this.bot.player.search(target, {
                    requestedBy: this.main_interaction.user,
                    searchEngine: QueryType.SOUNDCLOUD,
                })
            );
        });
    }

    defaultSearch(target) {
        return new Promise(async (resolve) => {
            return resolve(await this.spotifySearch(target));
        });
    }

    checkAvailibility(play = false) {
        return new Promise(async (resolve) => {
            if (!(await this.isUserInChannel()))
                return resolve('You are not in a voice channel to use this command!');
            if (await this.isBotInAnotherChannel())
                return resolve(
                    'I am already in another voice channel! Please join that channel or wait until i left!'
                );
            if (!(await this.isBotInAVoiceChannel()) && !play)
                return resolve(
                    'I am not in a voice channel! Please let me join you channel first by using the play command!'
                );
            return resolve(false);
        });
    }
};
