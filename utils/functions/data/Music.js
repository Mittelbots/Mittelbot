const { QueryType } = require('discord-player');
const { errorhandler } = require('../errorhandler/errorhandler');
const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const musicModel = require('../../../src/db/Models/tables/music.model');

module.exports = class Music {
    constructor(main_interaction, bot, nonInteraction = false) {
        this.bot = bot;
        this.queue;
        if (nonInteraction) return;

        this.main_interaction = main_interaction;
        this.guild = main_interaction.guild;
        this.textChannel = main_interaction.channel;
        this.voiceChannel = main_interaction.member.voice.channel;
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
            return resolve(me.voice.channel && me.voice.channel.id !== this.voiceChannel.id);
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

    pause(isRestart = false) {
        return new Promise(async (resolve) => {
            if (!isRestart) {
                await this.updateQueueInDB(false);
            }
            await this.queue.node.pause();
            return resolve();
        });
    }

    resume() {
        return new Promise(async (resolve) => {
            await this.updateQueueInDB(true);
            await this.queue.node.resume();
            return resolve();
        });
    }

    destroy(queue, guild_id) {
        return new Promise(async (resolve, reject) => {
            try {
                await queue.delete();
                await this.deleteQueueFromDB(guild_id);
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

    addTrack(track, isRestart = false) {
        return new Promise(async (resolve) => {
            await this.queue.addTrack(track);
            if (isRestart) return resolve();

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

    disconnect(queue, guild_id) {
        return new Promise(async (resolve) => {
            try {
                if (queue) {
                    this.destroy(queue, guild_id);
                } else {
                    this.destroy(this.queue, guild_id);
                }
            } catch (e) {
                this.guild.me.voice.channel.leave();
            } finally {
                return resolve();
            }
        });
    }

    spotifySearch(target, requestedBy) {
        return new Promise(async (resolve) => {
            return resolve(
                await this.bot.player.search(target, {
                    requestedBy: requestedBy,
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
            return resolve(await this.spotifySearch(target, this.main_interaction.user));
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
                global.t.trans(['info.music.multipleSearchResultsFound'], this.guild.id)
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
            console.log(await this.getQueuedTracks());
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

    deleteQueueFromDB(guild_id) {
        return new Promise(async (resolve, reject) => {
            musicModel
                .destroy({
                    where: {
                        guild_id,
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

    getURLHost(url) {
        return new Promise(async (resolve) => {
            let host;
            switch (url.host) {
                case 'open.spotify.com':
                case 'spotify.com':
                case 'www.spotify.com':
                case 'play.spotify.com':
                    host = 'spotify';
                    break;
                case 'soundcloud.com':
                case 'www.soundcloud.com':
                case 'm.soundcloud.com':
                    host = 'soundcloud';
                    break;
                default:
                    host = 'default';
            }
            resolve(host);
        });
    }

    generateQueueAfterRestart() {
        return new Promise(async (resolve) => {
            musicModel
                .findAll()
                .then(async (queues) => {
                    queues.forEach(async (queuedTracks) => {
                        this.guild = this.bot.guilds.cache.get(queuedTracks.guild_id);
                        this.textChannel = this.guild.channels.cache.get(queuedTracks.text_channel);
                        this.voiceChannel = this.guild.channels.cache.get(
                            queuedTracks.voice_channel
                        );

                        await this.createQueue();

                        let allTracks = [];

                        for (let track of queuedTracks.queue) {
                            const host = await this.getURLHost(new URL(track.url));

                            if (host === 'spotify') {
                                const search = await this.spotifySearch(
                                    track.url,
                                    track.requestedBy
                                );
                                track = search.tracks[0];
                            } else if (host === 'soundcloud') {
                                const search = await this.soundcloudSearch(track.url);
                                track = search.tracks[0];
                            } else {
                                const search = await this.defaultSearch(track.url);
                                track = search.tracks[0];
                            }

                            allTracks.push(track);
                        }
                        await this.addTrack(allTracks, true);

                        if (queuedTracks.isPlaying) {
                            this.play();
                        } else {
                            this.pause(true);
                        }

                        resolve();
                    });
                })
                .catch(async (e) => {});
        });
    }
};
