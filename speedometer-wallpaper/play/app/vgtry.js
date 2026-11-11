/*
 * VGTry: the JS API of a VGraphics product's web version (docs/try-online). The same contract serves Speedometer now
 * and Horologe later, so the site's play page and its shared "try" pieces talk only to this.
 *
 *   VGTry.isSupported()    false where the engine can't run (no WebAssembly GC): show the fallback at once
 *   const app = await VGTry.start({ host, base, look, layouts, onProgress });
 *     host        the element the wallpaper fills (its size is the phone's screen; a new size draws anew)
 *     base        where the engine's files are, ending in "/" ("" for this folder)
 *     look        a look from app.look() or a share link's hash; the page's hash when left out
 *     layouts     market layouts to know from the start, [{ code, data }] (data: the layout's format-1 JSON), so a
 *                 look with layout=<CODE> opens on it at once
 *     onProgress  called with { files, bytes } as the engine's files arrive
 *   app.catalog()          styles, layouts and settings to build the picker and settings from (WebCatalog.kt)
 *   app.values()           { style, layout, shared, source, values: { key: value } } for the shown style; while a
 *                          market layout shows, shared is true and layout is its code
 *   app.addLayout(code, data)    keeps a market layout under its code; false when its data can't be read;
 *                                code "replaces.<variationId>" keeps VHub's version of that style layout instead
 *   app.show(style, layout?)     layout: one of the style's own, or an added market layout's code; left out, a market
 *                                layout on show stays and is drawn in the new style
 *   app.set(key, value), app.mode("power" | "cpu_clock" | "gps_speed")   set("layout", <the style's own>) leaves
 *                                a market layout
 *   app.source("demo" | "gps")   the demo drive's speed, or the visitor's real GPS speed (the browser asks)
 *   app.look(), app.shareUrl()   the shown look as text and as a link to this page
 *   app.pause(), app.resume()    the page pauses it by itself while it is hidden or scrolled away
 *   app.hud.start({ style, layout, flip })   HUD mode (Speedometer docs/hud-mode): the canvas shows a neon style's
 *                          HUD layout instead of the wallpaper, flipped for the windscreen; the page makes the host full
 *                          screen around it. app.source("gps") gives it the visitor's real speed.
 *   app.hud.flip()         the next way the phone lies ("top_to_glass", "top_to_driver", "holder"), which it returns
 *   app.hud.stop()         back to the wallpaper
 *   app.on(event, fn)      "change", "style", "loading", "gps", "fps", "error", "hud" ({ flip }), "hudwarning" (the
 *                          speed has just gone over the limit: the page beeps); returns a function that stops it
 *   app.photo(kind, file)  (version 4) the photo on the shown layout's photo widget kind ("photo_frame", "photo_print",
 *                          "photo_round"): a File, Blob, ArrayBuffer or typed array of a JPEG, PNG, WebP or GIF, or
 *                          null to take it off. Resolves true once it shows, false for a kind that takes no photo or a
 *                          file that can't be read. The photo stays in this page's memory: never sent, saved or logged.
 *   app.photoPlace(kind, { focusX, focusY, zoom, caption })   (version 4) where the photo sits in its window (0..1 of
 *                          the photo, 0.5 the middle), how far it is zoomed in (1 to 4) and the instant print's line (up
 *                          to 32 letters); each one left out is its default (0.5, 0.5, 1, ""). false for a kind that
 *                          takes no photo or a number that isn't one.
 *
 *   const stills = await VGTry.stills({ base, onProgress });   still pictures for a page of cards, with no wallpaper
 *   stills.draw({ style, data, width, height })   one moment of the demo drive with the market layout data in that
 *                          style, width x height device pixels: resolves with the address of a PNG (revoke it with
 *                          URL.revokeObjectURL when the card goes), rejects when the layout can't be drawn
 *   stills.catalog()       as app.catalog()
 *
 *   const editor = await VGTry.editor({ host, base, style, data, variantKey, moment, playing, onProgress });
 *                          (version 3) the layout editor's live engine; see docs/try-online/README.md, "Editor API".
 *                          One per page; rejects with an Error saying why. stills() may run beside it. (version 4)
 *                          editor.photo and editor.photoPlace as app's; destroy() forgets the photos.
 *
 * start() and stills() reject when the engine can't run here (no WebAssembly GC: Safari before 18.2) or fails to load;
 * the page then shows its fallback. One engine serves a page: a page may start a wallpaper and draw stills too.
 */
