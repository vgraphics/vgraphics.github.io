/*
 * VGTry: the JS API of a VGraphics product's web version (docs/try-online). The same contract serves Speedometer now
 * and Horologe later, so the site's play page and its shared "try" pieces talk only to this.
 *
 *   VGTry.isSupported()    false where the engine can't run (no WebAssembly GC): show the fallback at once
 *   const app = await VGTry.start({ host, base, look, onProgress });
 *     host        the element the wallpaper fills (its size is the phone's screen; a new size draws anew)
 *     base        where the engine's files are, ending in "/" ("" for this folder)
 *     look        a look from app.look() or a share link's hash; the page's hash when left out
 *     onProgress  called with { files, bytes } as the engine's files arrive
 *   app.catalog()          styles, layouts and settings to build the picker and settings from (WebCatalog.kt)
 *   app.values()           { style, layout, source, values: { key: value } } for the shown style
 *   app.show(style, layout?), app.set(key, value), app.mode("power" | "cpu_clock" | "gps_speed")
 *   app.source("demo" | "gps")   the demo drive's speed, or the visitor's real GPS speed (the browser asks)
 *   app.look(), app.shareUrl()   the shown look as text and as a link to this page
 *   app.pause(), app.resume()    the page pauses it by itself while it is hidden or scrolled away
 *   app.on(event, fn)      "change", "style", "loading", "gps", "fps", "error"; returns a function that stops it
 *
 * start() rejects when the engine can't run here (no WebAssembly GC: Safari before 18.2) or fails to load; the page
 * then shows its fallback.
 */
(function () {
    'use strict';

    var ENGINE_SCRIPT = 'speedometer.js';
    var ENGINE_TIMEOUT_MS = 45000;
    // The smallest module with a WebAssembly GC type (an empty struct): Kotlin/Wasm needs GC.
    var GC_PROBE = [0, 97, 115, 109, 1, 0, 0, 0, 1, 3, 1, 95, 0];
    var listeners = {};
    var engineLoad = null;

    window.addEventListener('vgtry', function (event) {
        var detail = event.detail || {};
        var data = {};
        try {
            data = JSON.parse(detail.data || '{}');
        } catch (e) {
            data = {};
        }
        (listeners[detail.type] || []).slice().forEach(function (listener) {
            try {
                listener(data);
            } catch (e) {
                console.error(e);
            }
        });
    });

    function on(type, listener) {
        (listeners[type] = listeners[type] || []).push(listener);
        return function off() {
            listeners[type] = (listeners[type] || []).filter(function (each) {
                return each !== listener;
            });
        };
    }

    function next(type) {
        return new Promise(function (resolve) {
            var off = on(type, function (data) {
                off();
                resolve(data);
            });
        });
    }

    /** Whether this browser runs Kotlin/Wasm: WebAssembly with GC (Chrome 119, Firefox 120, Safari 18.2 and later). */
    function isSupported() {
        if (typeof WebAssembly !== 'object' || typeof WebAssembly.validate !== 'function') {
            return false;
        }
        try {
            return WebAssembly.validate(new Uint8Array(GC_PROBE));
        } catch (e) {
            return true;
        }
    }

    /** Loads the engine's script once; resolves with window.VGTryEngine when Kotlin has made it. */
    function load(base) {
        if (window.VGTryEngine) {
            return Promise.resolve(window.VGTryEngine);
        }
        if (!engineLoad) {
            engineLoad = new Promise(function (resolve, reject) {
                if (!isSupported()) {
                    reject(new Error('This browser has no WebAssembly GC'));
                    return;
                }
                var timer = setTimeout(function () {
                    reject(new Error('The engine did not start in time'));
                }, ENGINE_TIMEOUT_MS);
                on('engine', function () {
                    clearTimeout(timer);
                    resolve(window.VGTryEngine);
                });
                var script = document.createElement('script');
                script.src = base + ENGINE_SCRIPT;
                script.onerror = function () {
                    clearTimeout(timer);
                    reject(new Error('Could not load ' + script.src));
                };
                document.head.appendChild(script);
            });
        }
        return engineLoad;
    }

    function start(options) {
        var host = options.host;
        var base = options.base || '';
        var look = options.look != null ? options.look : (location.hash || '').replace(/^#/, '');
        if (options.onProgress) {
            on('progress', options.onProgress);
        }
        return load(base).then(function (engine) {
            var failed = new Promise(function (resolve, reject) {
                var off = on('error', function (data) {
                    off();
                    reject(new Error(data.message || 'The engine failed'));
                });
            });
            var ready = next('ready');
            engine.start(host, base, look);
            return Promise.race([ready, failed]).then(function (info) {
                return app(engine, host, info);
            });
        });
    }

    function app(engine, host, info) {
        var isHidden = false;
        var isOffScreen = false;
        var isPausedByPage = false;

        function update() {
            if (isHidden || isOffScreen || isPausedByPage) {
                engine.pause();
            } else {
                engine.resume();
            }
        }

        document.addEventListener('visibilitychange', function () {
            isHidden = document.hidden;
            update();
        });
        if (window.IntersectionObserver) {
            new IntersectionObserver(function (entries) {
                isOffScreen = !entries[entries.length - 1].isIntersecting;
                update();
            }).observe(host);
        }
        // A tap on the big gauge switches its mode, as on the phone. Measured on the canvas, inside any border.
        host.addEventListener('click', function (event) {
            var canvas = host.querySelector('canvas');
            if (!canvas) {
                return;
            }
            var box = canvas.getBoundingClientRect();
            engine.tap(event.clientX - box.left, event.clientY - box.top);
        });

        return {
            info: info,
            catalog: function () {
                return JSON.parse(engine.catalog());
            },
            values: function () {
                return JSON.parse(engine.values());
            },
            look: function () {
                return engine.look();
            },
            shareUrl: function () {
                return location.origin + location.pathname + '#' + engine.look();
            },
            show: function (style, layout) {
                engine.show(style, layout || '');
            },
            set: function (key, value) {
                engine.set(key, String(value));
            },
            mode: function (mode) {
                engine.set('mode', mode);
            },
            source: function (source) {
                engine.source(source);
            },
            pause: function () {
                isPausedByPage = true;
                update();
            },
            resume: function () {
                isPausedByPage = false;
                update();
            },
            on: on
        };
    }

    window.VGTry = {
        version: 1,
        isSupported: isSupported,
        start: start,
        load: load,
        on: on
    };
}());
