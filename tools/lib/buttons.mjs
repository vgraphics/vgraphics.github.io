// A page rule that outranks a button's own (George, 29 Oct 2026, on /exitwise/ranking/'s error state: "The button shows
// no text. Check it."): exitwise/ranking/ranking.css reset every button on the board with `.ranking button { color:
// inherit }`, one class and one element, which outranks assets/product.css's `.btn { color: var(--cta-ink) }`, one class,
// whatever order the sheets load in, so the Try again button drew Exitwise's ink on its ink-coloured face.
//
// check-site finds the buttons of each page (an a or a button carrying a button class: .btn, .btn-primary, .play-cta,
// .ost-btn and the like), in its markup or put by one of its scripts into one of its elements (ranking.js writes its
// Try again into #state-actions, inside .ranking), and fails a rule of the page's stylesheets that styles every link or
// button of a box holding one (`.box a`, `.box button`) and outranks the button's own rule for the same property. Such a
// rule leaves the buttons out, with `:where(:not(.btn))` on its element (it keeps its weight) or with :where() around
// its element (`.box :where(a, button)` weighs one class, so the button classes written after it win).
//
// It reads selectors the way a browser weighs them, but places elements by class alone: a rule fits an element when the
// classes of the rule's boxes are all on the element's ancestors, whatever the combinators and ids say.

/** The specificity of one selector (no top-level commas): [ids, classes, elements]. */
export function specificity(selector) {
  let s = selector.replace(/::?(before|after|first-line|first-letter|marker|placeholder|selection|backdrop|file-selector-button)\b/g, '')
  const total = [0, 0, 0]
  const add = (v) => { total[0] += v[0]; total[1] += v[1]; total[2] += v[2] }
  // :where() weighs nothing; :is(), :not() and :has() weigh their heaviest argument.
  for (;;) {
    const m = /:(where|is|not|has|matches|-webkit-any)\(/.exec(s)
    if (!m) break
    const open = m.index + m[0].length
    let depth = 1, i = open
    for (; i < s.length && depth; i++) depth += s[i] === '(' ? 1 : s[i] === ')' ? -1 : 0
    if (m[1] !== 'where') add(splitList(s.slice(open, i - 1)).map(specificity).reduce((a, b) => (compare(a, b) >= 0 ? a : b), [0, 0, 0]))
    s = s.slice(0, m.index) + ' ' + s.slice(i)
  }
  s = s.replace(/\[[^\]]*\]/g, () => { total[1]++; return ' ' })
  s = s.replace(/:[-\w]+(\([^)]*\))?/g, () => { total[1]++; return ' ' })
  s = s.replace(/#[-\w]+/g, () => { total[0]++; return ' ' })
  s = s.replace(/\.[-\w]+/g, () => { total[1]++; return ' ' })
  s = s.replace(/&/g, () => { total[1]++; return ' ' }) // a nested rule's parent: a class at least
  for (const _ of s.matchAll(/(?<![-\w])[a-z][-\w]*/gi)) total[2]++
  return total
}

/** Orders two specificities: positive when a outranks b. */
export function compare(a, b) {
  return a[0] - b[0] || a[1] - b[1] || a[2] - b[2]
}

/** A selector list split at its top-level commas. */
export function splitList(list) {
  const out = []
  let depth = 0, start = 0
  for (let i = 0; i < list.length; i++) {
    const c = list[i]
    if (c === '(' || c === '[') depth++
    else if (c === ')' || c === ']') depth--
    else if (c === ',' && !depth) { out.push(list.slice(start, i).trim()); start = i + 1 }
  }
  out.push(list.slice(start).trim())
  return out.filter(Boolean)
}

/** Where a selector's last compound (what it styles) starts. */
function lastCompound(selector) {
  let depth = 0, cut = 0
  for (let i = 0; i < selector.length; i++) {
    const c = selector[i]
    if (c === '(' || c === '[') depth++
    else if (c === ')' || c === ']') depth--
    else if (!depth && /[\s>+~]/.test(c)) cut = i + 1
  }
  return cut
}

/** The classes a compound asks for, leaving out those it excludes. */
const classesOf = (part) => [...part.replace(/:not\([^)]*\)/g, '').replace(/\[[^\]]*\]/g, '').matchAll(/\.([-\w]+)/g)].map((m) => m[1])

/** The properties a page rule must not take over from a button, by the name a button's own rule may set them under. */
const DRAWN = { color: 'color', background: 'background', 'background-color': 'background', font: 'font', 'font-family': 'font',
  'font-size': 'font', 'font-weight': 'font' }

/**
 * The rules of a stylesheet (`from` names it), one per selector: what it weighs, the properties it draws, the classes of
 * its boxes, and what it styles: a bare a or button (`elements`), or elements carrying `classes`.
 */
