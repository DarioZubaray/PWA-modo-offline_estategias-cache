
const CACHE_STATIC_NAME = 'static-v1';
const CACHE_DYNAMIC_NAME = 'dynamic-v1';
const CACHE_INMUTABLE_NAME = 'inmutable-v1';

self.addEventListener('install', e => {
    const cacheStaticInstall = caches.open(CACHE_STATIC_NAME).then( cache => {
        return cache.addAll([
            '/',
            '/index.html',
            '/css/style.css',
            '/img/main.jpg',
            '/js/app.js'
        ]);
    });
    const cacheInmutableInstall = caches.open(CACHE_INMUTABLE_NAME).then( cache => {
        return cache.add('https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css');
    });

    e.waitUntill(Promise.all([cacheStaticInstall, cacheInmutableInstall]));
});

//Estrategias
self.addEventListener('fetch', e => {

    // 1 - CACHE ONLY
    // e.respondWith( caches.match( e.request) );

    // 2- CACHE WITH NETWORK FALLBACK /THEN CACHE
    const respuestaCache = caches.match( e.request ).then( resp => {
        if(resp) return resp;

        console.log('No existe el archivo, buscando en la web');
        return fetch(e.request).then(newResp => {
            caches.open(CACHE_DYNAMIC_NAME).then( cache => {
                cache.put(e.request, newResp);
            });
            return newResp.clone();
        });
    });

    e.respondWith(respuestaCache);

})