/**
 * Helpers de data no formato brasileiro (DD/MM/AAAA), sem libs nativas.
 * Usados pelo `DateInput` (máscara) e pela tela de folgas (parse + construção
 * de instantes no fuso fixo America/Sao_Paulo, convenção 3 da spec).
 */

/** Offset fixo de America/Sao_Paulo (UTC−3), sem DST — espelha o backend. */
export const SAO_PAULO_OFFSET = '-03:00'
const SAO_PAULO_OFFSET_MIN = -180

/** Agrupa dígitos em "DD/MM/AAAA" conforme o usuário digita (máscara). */
export function maskBrDate(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 8)
  const dd = digits.slice(0, 2)
  const mm = digits.slice(2, 4)
  const yyyy = digits.slice(4, 8)
  let out = dd
  if (digits.length > 2) out += `/${mm}`
  if (digits.length > 4) out += `/${yyyy}`
  return out
}

/**
 * Converte "DD/MM/AAAA" → "YYYY-MM-DD" com validação de data REAL
 * (rejeita 31/02, mês 13 etc.). Retorna `null` se inválida.
 */
export function parseBrDateToISO(br: string): string | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(br)
  if (!m) return null
  const day = Number(m[1])
  const month = Number(m[2])
  const year = Number(m[3])
  if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1900 || year > 2200) {
    return null
  }
  // Date UTC normaliza datas inválidas (31/02 → 03/03); comparar de volta detecta.
  const d = new Date(Date.UTC(year, month - 1, day))
  if (d.getUTCFullYear() !== year || d.getUTCMonth() !== month - 1 || d.getUTCDate() !== day) {
    return null
  }
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

/** "YYYY-MM-DD" + n dias (em UTC). */
export function addDaysToISODate(isoDate: string, n: number): string {
  const d = new Date(`${isoDate}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

/** Monta um instante ISO no fuso de São Paulo (ex.: "2026-07-01T14:00:00.000-03:00"). */
export function buildLocalInstantISO(isoDate: string, hhmm: string): string {
  return `${isoDate}T${hhmm}:00.000${SAO_PAULO_OFFSET}`
}

/** Instante ISO → partes locais (data "YYYY-MM-DD" + hora "HH:MM") no fuso de SP. */
export function instantToLocalParts(iso: string): { date: string; time: string } {
  const shifted = new Date(new Date(iso).getTime() + SAO_PAULO_OFFSET_MIN * 60_000)
  return { date: shifted.toISOString().slice(0, 10), time: shifted.toISOString().slice(11, 16) }
}

/** "YYYY-MM-DD" → "DD/MM". */
export function isoDateToBrShort(isoDate: string): string {
  const [, m, d] = isoDate.split('-')
  return `${d}/${m}`
}
