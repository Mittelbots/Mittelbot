require('dotenv').config();
const { ShardingManager } = require('discord.js');

if (!JSON.parse(process.env.DEBUG)) {
    let manager = new ShardingManager('./bot/core/index.js', {
        token: process.env.DISCORD_TOKEN,
        totalShards: 'auto',
        respawn: true,
    });
    manager.once('shardCreate', (shard) => {
        console.info(`[SHARDS]: Launched shards ${shard.id}`);
    });

    manager.spawn();
} else {
    require('./index.js');
}
