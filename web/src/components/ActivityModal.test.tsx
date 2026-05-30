import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock the API hooks so the modal renders without a network or QueryClient.
vi.mock('../api/hooks', () => ({
  useCategories: () => ({
    data: [
      { id: 1, name: 'Work', color: '#7c5cff' },
      { id: 2, name: 'Personal', color: '#ff6b6b' },
    ],
  }),
  useCreateActivity: () => ({ mutateAsync: vi.fn().mockResolvedValue({}) }),
  useUpdateActivity: () => ({ mutateAsync: vi.fn().mockResolvedValue({}) }),
  useDeleteActivity: () => ({ mutateAsync: vi.fn().mockResolvedValue({}) }),
}))

import { ActivityModal } from './ActivityModal'

afterEach(() => cleanup())

describe('ActivityModal', () => {
  it('renders nothing when closed', () => {
    render(<ActivityModal open={false} onClose={() => {}} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders dialog when open', () => {
    render(<ActivityModal open onClose={() => {}} />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('New Activity')).toBeInTheDocument()
  })

  it('closes on Escape key', async () => {
    const onClose = vi.fn()
    render(<ActivityModal open onClose={onClose} />)
    await userEvent.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('closes when clicking the backdrop', () => {
    const onClose = vi.fn()
    render(<ActivityModal open onClose={onClose} />)
    fireEvent.click(screen.getByRole('presentation'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not close when clicking inside the dialog panel', () => {
    const onClose = vi.fn()
    render(<ActivityModal open onClose={onClose} />)
    fireEvent.click(screen.getByRole('dialog'))
    expect(onClose).not.toHaveBeenCalled()
  })

  it('defaultStart populates date and start, end = start + 1h', () => {
    const start = new Date(2026, 4, 27, 14, 15) // May 27, 2026 14:15
    render(<ActivityModal open defaultStart={start} onClose={() => {}} />)

    // Date input uses ISO yyyy-mm-dd
    expect(screen.getByDisplayValue('2026-05-27')).toBeInTheDocument()
    // Start and end time inputs
    expect(screen.getByDisplayValue('14:15')).toBeInTheDocument()
    expect(screen.getByDisplayValue('15:15')).toBeInTheDocument()
  })

  it('defaultDay sets the date but uses 09:00–10:00 fallback when no start', () => {
    const day = new Date(2026, 4, 27)
    render(<ActivityModal open defaultDay={day} onClose={() => {}} />)

    expect(screen.getByDisplayValue('2026-05-27')).toBeInTheDocument()
    expect(screen.getByDisplayValue('09:00')).toBeInTheDocument()
    expect(screen.getByDisplayValue('10:00')).toBeInTheDocument()
  })
})
