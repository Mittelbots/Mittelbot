const config = require('./src/assets/json/_config/config.json')
const {
    ShardingManager
} = require('discord.js')
const token = require('./_secret/token.json');

if (config.debug == 'false') {
    let manager = new ShardingManager('./index.js', {
        token: token.BOT_TOKEN,
        totalShards: 'auto',
        respawn: true,
    });
    manager.on('shardCreate', shard => {
        console.log(`[SHARDS]: Launched shards ${shard.id}`)
    });

    manager.spawn();
}