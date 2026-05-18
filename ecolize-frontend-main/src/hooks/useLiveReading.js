/**
 * ============================================================
 *  Ecolize — useLiveReading (compat layer)
 * ============================================================
 *  Mantém a MESMA interface da versão antiga (que fazia
 *  polling HTTP a cada 2s) para não quebrar HomeScreen.jsx e
 *  outros consumidores. Internamente, agora é WebSocket.
 *
 *  Retorno: { data, loading, error }
 *    data = {
 *      consumo: {
 *        agua:    { valor_consumo, unidade, timestamp },
 *        energia: { valor_consumo, unidade, timestamp },
 *      },
 *      custo_estimado: { total, ... }   ← preenchido pelo snapshot
 *    }
 *
 *  O parâmetro `intervalMs` é IGNORADO (não há mais polling).
 *  Mantido apenas para compatibilidade de assinatura.
 * ============================================================
 */

import { useEffect, useRef, useState } from 'react'
import { subscribeToReadings } from '../services/socketClient'
import { getLiveReadingData } from '../services/dashboardService'

export default function useLiveReading(_intervalMs = 2000) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true

    async function loadSnapshot() {
      try {
        const snapshot = await getLiveReadingData()
        if (!mountedRef.current) return
        if (snapshot) {
          setData(snapshot)
        }
      } catch (err) {
        console.error('Erro ao buscar snapshot inicial:', err)
        setError(err)
      } finally {
        if (mountedRef.current) setLoading(false)
      }
    }

    loadSnapshot()

    const cleanupFns = []

    async function attachReadingListener() {
      try {
        const unsub = await subscribeToReadings((reading) => {
          if (!mountedRef.current) return

          setData((prevData) => {
            const current = prevData || { consumo: { agua: null, energia: null }, custo_estimado: null }
            const nextConsumo = {
              agua: current.consumo?.agua,
              energia: current.consumo?.energia,
            }

            if (reading.tipo_recurso === 'AGUA') {
              nextConsumo.agua = {
                valor_consumo: reading.valor_consumo,
                unidade: reading.unidade,
                timestamp: reading.timestamp,
              }
            }

            if (reading.tipo_recurso === 'ENERGIA') {
              nextConsumo.energia = {
                valor_consumo: reading.valor_consumo,
                unidade: reading.unidade,
                timestamp: reading.timestamp,
              }
            }

            return {
              ...current,
              consumo: nextConsumo,
            }
          })
        })

        cleanupFns.push(unsub)
      } catch (err) {
        console.warn('[WS] Falha ao assinar leituras ao vivo:', err.message)
      }
    }

    attachReadingListener()

    return () => {
      mountedRef.current = false
      cleanupFns.forEach((fn) => {
        if (typeof fn === 'function') fn()
      })
    }
  }, [])

  return { data, loading, error }
}
