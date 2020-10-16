const mqemitter = require('mqemitter-mongodb');
const mongoPersistence = require('aedes-persistence-mongodb');
const port = process.env.PORT || 1883;
const MONGO_URL = process.env.MONGODB_URI || 'mongodb://localhost/aedes-clusters';

const aedes = require('aedes')({
  id: 'YOYO_BROKER',
    mq: mqemitter({
      url: MONGO_URL
    }),
    persistence: mongoPersistence({
      url: MONGO_URL,
      ttl: {
        packets: 300, // Number of seconds
        subscriptions: 300
      }
    })
});

aedes.on('subscribe', function (subscriptions, client) {
  console.log('MQTT client \x1b[32m' + (client ? client.id : client) +
          '\x1b[0m subscribed to topics: ' + subscriptions.map(s => s.topic).join('\n'), 'from broker')
});

// On client unsubscribe
aedes.on('unsubscribe', function (subscriptions, client) {
  console.log('MQTT client \x1b[33m' + (client ? client.id : client) +
          '\x1b[0m unsubscribed to topics: ' + subscriptions.join('\n'), 'from broker')
});

// fired when a client connects
aedes.on('client', function (client) {
  console.log('Client Connected: \x1b[32m' + (client ? client.id : client) + '\x1b[0m', 'to broker')
});

// fired when a client disconnects
aedes.on('clientDisconnect', function (client) {
  console.log('Client Disconnected: \x1b[33m' + (client ? client.id : client) + '\x1b[0m', 'to broker')
});

// fired when a message is published
aedes.on('publish', async function (packet, client) {
  console.log('Client \x1b[32m' + (client ? client.id : 'BROKER_' + aedes.id) + '\x1b[0m has published', packet.payload.toString(), 'on', packet.topic, 'to broker')
});

const server = require('net').createServer(aedes.handle);
server.listen(port, () => {
  console.log('Server started on port ', port);
});
