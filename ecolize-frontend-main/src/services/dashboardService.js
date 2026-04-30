import { delay } from '../utils/delay'
import { mockStore } from '../mocks/mockStore'

export async function getHomeDashboard() {
  await delay(250)
  return mockStore.dashboard
}
