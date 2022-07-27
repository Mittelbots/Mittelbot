window.addEventListener('load', function () {

    try {
        document.getElementById('cooldownrange').addEventListener('input', function () {
            const cooldownrange_output = document.getElementById('cooldownrange_output');

            cooldownrange_output.innerHTML = cooldownrange.value;
        })
    } catch (e) {}

    document.getElementById('wc_joinrole_select').addEventListener('change', function () {
        handlerJoinRoleSelect();
    })
    
    function handlerJoinRoleSelect() {
        document.querySelectorAll('.joinrole_selected').forEach(function (element) {
            element.addEventListener('click', function () {
                const joinrole_select = document.getElementById('wc_joinrole_select');
                const role_id = element.getAttribute('data-id');

                this.remove();

                for (let i in joinrole_select.options) {
                    try {
                        if (joinrole_select.options[i].value == role_id) {
                            joinrole_select.options[i].disabled = false;
                        }
                    } catch (e) {}
                }
            })
        });
    }
})