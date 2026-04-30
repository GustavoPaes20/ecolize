import { delay } from '../utils/delay'
import { mockStore } from '../mocks/mockStore'

export async function getRanking(resourceKey = 'water') {
  await delay(220)

  return {
    activeFilter: resourceKey,
    ...mockStore.ranking[resourceKey],
  }
}
