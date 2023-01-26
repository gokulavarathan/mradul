module.exports = {
  apps: [{
    name: "Mradhul Exchange",
    script: "server.js",
    log: './logs/combined.outerr.log',
    output: 'logs/pm2/out.log',
    error: 'logs/pm2/error.log',
    watch: true,
    ignore_watch: ["logs/*", "public/uploads/*", "public/*"],
    env: {
      "NODE_ENV": "devel",
      "ENCR_KEY_MAIL": "TmV4YSBNYWlsIENyZWRlbnRpYWw",
      "ENCR_KEY_DB": "TmV4YSBEYXRhQmFzZSBDcmVkZW50aWFs",
      "ENCR_API_KEY": "TmV4YWJvb2sgYWNjZXNzIEtFWXM",
      "ENCR_DATA_KEY": "dXNhcmF5aWh0YU0=="
    },
    env_production: {
      "NODE_ENV": "prod",
      "ENCR_KEY_MAIL": "TmV4YSBNYWlsIENyZWRlbnRpYWw",
      "ENCR_KEY_DB": "TmV4YSBEYXRhQmFzZSBDcmVkZW50aWFs",
      "ENCR_API_KEY": "TmV4YWJvb2sgYWNjZXNzIEtFWXM",
      "ENCR_DATA_KEY": "dXNhcmF5aWh0YU0=="
    },
  }]
}