import { resolveChainedCommand } from '../../commands'
import selectAllCommand from '../selectAll'

it('prefers an exact chained gesture match over a coalesced alias match', () => {
  expect(resolveChainedCommand(selectAllCommand, 'ldrul')).toMatchObject({
    gesture: 'ldrul',
    label: 'Select All + Swap Parent',
  })
})
