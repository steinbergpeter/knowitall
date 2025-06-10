import { PdfReader } from 'pdfreader'

export async function extractPdfText(
  base64: string
): Promise<string | undefined> {
  try {
    const pdfBuffer = Buffer.from(base64, 'base64')
    return await new Promise<string | undefined>((resolve, reject) => {
      let text = ''
      new PdfReader().parseBuffer(pdfBuffer, (err, item) => {
        if (err) return reject(err)
        if (!item) return resolve(text.trim() || undefined)
        if (item.text) text += item.text + ' '
      })
    })
  } catch {
    return undefined
  }
}
