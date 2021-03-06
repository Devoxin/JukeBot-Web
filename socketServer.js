const WebSocket  = require('ws');
const config     = require('./config');

class SocketServer {
  constructor () {
    this.start();
  }

  start () {
    const server = this.server = new WebSocket.Server({ port: config.wsPort });
    server.on('connection', this._handleConnection.bind(this));
  }

  _handleConnection (client) {
    client.on('message', this._handleMessage.bind(this, client));
  }

  _handleMessage (client, data) {
    if ('string' !== typeof data) {
      return;
    }

    if (data.startsWith('guild:')) {
      client.guildId = data.split(':')[1];
    }
  }

  dispatchPayload (guildId, event, data) {
    const payload = JSON.stringify({
      event,
      d: data
    });

    for (const ws of this.server.clients.values()) {
      if (ws.readyState !== WebSocket.OPEN || ws.guildId !== guildId) {
        continue;
      }

      ws.send(payload);
    }
  }
}

module.exports = SocketServer;
