import { getDocumentProxy } from 'unpdf'
import { classifyHeading } from './sectionMap.js'

export async function pdfToHtml(buffer) {
  const pdf = await getDocumentProxy(new Uint8Array(buffer))
  const lines = []

  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p)
    const content = await page.getTextContent()
    groupIntoLines(content.items, lines)
  }

  if (!lines.length) return ''

  const bodyHeight = findBodyHeight(lines)
  // Major heading: ≥1.25x body (section headings, company names)
  // Minor heading: ≥1.1x body (project sub-headings)
  const majorThreshold = bodyHeight * 1.25
  const minorThreshold = bodyHeight * 1.1
  const hasLargeText = lines.some(l => l.maxHeight >= majorThreshold)

  if (!hasLargeText) {
    return keywordFallback(lines)
  }

  const htmlParts = []

  for (const line of lines) {
    const text = line.text.trim()
    if (!text) continue

    if (line.maxHeight >= majorThreshold) {
      if (classifyHeading(text)) {
        htmlParts.push(`<h1>${esc(text)}</h1>`)
      } else {
        htmlParts.push(`<h2>${esc(text)}</h2>`)
      }
    } else if (line.maxHeight >= minorThreshold) {
      htmlParts.push(`<h3>${esc(text)}</h3>`)
    } else {
      htmlParts.push(`<p>${esc(text)}</p>`)
    }
  }

  return htmlParts.join('\n')
}

/** Group text items into lines by Y position */
function groupIntoLines(items, lines) {
  for (const item of items) {
    const y = Math.round(item.transform[5])
    const last = lines[lines.length - 1]
    if (last && Math.abs(last.y - y) <= 2) {
      last.items.push(item)
      last.text += item.str
      if (item.height > last.maxHeight) last.maxHeight = item.height
    } else {
      lines.push({ y, items: [item], text: item.str, maxHeight: item.height })
    }
  }
}

/** Find the most common text height (= body text) */
function findBodyHeight(lines) {
  const counts = {}
  for (const line of lines) {
    const h = Math.round(line.maxHeight * 10) / 10
    if (h > 0) counts[h] = (counts[h] || 0) + 1
  }
  let best = 0, bestCount = 0
  for (const [h, count] of Object.entries(counts)) {
    if (count > bestCount) { best = Number(h); bestCount = count }
  }
  return best
}

/** Fallback: use keyword matching when font info isn't useful */
function keywordFallback(lines) {
  const htmlParts = []
  for (const line of lines) {
    const t = line.text.trim()
    if (!t) continue
    if (t.length < 60 && classifyHeading(t)) {
      htmlParts.push(`<h1>${esc(t)}</h1>`)
    } else {
      htmlParts.push(`<p>${esc(t)}</p>`)
    }
  }
  return htmlParts.join('\n')
}

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
