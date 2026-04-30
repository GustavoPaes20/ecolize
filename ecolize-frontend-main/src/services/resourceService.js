import { delay } from '../utils/delay'
import { mockStore } from '../mocks/mockStore'

export async function getResourceDetails(resourceKey) {
  await delay(220)
  return mockStore.resources[resourceKey]
}
