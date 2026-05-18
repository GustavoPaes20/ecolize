/**
 * ============================================================
 *  Ecolize — useDeviceControl
 * ============================================================
 *  Hook que expõe ações para ligar/desligar os controles de
 *  água e luz e mantém o estado atual sincronizado com o ESP.
 *
 *  Fluxo:
 *    1) UI chama `toggleWater('ON')` ou `toggleEnergy('OFF')`
 *    2) Comando vai pelo WS → backend → MQTT → ESP32
 *    3) ESP confirma via tópico de status
 *    4) Backend emite "control:state" via WS
 *    5) Este hook atualiza o estado e a UI reage
 *
 *  Retorno:
 *    {
 *      water:  'ON' | 'OFF' | null,
 *      energy: 'ON' | 'OFF' | null,
 *      sending: boolean,
 *      error:   Error | null,
 *      toggleWater:  (acao) => Promise,
 *      toggleEnergy: (acao) => Promise,
 *    }
 * ============================================================
 */

import { useEffect, useRef, useState } from 'react'
import { subscribeToControlState, sendControlToggle } from '../services/socketClient'

export default function useDeviceControl() {
  const [state, setState] = useState({
    water: null,
    energy: null,
    sending: false,
    error: null,
  })
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    let unsubscribe = null

    async function attachControlListener() {
      try {
        unsubscribe = await subscribeToControlState((controlEvent) => {
          if (!mountedRef.current) return
          setState((prev) => ({
            ...prev,
            water: controlEvent.recurso === 'AGUA' ? controlEvent.estado : prev.water,
            energy: controlEvent.recurso === 'ENERGIA' ? controlEvent.estado : prev.energy,
          }))
        })
      } catch (err) {
        console.warn('[WS] Falha ao assinar estado do controle:', err.message)
      }
    }

    attachControlListener()

    return () => {
      mountedRef.current = false
      if (typeof unsubscribe === 'function') {
        unsubscribe()
      }
    }
  }, [])

  async function toggle(recurso, acao) {
    setState((prev) => ({ ...prev, sending: true, error: null }))

    try {
      await sendControlToggle(recurso, acao)
      if (!mountedRef.current) return
      setState((prev) => ({ ...prev, sending: false }))
    } catch (err) {
      if (!mountedRef.current) return
      setState((prev) => ({ ...prev, sending: false, error: err }))
      throw err
    }
  }

  return {
    ...state,
    toggleWater: (acao) => toggle('AGUA', acao),
    toggleEnergy: (acao) => toggle('ENERGIA', acao),
  }
}
