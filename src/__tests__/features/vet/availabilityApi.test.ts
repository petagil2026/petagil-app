import {
  createTimeOff,
  deleteTimeOff,
  getMyAvailability,
  getSlots,
  listTimeOff,
  saveMyAvailability,
} from '@/features/vet/model'
import { api } from '@/services/api'

jest.mock('@/services/api', () => ({
  api: {
    get: jest.fn(),
    put: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
    patch: jest.fn(),
  },
  httpClient: jest.fn(),
}))

const mockApi = api as jest.Mocked<typeof api>

describe('feature vet — api de disponibilidade/folgas', () => {
  it('getMyAvailability desempacota o envelope', async () => {
    const data = { weekdays: [0, 1], slotDurationMin: 30, periods: [] }
    mockApi.get.mockResolvedValue({ success: true, data })
    await expect(getMyAvailability()).resolves.toEqual(data)
    expect(mockApi.get).toHaveBeenCalledWith('/profiles/vet/me/availability/')
  })

  it('getMyAvailability lança quando !success', async () => {
    mockApi.get.mockResolvedValue({ success: false, error: 'x' })
    await expect(getMyAvailability()).rejects.toThrow()
  })

  it('saveMyAvailability faz PUT com o payload', async () => {
    const payload = { weekdays: [0], slotDurationMin: 30, periods: [] }
    mockApi.put.mockResolvedValue({ success: true, data: payload })
    await saveMyAvailability(payload)
    expect(mockApi.put).toHaveBeenCalledWith('/profiles/vet/me/availability/', payload)
  })

  it('getSlots monta a query from/to', async () => {
    mockApi.get.mockResolvedValue({ success: true, data: { days: [] } })
    await getSlots('2026-06-29', '2026-07-05')
    expect(mockApi.get).toHaveBeenCalledWith(
      '/profiles/vet/me/availability/slots/?from=2026-06-29&to=2026-07-05'
    )
  })

  it('listTimeOff retorna a lista', async () => {
    mockApi.get.mockResolvedValue({ success: true, data: [{ id: 'to-1' }] })
    await expect(listTimeOff()).resolves.toHaveLength(1)
  })

  it('createTimeOff faz POST', async () => {
    const payload = { startsAt: 'a', endsAt: 'b', allDay: true }
    mockApi.post.mockResolvedValue({ success: true, data: { id: 'to-1', ...payload } })
    await createTimeOff(payload)
    expect(mockApi.post).toHaveBeenCalledWith('/profiles/vet/me/timeoff/', payload)
  })

  it('deleteTimeOff faz DELETE com id na URL', async () => {
    mockApi.delete.mockResolvedValue({ success: true, data: { ok: true } })
    await deleteTimeOff('to-1')
    expect(mockApi.delete).toHaveBeenCalledWith('/profiles/vet/me/timeoff/to-1/')
  })

  it('deleteTimeOff lança quando !success', async () => {
    mockApi.delete.mockResolvedValue({ success: false, error: 'x' })
    await expect(deleteTimeOff('to-1')).rejects.toThrow()
  })
})
