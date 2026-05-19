require('dotenv').config();
const db = require('./src/config/db');

async function seedDevice() {
  try {
    const userIdArg = process.argv[2] ? Number(process.argv[2]) : null;

    const [users] = userIdArg
      ? await db.query('SELECT ID, NOME FROM USUARIO WHERE ID = ?', [userIdArg])
      : await db.query('SELECT ID, NOME FROM USUARIO ORDER BY ID LIMIT 1');

    const user = users[0];
    if (!user) {
      console.error('Nenhum usuário no banco. Cadastre um pelo app primeiro.');
      process.exit(1);
    }
    console.log(`Usuário alvo: ID=${user.ID}, NOME=${user.NOME}`);

    const [existing] = await db.query(
      'SELECT ID, TIPO_SENSOR, ATIVO FROM DISPOSITIVOS WHERE ID_USUARIO = ?',
      [user.ID]
    );

    if (existing.length > 0) {
      const ok = existing.find(d => d.TIPO_SENSOR === 'AMBOS' && !!d.ATIVO);
      if (ok) {
        console.log(`Dispositivo ID=${ok.ID} já está pronto (AMBOS + ATIVO).`);
        process.exit(0);
      }
      await db.query(
        "UPDATE DISPOSITIVOS SET TIPO_SENSOR='AMBOS', ATIVO=TRUE WHERE ID=?",
        [existing[0].ID]
      );
      console.log(`Dispositivo ID=${existing[0].ID} atualizado para AMBOS + ATIVO.`);
      process.exit(0);
    }

    const [result] = await db.query(
      "INSERT INTO DISPOSITIVOS (ID_USUARIO, ENDERECO_MAC, TIPO_SENSOR, ATIVO) VALUES (?, ?, 'AMBOS', TRUE)",
      [user.ID, 'AA:BB:CC:DD:EE:FF']
    );
    console.log(`Dispositivo criado: ID=${result.insertId}, USER=${user.ID}.`);
    process.exit(0);
  } catch (err) {
    console.error('Erro:', err.message);
    process.exit(1);
  }
}

seedDevice();
