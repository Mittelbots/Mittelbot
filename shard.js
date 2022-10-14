require('dotenv').config();
const { ShardingManager } = require('discord.js');
const token = require('./_secret/token.json');

if (!JSON.parse(process.env.DEBUG)) {
    let manager = new ShardingManager('./index.js', {
        token: token.BOT_TOKEN,
        totalShards: 'auto',
        respawn: true,
    });
    manager.once('shardCreate', (shard) => {
        console.log(`[SHARDS]: Launched shards ${shard.id}`);
    });

    manager.spawn();
}
