import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const createSpy = vi.fn().mockResolvedValue({})
const updateSpy = vi.fn().mockResolvedValue({})
const deleteSpy = vi.fn().mockResolvedValue({})

vi.mock('../api/hooks', () => ({
  useCreateCategory: () => ({ mutateAsync: createSpy }),
  useUpdateCategory: () => ({ mutateAsync: updateSpy }),
  useDeleteCategory: () => ({ mutateAsync: deleteSpy }),
}))

import { LABEL_PALETTE, LabelModal } from './LabelModal'

afterEach(() => {
  cleanup()
  createSpy.mockClear()
  updateSpy.mockClear()
  deleteSpy.mockClear()
})

describe('LabelModal', () => {
  it('renders nothing when closed', () => {
    render(<LabelModal open={false} onClose={() => {}} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('closes on Escape', async () => {
    const onClose = vi.fn()
    render(<LabelModal open onClose={onClose} />)
    await userEvent.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('closes when clicking the backdrop', () => {
    const onClose = vi.fn()
    render(<LabelModal open onClose={onClose} />)
    fireEvent.click(screen.getByRole('presentation'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('shows New Label title and no delete button in create mode', () => {
    render(<LabelModal open onClose={() => {}} />)
    expect(screen.getByText('New Label')).toBeInTheDocument()
    expect(screen.queryByText(/Delete Label/)).not.toBeInTheDocument()
  })

  it('populates from initial in edit mode and shows Delete', () => {
    const initial = {
      id: 7,
      name: 'Fitness',
      color: '#22c55e',
      description: 'Gym routines',
    }
    render(<LabelModal open initial={initial} onClose={() => {}} />)
    expect(screen.getByText('Edit Label')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Fitness')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Gym routines')).toBeInTheDocument()
    expect(screen.getByText(/Delete Label/)).toBeInTheDocument()
    // The selected swatch is the one that matches initial.color
    const selectedSwatch = screen.getByLabelText(`Pick ${initial.color}`)
    expect(selectedSwatch).toHaveAttribute('aria-pressed', 'true')
  })

  it('saves a new label with picked color', async () => {
    const onClose = vi.fn()
    render(<LabelModal open onClose={onClose} />)
    // Type a name
    await userEvent.type(screen.getByPlaceholderText(/e.g. Work/), 'Reading')
    // Pick a non-default color
    const newColor = LABEL_PALETTE[3]
    fireEvent.click(screen.getByLabelText(`Pick ${newColor}`))
    // Submit
    fireEvent.click(screen.getByText('Add Label'))
    // Wait a microtask for mutateAsync
    await Promise.resolve()
    await Promise.resolve()
    expect(createSpy).toHaveBeenCalledWith({
      name: 'Reading',
      color: newColor,
      description: null,
    })
    expect(onClose).toHaveBeenCalled()
  })

  it('calls delete in edit mode', async () => {
    const onClose = vi.fn()
    const initial = { id: 7, name: 'Fitness', color: '#22c55e', description: null }
    render(<LabelModal open initial={initial} onClose={onClose} />)
    fireEvent.click(screen.getByText(/Delete Label/))
    await Promise.resolve()
    await Promise.resolve()
    expect(deleteSpy).toHaveBeenCalledWith(7)
    expect(onClose).toHaveBeenCalled()
  })
})
