import { useCallback, useEffect, useState } from 'react'

export default function useAsyncData(fetcher, deps = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const reload = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const nextData = await fetcher()
      setData(nextData)
      return nextData
    } catch (err) {
      setError(err)
      return null
    } finally {
      setLoading(false)
    }
  }, deps)

  useEffect(() => {
    reload()
  }, [reload])

  return { data, loading, error, reload, setData }
}
