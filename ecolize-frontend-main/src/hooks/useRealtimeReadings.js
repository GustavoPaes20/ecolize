/**
 * ============================================================
 *  Ecolize — useRealtimeReadings
 * ============================================================
 *  Hook que substitui o `useLiveReading` (que fazia polling
 *  a cada 2s). Agora os dados chegam push, via Socket.IO.
 *
 *  Estado retornado:
 *    {
 *      agua:    { valor, unidade, timestamp },
 *      energia: { valor, unidade, timestamp },
 *      controles: { agua: 'ON'|'OFF'|null, energia: ... },
 *      deviceStatus: { ... },
 *      status: 'connecting' | 'connected' | 'disconnected',
 *      lastEventAt: Date | null,
 *    }
 *
 *  Estratégia de fallback:
 *    - Na primeira montagem, busca uma vez o snapshot via HTTP
 *      para popular a tela ANTES do primeiro evento WS chegar.
 *    - Depois, todo update vem por WebSocket.
 *    - Se o socket cair, a tela continua mostrando o último
 *      valor recebido (não zera). A flag `status` permite à
 *      UI exibir um indicador visual.
 * ============================================================
 */

import { useEffect, useRef, useState } from 'react'
import {
  subscribeToReadings,
  subscribeToDeviceStatus,
  subscribeToControlState,
} from '../services/socketClient'
import { getLiveReadingData } from '../services/dashboardService'

const INITIAL_STATE = {
  agua: null,
  energia: null,
  controles: {
    agua: null,
    energia: null,
  },
  deviceStatus: null,
  status: 'connecting',
  lastEventAt: null,
}

export default function useRealtimeReadings() {
  const [state, setState] = useState(INITIAL_STATE)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true

    async function loadInitialSnapshot() {
      const data = await getLiveReadingData()
      if (!mountedRef.current) return

      if (data) {
        setState((prev) => ({
          ...prev,
          agua: data.consumo?.agua || prev.agua,
          energia: data.consumo?.energia || prev.energia,
          status: 'connecting',
        }))
      }
    }

    loadInitialSnapshot()

    const unsubscribers = []

    subscribeToReadings((reading) => {
      if (!mountedRef.current) return
      const payload = {
        valor: reading.valor_consumo,
        unidade: reading.unidade,
        timestamp: reading.timestamp,
      }

      setState((prev) => ({
        ...prev,
        status: 'connected',
        lastEventAt: new Date(),
        agua: reading.tipo_recurso === 'AGUA' ? payload : prev.agua,
        energia: reading.tipo_recurso === 'ENERGIA' ? payload : prev.energia,
      }))
    }).then((unsub) => unsubscribers.push(unsub))

    subscribeToDeviceStatus((statusEvent) => {
      if (!mountedRef.current) return
      setState((prev) => ({
        ...prev,
        deviceStatus: statusEvent,
        lastEventAt: new Date(),
      }))
    }).then((unsub) => unsubscribers.push(unsub))

    subscribeToControlState((controlEvent) => {
      if (!mountedRef.current) return
      setState((prev) => ({
        ...prev,
        controles: {
          ...prev.controles,
          agua: controlEvent.recurso === 'AGUA' ? controlEvent.estado : prev.controles.agua,
          energia: controlEvent.recurso === 'ENERGIA' ? controlEvent.estado : prev.controles.energia,
        },
        lastEventAt: new Date(),
      }))
    }).then((unsub) => unsubscribers.push(unsub))

    return () => {
      mountedRef.current = false
      unsubscribers.forEach((unsub) => {
        if (typeof unsub === 'function') unsub()
      })
    }
  }, [])

  return state
}
