const { QueryType } = require('discord-player');
const { errorhandler } = require('../errorhandler/errorhandler');
const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const musicModel = require('../../../src/db/Models/tables/music.model');

module.exports = class Music {
    constructor(main_interaction, bot, nonInteraction = false) {
        this.bot = bot;
        if(nonInteraction) return;

        this.main_interaction = main_interaction;
        this.guild = main_interaction.guild;
        this.textChannel = main_interaction.channel;
        this.voiceChannel = main_interaction.member.voice.channel
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
            const me = await this.guild.members.fetchMe();
            resolve(me.voice.serverMute);
        });
    }

    isUserInChannel() {
        return new Promise(async (resolve) => {
            return resolve(this.voiceChannel);
        });
    }

    isBotInAnotherChannel() {
        return new Promise(async (resolve) => {
            const me = await this.guild.members.fetchMe();
            return resolve(
                me.voice.channel &&
                    me.voice.channel.id !== this.voiceChannel.id
            );
        });
    }

    isBotInAVoiceChannel() {
        return new Promise(async (resolve) => {
            const me = await this.guild.members.fetchMe();
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
            await this.updateQueueInDB();
            return resolve();
        });
    }

    pause() {
        return new Promise(async (resolve) => {
            await this.queue.node.pause();
            await this.updateQueueInDB(false);
            return resolve();
        });
    }

    resume() {
        return new Promise(async (resolve) => {
            await this.queue.node.resume();
            await this.updateQueueInDB(true);
            return resolve();
        });
    }

    destroy() {
        return new Promise(async (resolve, reject) => {
            try {
                await this.queue.delete();
                await this.deleteQueueFromDB();
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
            if (this.queue) return resolve(this.queue);
            try {
                this.queue = this.bot.player.nodes.create(this.guild, {
                    metadata: {
                        client: this.bot.user,
                        channel: this.textChannel,
                    },
                    leaveOnEnd: false,
                    leaveOnEndCooldown: 60000 * 5,
                    leaveOnEmpty: false,
                    leaveOnEmptyCooldown: 60000 * 5,
                    leaveOnStop: false,
                    skipOnNoStream: true,
                });

                await this.queue.connect(this.voiceChannel.id, {
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

    addTrack(track) {
        return new Promise(async (resolve) => {
            await this.queue.addTrack(track);
            await this.getQueueFromDB()
                .then(async () => {
                    await this.updateQueueInDB();
                })
                .catch(async () => {
                    await this.addQueueToDB();
                });
            return resolve();
        });
    }

    disconnect() {
        return new Promise(async (resolve) => {
            try {
                this.destroy();
            } catch (e) {
                this.guild.me.voice.channel.leave();
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

    getQueuedTracks() {
        return new Promise(async (resolve) => {
            return resolve(this.queue.tracks);
        });
    }

    searchResults(request) {
        return new Promise(async (resolve) => {
            let buttons = [];
            const embed = new EmbedBuilder().setDescription(
                global.t.trans(
                    ['info.music.multipleSearchResultsFound'],
                    this.guild.id
                )
            );

            for (let i = 0; i < 5; i++) {
                embed.addFields({
                    name: `${parseInt(i, 10) + 1}. ${request[i].title}`,
                    value: `URL: ${request[i].url}`,
                });

                buttons.push(
                    new ButtonBuilder()
                        .setStyle(ButtonStyle.Secondary)
                        .setLabel(`${parseInt(i, 10) + 1}`)
                        .setCustomId(`searchResult_${request[i].url}`)
                        .setDisabled(false)
                );
            }

            return resolve({
                embed: embed,
                row: new ActionRowBuilder().addComponents(buttons),
            });
        });
    }

    getQueueFromDB() {
        return new Promise(async (resolve, reject) => {
            musicModel
                .findOne({
                    guild: this.guild.id,
                })
                .then((queue) => {
                    if (!queue || queue.length === 0) return reject();
                    return resolve(queue);
                })
                .catch((e) => {
                    return reject(e);
                });
        });
    }

    addQueueToDB() {
        return new Promise(async (resolve, reject) => {
            const queuedTracks = (await this.getQueuedTracks()).data;
            musicModel
                .create({
                    guild_id: this.guild.id,
                    text_channel: this.textChannel.id,
                    voice_channel: this.voiceChannel.id,
                    queue: queuedTracks,
                })
                .then((queue) => {
                    return resolve(queue);
                })
                .catch((e) => {
                    return reject(e);
                });
        });
    }

    updateQueueInDB(isPlaying = true) {
        return new Promise(async (resolve, reject) => {
            const queuedTracks = (await this.getQueuedTracks()).data;

            musicModel
                .update(
                    {
                        queue: queuedTracks,
                        text_channel: this.textChannel.id,
                        voice_channel: this.voiceChannel.id,
                        isPlaying: isPlaying,
                    },
                    {
                        where: {
                            guild_id: this.guild.id,
                        },
                    }
                )
                .then((queue) => {
                    return resolve(queue);
                })
                .catch((e) => {
                    return reject(e);
                });
        });
    }

    deleteQueueFromDB() {
        return new Promise(async (resolve, reject) => {
            musicModel
                .destroy({
                    where: {
                        guild_id: this.guild.id,
                    },
                })
                .then((queue) => {
                    return resolve(queue);
                })
                .catch((e) => {
                    return reject();
                });
        });
    }

    generateQueueAfterRestart() {
        return new Promise(async (resolve) => {
            musicModel.findAll()
                .then(async (queues) => {
                    queues.forEach(async (queuedTracks) => {
                        this.guild = this.bot.guilds.cache.get(queuedTracks.guild_id);
                        this.channel = this.guild.channels.cache.get(queuedTracks.channel_id);

                        await this.createQueue();

                        queuedTracks.queue.forEach(async (track) => {
                            await this.queue.addTrack(track);
                        });

                        if (queuedTracks.isPlaying) {
                            this.play();
                        }
                    });
                })
                .catch(async (e) => {
                });
        });
    }
};
