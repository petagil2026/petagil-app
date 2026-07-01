import {
  addDaysToISODate,
  buildLocalInstantISO,
  instantToLocalParts,
  isoDateToBrShort,
  maskBrDate,
  parseBrDateToISO,
} from '@/utils'

describe('maskBrDate', () => {
  it('agrupa dígitos em DD/MM/AAAA', () => {
    expect(maskBrDate('0')).toBe('0')
    expect(maskBrDate('01')).toBe('01')
    expect(maskBrDate('0107')).toBe('01/07')
    expect(maskBrDate('01072026')).toBe('01/07/2026')
  })
  it('ignora não-dígitos e trunca em 8 dígitos', () => {
    expect(maskBrDate('01/07/2026')).toBe('01/07/2026')
    expect(maskBrDate('010720269999')).toBe('01/07/2026')
    expect(maskBrDate('ab12cd')).toBe('12')
  })
})

describe('parseBrDateToISO', () => {
  it('converte data válida', () => {
    expect(parseBrDateToISO('01/07/2026')).toBe('2026-07-01')
    expect(parseBrDateToISO('29/02/2024')).toBe('2024-02-29') // ano bissexto
  })
  it('rejeita datas irreais', () => {
    expect(parseBrDateToISO('31/02/2026')).toBeNull()
    expect(parseBrDateToISO('00/01/2026')).toBeNull()
    expect(parseBrDateToISO('15/13/2026')).toBeNull()
    expect(parseBrDateToISO('29/02/2026')).toBeNull() // não bissexto
  })
  it('rejeita formatos inválidos', () => {
    expect(parseBrDateToISO('1/7/2026')).toBeNull()
    expect(parseBrDateToISO('01-07-2026')).toBeNull()
    expect(parseBrDateToISO('')).toBeNull()
  })
})

describe('addDaysToISODate', () => {
  it('soma dias atravessando o mês', () => {
    expect(addDaysToISODate('2026-06-29', 1)).toBe('2026-06-30')
    expect(addDaysToISODate('2026-06-30', 1)).toBe('2026-07-01')
    expect(addDaysToISODate('2026-07-01', -1)).toBe('2026-06-30')
  })
})

describe('buildLocalInstantISO / instantToLocalParts (fuso SP)', () => {
  it('round-trip mantém data/hora locais', () => {
    const iso = buildLocalInstantISO('2026-07-01', '14:00')
    expect(iso).toBe('2026-07-01T14:00:00.000-03:00')
    expect(instantToLocalParts(iso)).toEqual({ date: '2026-07-01', time: '14:00' })
  })
  it('00:00 local não vaza para o dia anterior', () => {
    const iso = buildLocalInstantISO('2026-07-01', '00:00')
    expect(instantToLocalParts(iso)).toEqual({ date: '2026-07-01', time: '00:00' })
  })
})

describe('isoDateToBrShort', () => {
  it('formata YYYY-MM-DD → DD/MM', () => {
    expect(isoDateToBrShort('2026-07-01')).toBe('01/07')
  })
})
