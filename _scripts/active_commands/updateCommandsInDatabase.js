const readline = require('readline');
const database = require('../../src/db/db');


let old_name = '';


const read_line_interface = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
read_line_interface.question('Please enter the exact name of the command', function(command_name) {
    if(command_name !== '') {
        main(command_name);
    }else {
        console.log('Command name can not be empty!');
        process.exit();
    }

    read_line_interface.close();
});

async function main(command_name, isEdit) {
    await database.query('SELECT * FROM active_commands').then(async res => {
        res = await res;

        if(!isEdit) {
            let isDisabled = res.map((c, index) => {
                try {
                    return c.global_disabled.indexOf(command_name);
                }catch(err) {};
            });
            isDisabled = isDisabled.filter(Boolean);
            isDisabled = isDisabled.filter(c => c > -1);


            if(isDisabled.length > 0) {
                const read_line_interface = readline.createInterface({
                    input: process.stdin,
                    output: process.stdout
                });
                read_line_interface.question('Do you want to enable the command global again?\nTo edit the command you have to enable it.', function(enable_command) {
                    if(enable_command.toLowerCase() === 'no' || enable_command.toLowerCase() === 'n') {
                        process.exit();
                    }else {
                    
                        for(let i in res) {
                            let global_disabled_commands = JSON.parse(res[i].global_disabled);

                            var new_disabled_commands = [];
                            for(let i in global_disabled_commands) {
                                
                                if(global_disabled_commands[i] !== command_name) {
                                    new_disabled_commands.push(global_disabled_commands[i])
                                }
                            }

                            enable_disabledCommand_Global(new_disabled_commands ?? "[]", res[i].guild_id);
                        }
                        
                    }
                
                    read_line_interface.close();
                });
                return;
            }
        }
        var alreadyExists;

        if(!isEdit) {
            alreadyExists = res.filter(c => c.active_commands.search(command_name) > -1);
        }

        if(alreadyExists && alreadyExists.length > 0 && !isEdit) {
            console.log(`Command "${command_name}" already exists!\n`);

            if(isEdit) {
                process.exit();
            }

            const read_line_interface = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });
            return read_line_interface.question('Do you want to edit it?\n Or type "disable" to disable to command global', function(new_command_name) {
                if(new_command_name.toLowerCase() === 'no' || new_command_name.toLowerCase() === 'n') {
                    process.exit();
                }else {
                    old_name = command_name;
                    main(new_command_name, true);
                }
            
                read_line_interface.close();
            });
        }

        if(!isEdit) {
            for(let i in res) {
                let commands = JSON.parse(res[i].active_commands);
                commands.push(command_name);
                await updateTable(commands, res[i].guild_id);
            }
        }else {
            for(let i in res) {
                let active_commands = JSON.parse(res[i].active_commands);
                let disabled_commands = JSON.parse(res[i].disabled_commands);
                let global_disabled_commands = JSON.parse(res[i].global_disabled);


                if(command_name.toLowerCase() === 'disable' || command_name.toLowerCase() === 'd') {
                    let global_disabled = JSON.parse(res[i].global_disabled) ?? [];
                    global_disabled.push(old_name);

                    await updateTable(null, res[i].guild_id, global_disabled, null);
                }else {

                    var pass = true;
                    for(let c in active_commands) {
                        if(active_commands[c] === old_name && pass) {
                            console.log(`Active Commands: [${res[i].guild_id}]: ${old_name} -> ${command_name}`);

                            active_commands[c] = command_name;
                            pass = false;
                            await updateTable(active_commands, res[i].guild_id, null, null);
                        }
                    }

                    if(disabled_commands.length > 0) {
                        pass = true;
                        for(let c in disabled_commands) {
                            if(disabled_commands[c] === old_name && pass) {
                                console.log(`Disabled commands: [${res[i].guild_id}]: ${old_name} -> ${command_name}`);

                                disabled_commands[c] = command_name;
                                pass = false;
                                await updateTable(null, res[i].guild_id, null, disabled_commands);
                            }
                        }
                    }

                }
            }

            process.exit();
        }


        async function updateTable(commands, guild_id, global_disabled, disabled_commands) {

            if(global_disabled) {
                return await database.query('UPDATE active_commands SET global_disabled = ? WHERE guild_id = ?', [JSON.stringify(global_disabled), guild_id])
                    .then(() => {console.log(guild_id + ' updated!')})
                    .catch(err => {
                        console.error(err);
                        process.exit();
                    })
            }
            if(disabled_commands) {
                return await database.query('UPDATE active_commands SET disabled_commands = ? WHERE guild_id = ?', [JSON.stringify(disabled_commands), guild_id])
                .then(() => {console.log(guild_id + ' updated!')})
                .catch(err => {
                    console.error(err);
                    process.exit();
                })
            }

            await database.query(`UPDATE active_commands SET active_commands = ? WHERE guild_id = ?`, [JSON.stringify(commands), guild_id])
                .then(() => {console.log(guild_id + ' updated!')})
                .catch(err => {
                    console.error(err);
                    process.exit();
                });
        }


        async function enable_disabledCommand_Global(commands, guild_id) {
            await database.query('UPDATE active_commands SET global_disabled = ? WHERE guild_id = ?', [JSON.stringify(commands), guild_id])
                .then(() => {console.log(guild_id + ' updated!')})
                .catch(err => {
                    console.error(err);
                    process.exit();
                });
        }

    }).catch(err => {
        errorhandler({err, fatal: true});
        process.exit();
    });
}