window.addEventListener('load', function () {
    document.querySelector('.loading_screen').style.transition = 'all 2s ease-in-out';

    setTimeout(function () {
        document.querySelector('.loading_screen').style.animation = 'loading_out 1s ease-in-out';
        setTimeout(function () {
            document.querySelector('.loading_screen').remove();
        }, 1000);
    }, 100);
});
