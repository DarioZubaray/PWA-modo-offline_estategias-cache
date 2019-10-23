

if ( navigator.serviceWorker ) {
    navigator.serviceWorker.register('/sw.js');
}

if (window.caches) {
    caches.open('prueba-1');
    caches.open('prueba-2');
    caches.open('prueba-3');

    caches.has('prueba-3').then(console.log);
    caches.delete('prueba-3').then(console.log);


    caches.open('cache-v1.0.0').then(cache => {

        // agregar archivos al cache
        cache.addAll([
            '/index.html',
            '/css/style.css',
            '/img/main.jpg'
        ]).then( () => {
            // reemplazar un cache
            cache.put('index.html', new Response('Hola juli'));

            // borrar un cache
            cache.delete('/css/style.css');
        });

        // obtener un cache
        cache.match('index.html').then( resp => {
            if(resp) {
                resp.text().then(console.log);
            } else {
                console.log('No se pudo obtener el index.html del cache');
            }
        });
    });

    // obtener el nombre de todos los caches
    caches.keys().then(console.log);
}