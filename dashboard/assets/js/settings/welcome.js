import { Notification } from '../notification.js';

import { getCJChanges } from '../modules/changerjs/changer.js';

window.addEventListener('load', function () {
    document.getElementById('wc_save').addEventListener('click', async (el) => {
        const { error, changes, isDataChanged } = getCJChanges(el);

        if (error) {
            new Notification('Something went wrong. Please report it to the developer.', false);
            return;
        }
        if (isDataChanged) {
            const changedData = changes.filter((data) => data.hasChanged);

            if (changedData.length === 0) {
                new Notification('Nothing has changed!', false).show();
                return;
            }

            for (let i = 0; i < changedData.length; i++) {
                let module = changedData[i].cid.split('_')[0];
                if (module === 'wc') module = 'welcome_channel';

                let type = changedData[i].cid.split('_')[1];

                let settings = changedData[i].NewValue;

                if (type == 'color') settings = settings.replace('#', '');

                let guild_id = document.body.dataset.guildid;

                changedData[i].hasChanged = false;

                const request = new XMLHttpRequest();

                request.onreadystatechange = function () {
                    if (this.status === 200) {
                        new Notification('Settings saved', true).show();
                    }
                    if (this.status === 401) {
                        new Notification("You don't have permissions to do this.", false).show();
                    }
                };
                request.open('POST', `/api/change/${module}/${settings}/${type}/${guild_id}`);
                request.setRequestHeader('Content-Type', 'application/json');
                request.setRequestHeader('Referrer-Policy', 'same-origin');
                request.send();

                await setTimeout(() => {
                    return true;
                }, 500);
            }
        }
    });

    let newJoinRoles = [];
    let oldJoinRoles = [];

    joinRoleSelected();

    function joinRoleSelected() {
        document.querySelectorAll('.joinrole_selected').forEach((div) => {
            newJoinRoles = [];
            oldJoinRoles = [];
            newJoinRoles.push(div.dataset.jrid);
            oldJoinRoles.push(div.dataset.jrid);
        });
    }

    document.getElementById('wc_joinrole_select').addEventListener('change', function () {
        let roleId = this.value;
        let newDiv = document.createElement('div');
        newDiv.className = 'joinrole_selected';
        newDiv.innerHTML = this.options[this.selectedIndex].text;
        newDiv.dataset.jrid = roleId;
        document.getElementById('joinroles_selected').appendChild(newDiv);
        this.options[this.selectedIndex].disabled = true;

        this.options[0].selected = true;

        newJoinRoles.push(roleId);

        handlerJoinRoleSelect();
    });

    handlerJoinRoleSelect();

    function handlerJoinRoleSelect() {
        document.querySelectorAll('.joinrole_selected').forEach(function (element) {
            element.addEventListener('click', function () {
                const joinrole_select = document.getElementById('wc_joinrole_select');
                const role_id = element.getAttribute('data-jrid');

                this.remove();

                const options = joinrole_select.options;

                for (let i = 1; i < options.length; i++) {
                    if (options[i].value == role_id) {
                        options[i].disabled = false;
                    }
                }

                for (let i in newJoinRoles) {
                    if (newJoinRoles[i] == role_id) {
                        newJoinRoles.splice(i, 1);
                    }
                }
            });
        });
    }

    function arraysEqual(a, b) {
        if (a === b) return true;
        if (a == null || b == null) return false;
        if (a.length !== b.length) return false;

        for (var i = 0; i < a.length; ++i) {
            if (a[i] !== b[i]) return false;
        }
        return true;
    }

    document.getElementById('joinroles_save').addEventListener('click', function () {
        if (arraysEqual(newJoinRoles, oldJoinRoles)) {
            new Notification('Nothing has changed!', false).show();
            return;
        }

        const request = new XMLHttpRequest();

        request.onreadystatechange = function () {
            if (this.status === 200) {
                joinRoleSelected;
                new Notification('Settings saved', true).show();
            }
        };
        request.open(
            'POST',
            `/api/change/joinroles/${JSON.stringify(newJoinRoles)}/null/${
                document.body.dataset.guildid
            }`
        );
        request.setRequestHeader('Content-Type', 'application/json');
        request.setRequestHeader('Referrer-Policy', 'same-origin');
        request.send();
    });
});
