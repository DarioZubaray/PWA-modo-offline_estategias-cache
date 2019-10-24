
const CACHE_STATIC_NAME = 'static-v1';
const CACHE_DYNAMIC_NAME = 'dynamic-v1';
const CACHE_DYNAMIC_LIMIT = 5;
const CACHE_INMUTABLE_NAME = 'inmutable-v1';

function limpiarCache(cacheName, numeroItems) {
    caches.open(cacheName).then( cache => {
        return caches.keys().then(keys => {
            if (keys.length >= numeroItems) {
                cache.delete(keys[0]).then(limpiarCache(cacheName, numeroItems));
            }
        });
    });
}

self.addEventListener('install', e => {
    const cacheStaticInstall = caches.open(CACHE_STATIC_NAME).then( cache => {
        return cache.addAll([
            '/',
            '/index.html',
            '/css/style.css',
            '/img/main.jpg',
            '/img-no-img.jpg',
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
    /*
    const respuestaCache = caches.match( e.request ).then( resp => {
        if(resp) return resp;

        console.log('No existe el archivo, buscando en la web');
        return fetch(e.request).then(newResp => {
            caches.open(CACHE_DYNAMIC_NAME).then( cache => {
                cache.put(e.request, newResp);
                limpiarCache(CACHE_DYNAMIC_NAME, CACHE_DYNAMIC_LIMIT);
            });
            return newResp.clone();
        });
    });

    e.respondWith(respuestaCache);
    */

    // 3- NETWORK WITH CACHE FALLBACK
    /*
    const respuestaNetwork =fetch(e.request).then(res => {
        if( ! res ) return  caches.match(e.request); // o responder no-image

        caches.open(CACHE_DYNAMIC_NAME).then(cache => {
            cache.put(e.request, res);
            limpiarCache(CACHE_DYNAMIC_NAME, CACHE_DYNAMIC_LIMIT);
        });
        return res.clone();
    }).catch(error => {
        console.log('error fetch', error);
        return caches.match(e.request);
    });

    e.respondWith(respuestaNetwork);
    */

    // 4- Cache with Network update (Rendimiento critico - version desfazada, 1 atras)

    /*
    if(respuestaCache.request.url.contains('bootstrap')) {
        return caches.match(e.request);
    }

    const respuestaCache = caches.open(CACHE_STATIC_NAME).then(cache => {
        fetch(e.request).then(newResp => {
            cache.put(e.request, newResp);
        });
        return cache.match(e.request);
    });
    e.respondWith(respuestaCache);
    */

    // 5 - Cache and Network race

    const respuestaRace = new Promise( (resolve, reject) => {
        let rechazada = false;
        const falloUnaVez = () => {
            if (rechazada) {
                if (/\.(png|jpg).$/i.test(e.request.url)) {
                    resolve(caches.match('/img/no-img.jpg'))
                } else {
                    reject('No se encontro respuesta');
                }

            } else {
                rechazada = true;
            }
        }

        fetch( e.request ).then(resp => {
            return resolve.ok ? resolve(resp) : falloUnaVez();
        }).catch(falloUnaVez);

        caches.match(e.request).then(resp => {
            return resp ? resolve(resp) : falloUnaVez();
        }).catch(falloUnaVez);
    });

    e.respondWith(respuestaRace);

});
