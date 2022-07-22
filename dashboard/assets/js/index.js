window.addEventListener('load', function() {

    document.getElementById('cooldownrange').addEventListener('input', function() {
        const cooldownrange_output = document.getElementById('cooldownrange_output');

        cooldownrange_output.innerHTML = cooldownrange.value;
    })
})