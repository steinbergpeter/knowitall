import { JSDOM } from 'jsdom'

export async function extractWebPageText(
  url: string
): Promise<{ text: string; metadata?: { title?: string; error?: string } }> {
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error('Failed to fetch web page')
    const html = await res.text()
    const dom = new JSDOM(html)
    const doc = dom.window.document
    let text = ''
    const main = doc.querySelector('main, article')
    if (main) {
      text = main.textContent || ''
    } else {
      text = doc.body.textContent || ''
    }
    const title = doc.querySelector('title')?.textContent || ''
    return { text: text.trim(), metadata: { title } }
  } catch (e) {
    return { text: '', metadata: { error: (e as Error).message } }
  }
}
