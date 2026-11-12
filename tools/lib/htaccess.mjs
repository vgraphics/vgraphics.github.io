// The site's .htaccess on Hostinger (README "Hosting"): what GitHub Pages did for the site (HTTPS, the 404 page,
// addresses without .html), one-hop redirects for www and the old WordPress addresses (Search Console, 12 Nov 2026),
// its security headers, Unity's files and the caching. check-site fails when the file is missing, lost one of these
// rules or has them out of order; the Deployer checks them live after every upload, and tools/check-live.mjs the
// addresses Google reads.

/** Each rule the file must keep: what it does, and the lines that say it (comments and spacing aside). */
export const HTACCESS_RULES = [
  { what: 'no folder listings', lines: ['Options -Indexes'] },
  { what: 'index.html as the folder page', lines: ['DirectoryIndex index.html'] },
  { what: 'the 404 page', lines: ['ErrorDocument 404 /404.html'] },
  { what: 'the rewrite engine', lines: ['RewriteEngine On'] },
  {
    what: 'www to https:// on the bare domain in one hop (before the HTTPS redirect)',
    lines: ['RewriteCond %{HTTP_HOST} ^www\\.(.+)$ [NC]', 'RewriteRule ^ https://%1%{REQUEST_URI} [R=301,L,NE]'],
  },
  {
    what: 'the HTTPS redirect (that never loops behind the CDN)',
    lines: ['RewriteCond %{HTTPS} !=on', 'RewriteCond %{HTTP:X-Forwarded-Proto} !https', 'RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [R=301,L,NE]'],
  },
  {
    what: "the old WordPress addresses as one 301 each (Search Console: they are not pages, and /index.php isn't a 403)",
    lines: [
      'RewriteRule ^index\\.php/contact(/|/index\\.html)?$ https://vgraphics.gr/#contact [R=301,L,NE,QSD]',
      'RewriteRule ^index\\.php/about(-2)?(/|/index\\.html)?$ https://vgraphics.gr/company/ [R=301,L,QSD]',
      'RewriteRule ^index\\.php(/.*)?$ https://vgraphics.gr/ [R=301,L,QSD]',
    ],
  },
  {
    what: "Speedometer's two old key-art addresses as 301s to the pictures",
    lines: [
      'RewriteRule ^speedometer-wallpaper/img/key-art$ https://vgraphics.gr/speedometer-wallpaper/img/key-art-1920.jpg [R=301,L]',
      'RewriteRule ^speedometer-wallpaper/img/key-art-tall$ https://vgraphics.gr/speedometer-wallpaper/img/key-art-tall-1080.jpg [R=301,L]',
    ],
  },
  { what: 'no dotfiles but /.well-known/', lines: ['RewriteCond %{REQUEST_URI} !^/\\.well-known/', 'RewriteRule (^|/)\\. - [F]'] },
  { what: "no access to the site's tools", lines: ['RewriteRule ^tools(/|$) - [F]'] },
  { what: 'no source or secret files, and no PHP', lines: ['RewriteRule \\.(md|py|pyc|sh|ps1|bat|cmd|ts|tsx|map|env|ini|cfg|conf|log|bak|old|orig|swp|sql|sqlite|db|pem|key|crt|csr|p12|pfx|jks|keystore|php\\d?|phtml|phar)$ - [NC,F]'] },
  {
    what: 'versioned pictures (name.<hash>.ext) served from name.ext, and the request marked for the year-long cache',
    lines: ['RewriteRule ^(.+)\\.[0-9a-f]{8}\\.(avif|webp|jpe?g|png|gif|svg|ico)$ $1.$2 [NC,E=VERSIONED_IMAGE:1,L]'],
  },
  { what: 'addresses without .html (/x serves x.html)', lines: ['RewriteCond %{REQUEST_FILENAME} !-f', 'RewriteCond %{REQUEST_FILENAME}.html -f', 'RewriteRule ^(.*[^/])$ $1.html [L]'] },
  {
    what: 'a folder with no page answers 404, not the 403 of Options -Indexes',
    lines: ['RewriteCond %{REQUEST_FILENAME}/index.html !-f', 'RewriteRule ^ - [R=404,L]'],
  },
  { what: 'folders without their slash (/dir goes to /dir/)', lines: ['RewriteCond %{REQUEST_FILENAME} -d', 'RewriteRule ^(.*[^/])$ https://%{HTTP_HOST}/$1/ [R=301,L,NE]'] },
  { what: 'HSTS', lines: ['Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"'] },
  { what: 'nosniff', lines: ['Header always set X-Content-Type-Options "nosniff"'] },
  { what: 'the referrer policy', lines: ['Header always set Referrer-Policy "strict-origin-when-cross-origin"'] },
  { what: 'the permissions policy (geolocation for the try page)', lines: ['Header always set Permissions-Policy "geolocation=(self), fullscreen=(self), camera=(), microphone=(), accelerometer=(), gyroscope=(), magnetometer=()"'] },
  { what: 'framing by our own pages only', lines: ['Header always set X-Frame-Options "SAMEORIGIN"', 'Header always set Content-Security-Policy "frame-ancestors \'self\'"'] },
  { what: 'no X-Powered-By', lines: ['Header always unset X-Powered-By'] },
  { what: 'public files readable from other sites, as on GitHub Pages', lines: ['Header set Access-Control-Allow-Origin "*"'] },
  { what: 'scripts as text/javascript (LiteSpeed would send application/x-javascript)', lines: ['AddType text/javascript .js .mjs'] },
  { what: 'the WebAssembly type', lines: ['AddType application/wasm .wasm'] },
  { what: "Unity's Brotli files", lines: ['<FilesMatch "\\.br$">', 'Header set Content-Encoding br'] },
  { what: "Unity's gzip files", lines: ['<FilesMatch "\\.gz$">', 'Header set Content-Encoding gzip'] },
  { what: "Unity's compressed WebAssembly and scripts typed", lines: ['<FilesMatch "\\.wasm\\.(br|gz)$">', 'ForceType application/wasm', '<FilesMatch "\\.js\\.(br|gz)$">', 'ForceType application/javascript'] },
  { what: 'everything else cached ten minutes, as on Pages', lines: ['Header set Cache-Control "public, max-age=600, no-transform"'] },
  { what: 'pages revalidated on every visit', lines: ['<FilesMatch "\\.(html|json|txt|xml|tsv|webmanifest)$">', 'Header set Cache-Control "no-cache, no-transform"'] },
  { what: "Unity's files revalidated (their names stay the same)", lines: ['<FilesMatch "(\\.(unityweb|wasm|br|gz)|\\.loader\\.js)$">'] },
  { what: 'hashed files cached for a year', lines: ['<FilesMatch "(\\.[0-9a-f]{8,}|^[0-9a-f]{16,})\\.[A-Za-z0-9]+$">', 'Header set Cache-Control "public, max-age=31536000, immutable, no-transform"'] },
  {
    what: 'versioned pictures cached for a year (marked by the rewrite and by SetEnvIf; an unversioned picture never gets it)',
    lines: [
      'SetEnvIfNoCase Request_URI "\\.[0-9a-f]{8}\\.(avif|webp|jpe?g|png|gif|svg|ico)$" VERSIONED_IMAGE=1',
      'Header set Cache-Control "public, max-age=31536000, immutable, no-transform" env=VERSIONED_IMAGE',
      'Header set Cache-Control "public, max-age=31536000, immutable, no-transform" env=REDIRECT_VERSIONED_IMAGE',
    ],
  },
  {
    what: "the map tiles' cache and CORS for Range requests",
    lines: [
      '<FilesMatch "\\.pmtiles$">',
      'Header set Access-Control-Allow-Origin "https://vgraphics.gr"',
      'Header set Access-Control-Allow-Headers "Range"',
      'Header set Access-Control-Expose-Headers "Content-Range, Content-Length, ETag"',
    ],
  },
]

