const createMqttClient = require('../config/mqttClient');
const db = require('../config/db');

// ============================================
// Mapeamento: tópico MQTT → como processar
// ============================================
// Quando o sensor SCT-013 for adicionado, basta cadastrar mais um
// dispositivo no banco com o MQTT_CLIENT_ID dele e ele já cai aqui.

const TOPIC_MAP = {
  [process.env.MQTT_TOPIC_VAZAO || 'ESP32/agua']: {
    tipo: 'leitura',
    recurso: 'AGUA',
    unidade: 'L/min',
  },
  [process.env.MQTT_TOPIC_CORRENTE || 'ESP32/luz']: {
    tipo: 'leitura',
    recurso: 'ENERGIA',
    unidade: 'kWh',
  },
  [process.env.MQTT_TOPIC_VAZAO_STATUS || 'ESP32/agua/status']: {
    tipo: 'evento',
    sensor: 'VAZAO_AGUA',
  },
  [process.env.MQTT_TOPIC_CORRENTE_STATUS || 'ESP32/luz/status']: {
    tipo: 'evento',
    sensor: 'CORRENTE_ELETRICA',
  },
};

function parseJsonPayload(raw) {
  try {
    return JSON.parse(raw);
  } catch (err) {
    return null;
  }
}

function extractAccumulatedValue(parsed, recurso) {
  if (!parsed || typeof parsed !== 'object') return null;

  if (recurso === 'AGUA') {
    if (typeof parsed.valor_acumulado === 'number') return { total: parsed.valor_acumulado, unit: 'm³' };
    if (typeof parsed.total_L === 'number') return { total: parsed.total_L / 1000, unit: 'm³' };
    if (typeof parsed.total_m3 === 'number') return { total: parsed.total_m3, unit: 'm³' };
  }

  if (recurso === 'ENERGIA') {
    if (typeof parsed.valor_acumulado === 'number') return { total: parsed.valor_acumulado, unit: 'kWh' };
    if (typeof parsed.total_kwh === 'number') return { total: parsed.total_kwh, unit: 'kWh' };
    if (typeof parsed.total_kW === 'number') return { total: parsed.total_kW, unit: 'kWh' };
  }

  return null;
}

async function getLastAccumulatedTotal(idDispositivo, tipoRecurso) {
  const [rows] = await db.query(
    `SELECT PAYLOAD_RAW FROM LEITURA
     WHERE ID_DISPOSITIVO = ? AND TIPO_RECURSO = ?
     ORDER BY HORA_DATA_LEITURA DESC
     LIMIT 1`,
    [idDispositivo, tipoRecurso]
  );

  if (rows.length === 0) return null;
  const parsed = parseJsonPayload(rows[0].PAYLOAD_RAW);
  const acc = extractAccumulatedValue(parsed, tipoRecurso);
  return acc ? acc.total : null;
}

// ============================================
// Funções de gravação no banco
// ============================================

/**
 * Descobre o ID do dispositivo no banco a partir do tópico MQTT.
 * Estratégia: o tópico ESP32/agua mapeia pra dispositivos com TIPO_SENSOR
 * VAZAO_AGUA ou AMBOS. Em projeto pequeno, todas as ESPs publicam nos
 * mesmos tópicos. Quando escalar, cada ESP publicará em ESP32/agua/<id>.
 */
async function descobrirDispositivo(tipoSensor) {
  const [rows] = await db.query(
    `SELECT ID FROM DISPOSITIVOS 
     WHERE (TIPO_SENSOR = ? OR TIPO_SENSOR = 'AMBOS') 
       AND ATIVO = TRUE 
     LIMIT 1`,
    [tipoSensor]
  );
  return rows[0]?.ID || null;
}

