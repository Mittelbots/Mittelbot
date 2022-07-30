import {Notification} from './notification.js';

window.addEventListener('load', function () {

    try {
        document.getElementById('cooldownrange').addEventListener('input', function () {
            const cooldownrange_output = document.getElementById('cooldownrange_output');

            cooldownrange_output.innerHTML = cooldownrange.value;
        })
    } catch (e) {}

    try {
    document.getElementById('wc_joinrole_select').addEventListener('change', function () {
        
        let roleId = this.value;
        let newDiv = document.createElement('div');
        newDiv.className = 'joinrole_selected';
        newDiv.innerHTML =  this.options[this.selectedIndex].text;
        newDiv.dataset.id = roleId;
        document.getElementById('joinroles_selected').appendChild(newDiv);
        this.options[this.selectedIndex].disabled = true;

        handlerJoinRoleSelect();
    });
    } catch (e) {}

    try {
    handlerJoinRoleSelect();
    function handlerJoinRoleSelect() {
        document.querySelectorAll('.joinrole_selected').forEach(function (element) {
            element.addEventListener('click', function () {
                const joinrole_select = document.getElementById('wc_joinrole_select');
                const role_id = element.getAttribute('data-id');

                this.remove();

                const options = joinrole_select.options;

                for(let i = 1; i < options.length; i++) {
                    if(options[i].value == role_id) {
                        options[i].disabled = false;
                    }
                }
            })
        });
    }
    } catch (e) {}

    try {
        document.getElementById('wc_settings_red').addEventListener('click', function (evt) {
            if(evt.target.tagName === 'INPUT') return;
            
            location.href = document.body.dataset.guildid + '?settings=welcome';
        })
    } catch (e) {}
})

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
        console.log(`${module}/${settings}/${type}/${guild_id}`)
        request.open('POST', `/api/change/${module}/${settings}/${type}/${guild_id}`);
        request.setRequestHeader('Content-Type', 'application/json');
        request.send();
    }
});