/** Rules that only work in this order (mod_rewrite stops at the first redirect): each pair's first line must come
 * before its second. */
export const HTACCESS_ORDER = [
  {
    what: 'www before the HTTPS redirect, or http://www. takes two hops',
    first: 'RewriteRule ^ https://%1%{REQUEST_URI} [R=301,L,NE]',
    then: 'RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [R=301,L,NE]',
  },
  {
    what: 'the old WordPress redirects before the "no PHP" rule, or /index.php answers 403',
    first: HTACCESS_RULES.find((r) => r.what.startsWith('the old WordPress addresses')).lines[2],
    then: HTACCESS_RULES.find((r) => r.what === 'no source or secret files, and no PHP').lines[0],
  },
  {
    what: 'the 404 for a folder with no page before the slash redirect, or /folder goes to /folder/ first',
    first: 'RewriteRule ^ - [R=404,L]',
    then: 'RewriteRule ^(.*[^/])$ https://%{HTTP_HOST}/$1/ [R=301,L,NE]',
  },
]

/** The file's directives, one per line, trimmed, without comments or blank lines. */
export const directives = (text) =>
  text
    .replace(/^﻿/, '')
    .split(/\r?\n/)
    .map((l) => l.trim().replace(/\s+/g, ' '))
    .filter((l) => l && !l.startsWith('#'))

/** A Cache-Control the file sets. Hostinger's CDN rewrites what isn't marked no-transform: it re-encodes images (and
 * strips their XMP rights) and minifies text, so the files served stop being the repo's. */
const CACHE_CONTROL = /^Header (?:always |onsuccess )?(?:set|append|merge|add|setifempty) Cache-Control (.+)$/i

/** What is wrong with the site's .htaccess (`text`, undefined when there is none): one line per rule it lost, and one
 * per Cache-Control without no-transform. */
export function htaccessProblems(text) {
  if (text === undefined) return ['missing: the site on Hostinger needs it for HTTPS, its 404 page, addresses without .html, its security headers, Unity and caching']
  const lines = directives(text)
  const have = new Set(lines)
  const lost = HTACCESS_RULES.filter((r) => r.lines.some((l) => !have.has(l))).map((r) => `lost ${r.what}: ${r.lines.filter((l) => !have.has(l)).join(' | ')}`)
  const transformable = lines
    .filter((l) => CACHE_CONTROL.test(l) && !/\bno-transform\b/i.test(l.match(CACHE_CONTROL)[1]))
    .map((l) => `a Cache-Control without no-transform (Hostinger's CDN would re-encode images and minify text): ${l}`)
  const misordered = HTACCESS_ORDER.filter((o) => have.has(o.first) && have.has(o.then) && lines.indexOf(o.first) > lines.indexOf(o.then)).map(
    (o) => `out of order: ${o.what}`,
  )
  return [...lost, ...misordered, ...transformable]
}
