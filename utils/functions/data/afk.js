module.exports.userAFK = [];

module.exports.handlerAFKInput = ({main_interaction}) => {
    const reason = main_interaction.fields.fields.get('afk_reason').value || 'No reason given.';

    const obj = {
        user_id: main_interaction.user.id,
        reason: reason,
        time: new Date().getTime()
    }

    this.userAFK.push(obj);

    return main_interaction.reply({
        content: `✅ You are now afk. \`Reason: ${reason}\``,
        ephemeral: true
    }).catch(err => {})
}