(function () {
    'use strict';

    // A page whose parts each load this file (the landing's try block and its market cards) keeps the first one: a
    // second copy would load the engine twice.
    if (window.VGTry) {
        return;
    }

    var ENGINE_SCRIPT = 'speedometer.js';
    var ENGINE_TIMEOUT_MS = 45000;
    // The smallest module with a WebAssembly GC type (an empty struct): Kotlin/Wasm needs GC.
    var GC_PROBE = [0, 97, 115, 109, 1, 0, 0, 0, 1, 3, 1, 95, 0];
    var listeners = {};
    var engineLoad = null;
    var stillsLoad = null;

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

    /**
     * A photo for a photo widget as the engine takes it, an ArrayBuffer: a File's or Blob's bytes, an ArrayBuffer, a
     * typed array's bytes, or an empty one for null (the photo comes off). Read here, in the page, and sent nowhere.
     */
    function photoBytes(source) {
        if (source == null) {
            return Promise.resolve(new ArrayBuffer(0));
        }
        if (source instanceof ArrayBuffer) {
            return Promise.resolve(source);
        }
        if (ArrayBuffer.isView(source)) {
            return Promise.resolve(source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength));
        }
        if (typeof source.arrayBuffer === 'function') {
            return source.arrayBuffer();
        }
        return Promise.reject(new Error('photo() takes a File, a Blob, an ArrayBuffer, a typed array or null'));
    }

    function numberOr(value, fallback) {
        return typeof value === 'number' ? value : fallback;
    }

    /** photoPlace's call into the engine: each part left out is its default (the middle, not zoomed, no caption). */
    function placePhoto(engine, kind, place) {
        var chosen = place || {};
        return engine.photoPlace(
            String(kind),
            numberOr(chosen.focusX, 0.5),
            numberOr(chosen.focusY, 0.5),
            numberOr(chosen.zoom, 1),
            String(chosen.caption || '')
        );
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
            (options.layouts || []).forEach(function (layout) {
                engine.addLayout(String(layout.code), String(layout.data));
            });
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
        var isHud = false;

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
            // In HUD mode a tap is the page's (its Exit and Flip), never the wallpaper's.
            if (!canvas || isHud) {
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
            addLayout: function (code, data) {
                return engine.addLayout(String(code), String(data));
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
            hud: {
                start: function (options) {
                    var chosen = options || {};
                    isHud = true;
                    engine.hud(String(chosen.style || 'horizon'), String(chosen.layout || ''), String(chosen.flip || ''));
                },
                flip: function () {
                    return engine.hudFlip();
                },
                stop: function () {
                    isHud = false;
                    engine.hudStop();
                }
            },
            photo: function (kind, source) {
                return photoBytes(source).then(function (bytes) {
                    return engine.photo(String(kind), bytes);
                });
            },
            photoPlace: function (kind, place) {
                return placePhoto(engine, kind, place);
            },
            on: on
        };
    }

    /**
     * Still pictures of market layouts, for a page of cards: the engine's files load once, with no wallpaper on the
     * page, and each draw waits for the one before it (the engine draws them one at a time).
     */
    function stills(options) {
        var base = (options && options.base) || '';
        if (options && options.onProgress) {
            on('progress', options.onProgress);
        }
        if (!stillsLoad) {
            stillsLoad = load(base).then(function (engine) {
                var ready = new Promise(function (resolve, reject) {
                    var offReady = on('stills', function () {
                        offReady();
                        offError();
                        resolve();
                    });
                    var offError = on('error', function (data) {
                        offReady();
                        offError();
                        reject(new Error(data.message || 'The engine failed'));
                    });
                });
                engine.stills(base);
                return ready.then(function () {
                    return stillsApi(engine);
                });
            });
            stillsLoad.catch(function () {
                stillsLoad = null;
            });
        }
        return stillsLoad;
    }

    var editorActive = false;
    var MOMENTS = ['city', 'highway', 'charging', 'night'];
    var UNITS = ['kmh', 'mph'];
    var LOCALES = ['en', 'el'];
    var DIMS = ['none', 'night', 'aod'];
    var SCREENS = ['home', 'lock'];

    /**
     * The layout editor's engine (docs/try-online, "Editor API"): one live engine in options.host, the layout in
     * options.data drawn in options.style. Resolves with the editor once its first frame is drawn; rejects with an Error
     * saying why (no WebAssembly GC, files not loaded or started within 45 s, an unknown style or unreadable data, an
     * editor already running). One editor per page; stills() may run beside it and shares the loaded files.
     */
    function editor(options) {
        if (editorActive) {
            return Promise.reject(new Error('An editor is already running on this page: destroy() it first'));
        }
        if (!isSupported()) {
            return Promise.reject(new Error('This browser has no WebAssembly GC'));
        }
        if (!options || !options.host || typeof options.style !== 'string' || typeof options.data !== 'string') {
            return Promise.reject(new Error('editor() needs a host, a style id and the layout data'));
        }
        editorActive = true;
        var host = options.host;
        var base = options.base || '';
        var offs = [];
        var timer = null;
        var engineRef = null;
        var isStarted = false;

        function cleanUp() {
            clearTimeout(timer);
            offs.splice(0).forEach(function (off) {
                off();
            });
        }

        return new Promise(function (resolve, reject) {
            function fail(error) {
                cleanUp();
                if (engineRef && isStarted) {
                    engineRef.editorStop();
                }
                editorActive = false;
                reject(error);
            }

            timer = setTimeout(function () {
                fail(new Error('The editor did not start within 45 s'));
            }, ENGINE_TIMEOUT_MS);
            if (options.onProgress) {
                offs.push(on('progress', options.onProgress));
            }
            load(base).then(function (engine) {
                engineRef = engine;
                offs.push(on('error', function (data) {
                    fail(new Error(data.message || 'The engine failed'));
                }));
                offs.push(on('editorready', function () {
                    cleanUp();
                    resolve(editorApi(engine));
                }));
                isStarted = true;
                engine.editorStart(
                    host,
                    base,
                    options.style,
                    options.data,
                    String(options.variantKey || ''),
                    options.moment || 'city',
                    options.playing !== false
                );
            }, fail);
        });
    }

    function editorApi(engine) {
        var isDestroyed = false;
        var waiting = [];
        var offReport = on('editorreport', function (data) {
            waiting.splice(0).forEach(function (wait) {
                wait.resolve(data);
            });
        });

        function pick(value, allowed, fallback) {
            return allowed.indexOf(value) >= 0 ? value : fallback;
        }

        return {
            setLayout: function (data, variantKey) {
                if (isDestroyed || typeof data !== 'string') {
                    return false;
                }
                return engine.editorSetLayout(data, String(variantKey || ''));
            },
            style: function (id) {
                return !isDestroyed && engine.editorStyle(String(id));
            },
            moment: function (moment) {
                if (!isDestroyed && MOMENTS.indexOf(moment) >= 0) {
                    engine.editorMoment(moment);
                }
            },
            pause: function () {
                if (!isDestroyed) {
                    engine.pause();
                }
            },
            resume: function () {
                if (!isDestroyed) {
                    engine.resume();
                }
            },
            units: function (units) {
                if (!isDestroyed) {
                    engine.editorUnits(pick(units, UNITS, 'kmh'));
                }
            },
            locale: function (locale) {
                if (!isDestroyed) {
                    engine.editorLocale(pick(locale, LOCALES, 'en'));
                }
            },
            dim: function (dim) {
                if (!isDestroyed) {
                    engine.editorDim(pick(dim, DIMS, 'none'));
                }
            },
            screen: function (screen) {
                if (!isDestroyed) {
                    engine.editorScreen(pick(screen, SCREENS, 'home'));
                }
            },
            pixelRatio: function (ratio) {
                if (!isDestroyed && typeof ratio === 'number') {
                    engine.editorPixelRatio(ratio);
                }
            },
            report: function () {
                if (isDestroyed) {
                    return Promise.reject(new Error('The editor was destroyed'));
                }
                return new Promise(function (resolve, reject) {
                    waiting.push({ resolve: resolve, reject: reject });
                    engine.editorReport();
                });
            },
            catalog: function () {
                return JSON.parse(engine.catalog());
            },
            photo: function (kind, source) {
                if (isDestroyed) {
                    return Promise.reject(new Error('The editor was destroyed'));
                }
                return photoBytes(source).then(function (bytes) {
                    return !isDestroyed && engine.photo(String(kind), bytes);
                });
            },
            photoPlace: function (kind, place) {
                return !isDestroyed && placePhoto(engine, kind, place);
            },
            on: function (event, listener) {
                if (event !== 'error') {
                    return function () {};
                }
                return on('error', function (data) {
                    if (!isDestroyed) {
                        listener({ message: data.message || 'The engine failed' });
                    }
                });
            },
            destroy: function () {
                if (isDestroyed) {
                    return;
                }
                isDestroyed = true;
                offReport();
                waiting.splice(0).forEach(function (wait) {
                    wait.reject(new Error('The editor was destroyed'));
                });
                engine.editorStop();
                editorActive = false;
            }
        };
    }

    function stillsApi(engine) {
        var lastId = 0;
        var waiting = {};
        on('still', function (data) {
            var wait = waiting[data.id];
            if (!wait) {
                return;
            }
            delete waiting[data.id];
            if (data.url) {
                wait.resolve(data.url);
            } else {
                wait.reject(new Error(data.error || 'The still failed'));
            }
        });
        return {
            draw: function (request) {
                var id = ++lastId;
                return new Promise(function (resolve, reject) {
                    waiting[id] = { resolve: resolve, reject: reject };
                    engine.still(
                        id,
                        String(request.style),
                        String(request.data),
                        Math.max(1, Math.round(request.width)),
                        Math.max(1, Math.round(request.height))
                    );
                });
            },
            catalog: function () {
                return JSON.parse(engine.catalog());
            }
        };
    }

    window.VGTry = {
        version: 4,
        isSupported: isSupported,
        start: start,
        stills: stills,
        editor: editor,
        load: load,
        on: on
    };
}());
