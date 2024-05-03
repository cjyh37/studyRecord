module.exports = {
    apps: [{
        name: 'lmskeldidev',
        script: './app.js',
        instances: 2,
        exec_mode: 'cluster',
        wait_ready: true,
        listen_timeout: 5000
  }]
}