async function gravarLeitura(topico, payload) {
  const config = TOPIC_MAP[topico];
  if (!config || config.tipo !== 'leitura') return;

  const parsed = parseJsonPayload(payload);
  const accumulated = extractAccumulatedValue(parsed, config.recurso);

  const tipoSensor = config.recurso === 'AGUA' ? 'VAZAO_AGUA' : 'CORRENTE_ELETRICA';
  const idDispositivo = await descobrirDispositivo(tipoSensor);

  if (!idDispositivo) {
    console.warn(`[MQTT] Nenhum dispositivo cadastrado para ${tipoSensor}`);
    return;
  }

  let valor = null;
  let unidade = config.unidade;
  let payloadRaw = payload;

  if (accumulated) {
    const previousTotal = await getLastAccumulatedTotal(idDispositivo, config.recurso);
    if (previousTotal !== null) {
      const delta = parseFloat((accumulated.total - previousTotal).toFixed(4));
      if (delta < 0) {
        console.warn(`[MQTT] Leitura acumulada menor que a anterior em ${topico}. Ignorando.`);
        return;
      }
      valor = delta;
    } else {
      valor = 0;
      console.log(`[MQTT] Primeira leitura acumulada para ${config.recurso}. Usando baseline 0.`);
    }
    unidade = accumulated.unit;
  } else {
    const numeric = parseFloat(payload);
    if (Number.isNaN(numeric)) {
      console.warn(`[MQTT] Payload inválido em ${topico}: ${payload}`);
      return;
    }
    valor = numeric;
  }

  await db.query(
    `INSERT INTO LEITURA 
     (ID_DISPOSITIVO, TIPO_RECURSO, VALOR_CONSUMO, UNIDADE, PAYLOAD_RAW) 
     VALUES (?, ?, ?, ?, ?)`,
    [idDispositivo, config.recurso, valor, unidade, payloadRaw]
  );

  console.log(`[MQTT] ✓ Leitura ${config.recurso}: ${valor} ${unidade} (disp ${idDispositivo})`);
}

async function gravarEvento(topico, payload) {
  const config = TOPIC_MAP[topico];
  if (!config || config.tipo !== 'evento') return;

  const eventosValidos = ['coletando', 'pausado', 'offline', 'online'];
  if (!eventosValidos.includes(payload)) {
    console.warn(`[MQTT] Status desconhecido em ${topico}: ${payload}`);
    return;
  }

  const idDispositivo = await descobrirDispositivo(config.sensor);
  if (!idDispositivo) return;

  await db.query(
    `INSERT INTO EVENTO_COLETA (ID_DISPOSITIVO, EVENTO) VALUES (?, ?)`,
    [idDispositivo, payload]
  );

  console.log(`[MQTT] ✓ Evento ${payload} registrado (disp ${idDispositivo})`);
}

// ============================================
// Inicialização do subscriber
// ============================================

function startMqttSubscriber() {
  console.log('[MQTT] Iniciando bridge HiveMQ → Aiven MySQL...');

  const client = createMqttClient();
  const topics = Object.keys(TOPIC_MAP).filter(Boolean);

  client.on('connect', () => {
    console.log(`[MQTT] ✓ Conectado a ${process.env.MQTT_HOST}`);
    client.subscribe(topics, { qos: 1 }, (err, granted) => {
      if (err) {
        console.error('[MQTT] Erro ao se inscrever:', err);
        return;
      }
      granted.forEach(g => console.log(`[MQTT] ✓ Inscrito em ${g.topic} (QoS ${g.qos})`));
    });
  });

  client.on('message', async (topic, message) => {
    const payload = message.toString().trim();
    console.log(`[MQTT] ← [${topic}] ${payload}`);

    try {
      const config = TOPIC_MAP[topic];
      if (!config) return;

      if (config.tipo === 'leitura') {
        await gravarLeitura(topic, payload);
      } else if (config.tipo === 'evento') {
        await gravarEvento(topic, payload);
      }
    } catch (err) {
      console.error(`[MQTT] Erro ao processar mensagem de ${topic}:`, err.message);
    }
  });

  client.on('reconnect', () => {
    console.log('[MQTT] Reconectando...');
  });

  client.on('error', (err) => {
    console.error('[MQTT] Erro:', err.message);
  });

  client.on('offline', () => {
    console.warn('[MQTT] Cliente offline');
  });

  // graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n[MQTT] Encerrando bridge...');
    client.end(false, {}, () => process.exit(0));
  });

  return client;
}

module.exports = { startMqttSubscriber };