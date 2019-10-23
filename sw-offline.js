

self.addEventListener('fetch', event => {
    const offlineResponse = fetch('pages/offline.html').then(resp => resp.text());
    const respuesta = fetch(event.request).catch( () => offlineResponse);

    event.respondWith(respuesta);
});
