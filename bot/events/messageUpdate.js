const Auditlog = require('~utils/classes/Auditlog');
const sm = require('string-mismatch');
const greedyInstance = new sm.Greedy();

function showResult(diffs) {
    return diffs.reduce(function (text, value) {
        function escapeRegExp(string) {
            return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
        }

        value.value = value.value.replace(new RegExp(escapeRegExp('`'), 'g'), '\\`');
        value.value = value.value.replace(new RegExp(escapeRegExp('~'), 'g'), '\\~');
        value.value = value.value.replace(new RegExp(escapeRegExp('*'), 'g'), '\\*');

        switch (value.type) {
            case 'del':
                return text + '~~' + value.value + '~~';
            case 'ins':
                return text + '**' + value.value + '**';
            case 'sub':
                return text + '**' + value.value + '**';
            case 'eql':
                return text + value.value;
        }
    }, '');
}

module.exports.messageUpdate = async (bot, messageBefore, messageAfter) => {
    if (messageBefore.content === messageAfter.content) return;
    if (
        messageBefore == null ||
        messageAfter == null ||
        messageBefore.content == null ||
        messageAfter.content == null
    ) {
        return;
    }
    const auditLog = new Auditlog();
    const isEnabled = await auditLog.checkEnabledEvents(messageBefore.guild.id, 'message_update');
    if (!isEnabled) return;
    await auditLog.init(bot, messageBefore.guild.id, true);

    const cleanedMessage = (text) => {
        if (text.length > 1024) {
            return text.slice(0, 1021) + '...';
        } else {
            return text;
        }
    };

    const before = cleanedMessage(messageBefore.content);
    const after = cleanedMessage(messageAfter.content);

    const difference = greedyInstance.differences(before, after);

    await auditLog.setEmbed({
        color: '#36d30a',
        text: global.t.trans([
            'info.admin.messageUpdate',
            messageAfter.author.id,
            messageAfter.channelId,
            messageAfter.guildId,
            messageAfter.channelId,
            messageAfter.id,
            before,
            showResult(difference),
        ]),
    });
    await auditLog.sendToAuditLog({
        guildId: messageBefore.guild.id,
        target: messageBefore,
        type: 'messagelog',
    });
};
