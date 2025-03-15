// script.js
document.getElementById('register-sw').addEventListener('click', function() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js')
            .then(function(registration) {
                console.log('Service Worker registered with scope: ', registration.scope);
            })
            .catch(function(error) {
                console.log('Service Worker registration failed: ', error);
            });
    } else {
        console.log('Service Workers are not supported in this browser.');
    }
});