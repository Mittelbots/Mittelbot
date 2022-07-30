import {Notification} from '../notification.js';

window.addEventListener('onChanges', function (evt) {
    const {changes, isDataChanged} = evt.detail;

    if(isDataChanged) {
        const changedData = changes.filter(data => data.hasChanged)

        var module;
        var settings = [];
        var type;
        var guild_id;
        for(let i in changedData) {
            module = changedData[i].cid.split('_')[0];
            if(module === 'wc') module = 'welcome_channel';

            type = changedData[i].cid.split('_')[1];

            settings = changedData[i].NewValue;

            if(type == 'color') settings = settings.replace('#', '');

            guild_id = changedData[i].cid.split('_')[2];

            changedData[i].hasChanged = false;
        }

        const request = new XMLHttpRequest();

        request.onreadystatechange = function() {

            if(this.status === 200) {
                new Notification('Settings saved', true).show();
            }
        }
        request.open('POST', `/api/change/${module}/${settings}/${type}/${guild_id}`);
        request.setRequestHeader('Content-Type', 'application/json');
        request.send();
    }
});