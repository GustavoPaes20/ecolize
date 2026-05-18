import { useEffect, useState, useRef } from 'react'
import { getLiveReadingData } from '../services/dashboardService'

export default function useLiveReading(intervalMs = 2000) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const intervalRef = useRef(null)

  const fetchData = async () => {
    try {
      const result = await getLiveReadingData()
      if (result) {
        setData(result)
        setError(null)
      }
    } catch (err) {
      setError(err)
      console.error('Erro no polling de leitura ao vivo:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    intervalRef.current = setInterval(fetchData, intervalMs)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [intervalMs])

  return { data, loading, error }
}
