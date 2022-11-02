window.addEventListener('load', function () {
    try {
        document.getElementById('cooldownrange').addEventListener('input', function () {
            const cooldownrange_output = document.getElementById('cooldownrange_output');

            cooldownrange_output.innerHTML = cooldownrange.value;
        });
    } catch (e) {}

    try {
        document.getElementById('wc_settings_red').addEventListener('click', function (evt) {
            if (evt.target.tagName === 'INPUT') return;

            location.href = document.body.dataset.guildid + '?settings=welcome';
        });
    } catch (e) {}
});
