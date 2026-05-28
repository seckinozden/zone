import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const createSpy = vi.fn().mockResolvedValue({})
const updateSpy = vi.fn().mockResolvedValue({})
const deleteSpy = vi.fn().mockResolvedValue({})

vi.mock('../api/hooks', () => ({
  useCreateSleep: () => ({ mutateAsync: createSpy }),
  useUpdateSleep: () => ({ mutateAsync: updateSpy }),
  useDeleteSleep: () => ({ mutateAsync: deleteSpy }),
}))

import { SleepModal } from './SleepModal'

afterEach(() => {
  cleanup()
  createSpy.mockClear()
  updateSpy.mockClear()
  deleteSpy.mockClear()
})

describe('SleepModal', () => {
  it('renders nothing when closed', () => {
    render(<SleepModal open={false} onClose={() => {}} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('closes on Escape', async () => {
    const onClose = vi.fn()
    render(<SleepModal open onClose={onClose} />)
    await userEvent.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('closes when clicking the backdrop', () => {
    const onClose = vi.fn()
    render(<SleepModal open onClose={onClose} />)
    fireEvent.click(screen.getByRole('presentation'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('shows New Sleep Entry title in create mode without delete', () => {
    render(<SleepModal open onClose={() => {}} />)
    expect(screen.getByText('New Sleep Entry')).toBeInTheDocument()
    expect(screen.queryByText(/Delete/)).not.toBeInTheDocument()
  })

  it('prefills from initial in edit mode', () => {
    const initial = {
      id: 5,
      date: '2026-05-20',
      score: 72,
      durationMin: 420,
      notes: 'late dinner',
    }
    render(<SleepModal open initial={initial} onClose={() => {}} />)
    expect(screen.getByText('Edit Sleep Entry')).toBeInTheDocument()
    expect(screen.getByDisplayValue('2026-05-20')).toBeInTheDocument()
    expect(screen.getByDisplayValue('420')).toBeInTheDocument()
    expect(screen.getByDisplayValue('late dinner')).toBeInTheDocument()
    expect(screen.getByText(/Delete/)).toBeInTheDocument()
  })

  it('sends create payload with null durationMin when blank', async () => {
    const onClose = vi.fn()
    const defaultDate = new Date(2026, 4, 28) // May 28, 2026
    render(<SleepModal open defaultDate={defaultDate} onClose={onClose} />)
    fireEvent.click(screen.getByText('Add Entry'))
    await Promise.resolve()
    await Promise.resolve()
    expect(createSpy).toHaveBeenCalledTimes(1)
    const payload = createSpy.mock.calls[0][0]
    expect(payload).toMatchObject({
      date: '2026-05-28',
      score: 80,
      durationMin: null,
      notes: null,
    })
    expect(onClose).toHaveBeenCalled()
  })

  it('calls delete in edit mode', async () => {
    const onClose = vi.fn()
    const initial = { id: 5, date: '2026-05-20', score: 72, durationMin: null, notes: null }
    render(<SleepModal open initial={initial} onClose={onClose} />)
    fireEvent.click(screen.getByText(/Delete/))
    await Promise.resolve()
    await Promise.resolve()
    expect(deleteSpy).toHaveBeenCalledWith(5)
    expect(onClose).toHaveBeenCalled()
  })
})