export function rulesOf(css, from = '') {
  const rules = []
  css = css.replace(/\/\*[\s\S]*?\*\//g, '')
  for (const [, head, body] of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const list = head.slice(head.lastIndexOf(';') + 1) // a nested rule comes after its parent's declarations
    if (list.trim().startsWith('@')) continue
    const props = [...new Set(body.split(';').map((d) => DRAWN[d.slice(0, d.indexOf(':')).trim().toLowerCase()]).filter(Boolean))]
    if (!props.length) continue
    for (const selector of splitList(list)) {
      if (/::?(before|after|marker|placeholder|selection|first-line|first-letter)\b/.test(selector)) continue
      const cut = lastCompound(selector)
      const last = selector.slice(cut)
      const bare = last.replace(/^:(?:where|is)\(\s*((?:a|button)(?:\s*,\s*(?:a|button))*)\s*\)/, '$1')
      const type = /^(a|button)(?![-\w])/.exec(bare)
      rules.push({
        selector,
        from,
        weight: specificity(selector),
        props,
        boxes: classesOf(selector.slice(0, cut)),
        classes: classesOf(last),
        elements: type ? bare.split(/\s*,\s*/).map((t) => /^(a|button)/.exec(t)?.[1]).filter(Boolean) : null,
        spares: /:(?:where|not)\([^)]*\.(?:btn|[-\w]+-(?:btn|button|cta))\b/.test(last),
      })
    }
  }
  return rules
}

const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr'])

/** Every element of a page: its tag, id and classes, and its ancestors' classes. */
export function elementsOf(html) {
  html = html.replace(/<!--[\s\S]*?-->/g, '').replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
  const out = [], open = []
  for (const [, close, tag, attrs] of html.matchAll(/<(\/?)([a-zA-Z][-\w]*)((?:"[^"]*"|'[^']*'|[^>"'])*)>/g)) {
    const name = tag.toLowerCase()
    if (close) {
      const at = open.map((e) => e.tag).lastIndexOf(name)
      if (at >= 0) open.length = at
      continue
    }
    const el = {
      tag: name,
      id: /\sid="([^"]*)"/.exec(attrs)?.[1] ?? '',
      classes: (/\sclass="([^"]*)"/.exec(attrs)?.[1] ?? '').split(/\s+/).filter(Boolean),
      ancestors: new Set(open.flatMap((e) => e.classes)),
    }
    out.push(el)
    if (!VOID.has(name) && !/\/\s*$/.test(attrs)) open.push(el)
  }
  return out
}

/** A button class: .btn and its kinds (.btn-primary), and the classes named as buttons (.play-cta, .ost-btn, .vm-button). */
export const BUTTON = /^(?:btn|btn-[-\w]+|[-\w]+-(?:btn|button|cta))$/
const MAKES_BTN = /\bclass(?:Name)?\s*[=:]\s*\\?["'`](?:[^"'`]*\s)?btn[\s"'`\\]|classList\.add\([^)]*["'`]btn["'`]/

/**
 * The buttons of a page: each a or button of its markup with a button class, and a .btn wherever one of its scripts
 * that writes a .btn names an element of the page by its id (it may put the button there). Each with its tag ('*' when
 * a script makes it), its classes, its ancestors' classes and where it is.
 */
export function buttonsOf(html, scripts = []) {
  const els = elementsOf(html)
  const found = els.filter((e) => (e.tag === 'a' || e.tag === 'button') && e.classes.some((c) => BUTTON.test(c)))
    .map((e) => ({ tag: e.tag, classes: e.classes, ancestors: e.ancestors, where: `${e.tag}.${e.classes.join('.')}` }))
  const writers = scripts.filter((s) => MAKES_BTN.test(s))
  for (const e of els) {
    if (!e.id || !writers.some((s) => s.includes(`"${e.id}"`) || s.includes(`'${e.id}'`) || s.includes(`#${e.id}"`) || s.includes(`#${e.id}'`))) continue
    found.push({ tag: '*', classes: ['btn'], ancestors: new Set([...e.ancestors, ...e.classes]), where: `.btn a script puts in #${e.id}` })
  }
  return found
}

const fits = (rule, button) => rule.boxes.every((c) => button.ancestors.has(c))
  && (!rule.elements || button.tag === '*' || rule.elements.includes(button.tag))

/**
 * The rules that take a property over from a page's buttons: a rule styling every link or button of a box that holds
 * one, outranking the button's own rule for that property. [{ selector, from, props, button }]
 */
export function buttonOverrides(rules, buttons) {
  const found = new Map()
  for (const button of buttons) {
    const own = {}
    for (const r of rules) {
      if (!r.classes.length || !r.classes.every((c) => button.classes.includes(c)) || !fits(r, button)) continue
      for (const p of r.props) if (!own[p] || compare(r.weight, own[p]) > 0) own[p] = r.weight
    }
    for (const r of rules) {
      if (!r.elements || r.classes.length || r.spares || !fits(r, button)) continue
      const props = r.props.filter((p) => own[p] && compare(r.weight, own[p]) > 0)
      const key = `${r.from} ${r.selector}`
      if (props.length && !found.has(key)) found.set(key, { selector: r.selector, from: r.from, props, button: button.where })
    }
  }
  return [...found.values()]
}
