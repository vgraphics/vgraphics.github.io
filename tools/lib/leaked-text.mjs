// Words a script leaks into a page when it prints a value it never had: the literal "undefined" (Palermo's journey
// tip cards printed it before their fix, Platform job 26 C, from Palermo). check-site fails any page whose visible text
// holds one. Visible text is what a visitor reads: the page without its scripts (JSON-LD and page data too), styles,
// comments, SVG, templates and tags, so an attribute or a code sample inside a script never counts; the <title> does.

/** The page's visible text, one string, tags and entities left as they are. */
export function visibleText(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<(script|style|svg|template)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
}

/** The leaked words in a page's visible text, each with the words around it, as strings ("tip: undefined card"). */
export function leakedText(html) {
  const text = visibleText(html).replace(/\s+/g, ' ')
  return [...text.matchAll(/(?<![\w-])undefined(?![\w-])/g)].map((m) => text.slice(Math.max(0, m.index - 24), m.index + 'undefined'.length + 24).trim())
}
