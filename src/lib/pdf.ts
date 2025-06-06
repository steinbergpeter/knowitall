export async function extractPdfText(
  base64: string
): Promise<string | undefined> {
  const pdfParse = (await import('pdf-parse')).default
  try {
    const pdfBuffer = Buffer.from(base64, 'base64')
    const data = await pdfParse(pdfBuffer)
    return data.text
  } catch {
    return undefined
  }
}
