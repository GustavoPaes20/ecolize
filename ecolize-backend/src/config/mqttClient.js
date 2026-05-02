const mqtt = require('mqtt');
require('dotenv').config();

function createMqttClient() {
  const url = `mqtts://${process.env.MQTT_HOST}:${process.env.MQTT_PORT}`;
  
  const client = mqtt.connect(url, {
    clientId:    process.env.MQTT_CLIENT_ID,
    username:    process.env.MQTT_USER,
    password:    process.env.MQTT_PASS,
    keepalive:   60,
    clean:       true,
    reconnectPeriod: 5000,        // tenta reconectar a cada 5s se cair
    connectTimeout: 30000,
    rejectUnauthorized: true,     // valida o cert do HiveMQ (Let's Encrypt)
  });

  return client;
}

module.exports = createMqttClient;