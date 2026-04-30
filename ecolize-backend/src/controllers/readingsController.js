const db = require('../config/db');

// POST para o hardware enviar uma leitura
async function createReading(req, res) {
  const { id_dispositivo, tipo_recurso, valor_consumo } = req.body;

  // tipo_recurso deve ser 'ENERGIA' ou 'AGUA'
  if (!id_dispositivo || !tipo_recurso || valor_consumo === undefined) {
    return res.status(400).json({ message: 'Campos obrigatórios: id_dispositivo, tipo_recurso, valor_consumo.' });
  }
  const tiposValidos = ['ENERGIA', 'AGUA'];
  if (!tiposValidos.includes(tipo_recurso.toUpperCase())) {
    return res.status(400).json({ message: 'tipo_recurso deve ser ENERGIA ou AGUA.' });
  }

// Verifica se o dispositivo existe e pertence a algum usuário
  try {
    const [device] = await db.query(
      'SELECT ID FROM DISPOSITIVOS WHERE ID = ?',
      [id_dispositivo]
    );

    if (device.length === 0) {
      return res.status(404).json({ message: 'Dispositivo não encontrado.' });
    }

    const horaDataLeitura = new Date();

    const [result] = await db.query(
      `INSERT INTO LEITURA (ID_DISPOSITIVO, TIPO_RECURSO, VALOR_CONSUMO, HORA_DATA_LEITURA)
       VALUES (?, ?, ?, ?)`,
      [id_dispositivo, tipo_recurso.toUpperCase(), valor_consumo, horaDataLeitura]
    );

    return res.status(201).json({
      message: 'Leitura registrada com sucesso.',
      reading: {
        id: result.insertId,
        id_dispositivo,
        tipo_recurso: tipo_recurso.toUpperCase(),
        valor_consumo,
        hora_data_leitura: horaDataLeitura,
      },
    });
  } catch (err) {
    console.error('Erro ao registrar leitura:', err);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
}

// GET para busca de histórico de leituras do usuário com filtros
async function getReadings(req, res) {
  const { tipo, period } = req.query;
 
  try {
    let dateFilter;
    switch (period) {
      case 'week':
        dateFilter = 'AND L.HORA_DATA_LEITURA >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
        break;
      case 'month':
        dateFilter = 'AND L.HORA_DATA_LEITURA >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
        break;
      default:
        dateFilter = 'AND DATE(L.HORA_DATA_LEITURA) = CURDATE()';
    }

    // Monta filtro de tipo
    const tipoFilter = tipo ? `AND L.TIPO_RECURSO = '${tipo.toUpperCase()}'` : '';

    const [rows] = await db.query(
      `SELECT 
         L.ID_LEITURA,
         L.TIPO_RECURSO,
         L.VALOR_CONSUMO,
         L.HORA_DATA_LEITURA,
         D.ENDEREÇO_IP
       FROM LEITURA L
       JOIN DISPOSITIVOS D ON L.ID_DISPOSITIVO = D.ID
       WHERE D.ID_USUARIO = ?
       ${dateFilter}
       ${tipoFilter}
       ORDER BY L.HORA_DATA_LEITURA DESC`,
      [req.userId]
    );

    // Calcula o total consumido no período
    const totalEnergia = rows
      .filter(r => r.TIPO_RECURSO === 'ENERGIA')
      .reduce((acc, r) => acc + r.VALOR_CONSUMO, 0);

    const totalAgua = rows
      .filter(r => r.TIPO_RECURSO === 'AGUA')
      .reduce((acc, r) => acc + r.VALOR_CONSUMO, 0);

    return res.status(200).json({
      period: period || 'today',
      total_energia: parseFloat(totalEnergia.toFixed(2)),
      total_agua: parseFloat(totalAgua.toFixed(2)),
      readings: rows,
    });

  } catch (err) {
    console.error('Erro ao buscar leituras:', err);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
}

// GET para resumo de consumo + custo estimado
async function getSummary(req, res) {
  try {
    // Busca as metas/tarifas do usuário
    const [meta] = await db.query(
      'SELECT META_AGUA, META_LUZ, VALOR_ENERGIA_KWH, VALOR_AGUA_M3 FROM CONSUMO_META WHERE ID_USUARIO = ?',
      [req.userId]
    );

    // Busca consumo do mês atual
    const [rows] = await db.query(
      `SELECT L.TIPO_RECURSO, SUM(L.VALOR_CONSUMO) as TOTAL
       FROM LEITURA L
       JOIN DISPOSITIVOS D ON L.ID_DISPOSITIVO = D.ID
       WHERE D.ID_USUARIO = ?
       AND MONTH(L.HORA_DATA_LEITURA) = MONTH(NOW())
       AND YEAR(L.HORA_DATA_LEITURA) = YEAR(NOW())
       GROUP BY L.TIPO_RECURSO`,
      [req.userId]
    );

    const consumoEnergia = rows.find(r => r.TIPO_RECURSO === 'ENERGIA')?.TOTAL || 0;
    const consumoAgua = rows.find(r => r.TIPO_RECURSO === 'AGUA')?.TOTAL || 0;

    // Calcula custo estimado (se o usuário tiver metas cadastradas)
    let custoEnergia = null;
    let custoAgua = null;
    let metaAgua = null;
    let metaLuz = null;

    if (meta.length > 0) {
      custoEnergia = parseFloat((consumoEnergia * meta[0].VALOR_ENERGIA_KWH).toFixed(2));
      custoAgua = parseFloat((consumoAgua * meta[0].VALOR_AGUA_M3).toFixed(2));
      metaAgua = meta[0].META_AGUA;
      metaLuz = meta[0].META_LUZ;
    }
    return res.status(200).json({
      mes_atual: new Date().toLocaleString('pt-BR', { month: 'long', year: 'numeric' }),
      consumo: {
        energia_kwh: parseFloat(consumoEnergia.toFixed(2)),
        agua_m3: parseFloat(consumoAgua.toFixed(2)),
      },
      custo_estimado: {
        energia_reais: custoEnergia,
        agua_reais: custoAgua,
      },
      metas: {
        meta_agua: metaAgua,
        meta_luz: metaLuz,
      },
    });
  } catch (err) {
    console.error('Erro ao buscar resumo:', err);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
}
module.exports = { createReading, getReadings, getSummary };