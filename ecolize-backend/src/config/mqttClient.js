const mqtt = require('mqtt');
require('dotenv').config();

function createMqttClient(options = {}) {
  const url = `mqtts://${process.env.MQTT_HOST}:${process.env.MQTT_PORT}`;
  const baseClientId = process.env.MQTT_CLIENT_ID || 'ecolize-backend';
  const clientId = options.clientId || baseClientId

  const client = mqtt.connect(url, {
    clientId,
    username: process.env.MQTT_USER,
    password: process.env.MQTT_PASS,
    keepalive: 60,
    clean: true,
    reconnectPeriod: 5000,
    connectTimeout: 30000,
    rejectUnauthorized: true,
  });

  return client;
}

module.exports = createMqttClient;