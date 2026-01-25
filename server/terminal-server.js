const http = require('node:http')
const path = require('node:path')
const os = require('node:os')
const { WebSocketServer } = require('ws')
const pty = require('node-pty')
const { spawn } = require('node:child_process')

const HOST = process.env.TERMINAL_HOST || '127.0.0.1'
const PORT = Number(process.env.TERMINAL_PORT || 3211)
const AUTH_TOKEN = process.env.TERMINAL_AUTH_TOKEN || ''
const ALLOWED_ROOTS = (process.env.TERMINAL_ALLOWED_ROOTS || '')
  .split(',')
  .map((entry) => entry.trim())
  .filter(Boolean)

const server = http.createServer()
const wss = new WebSocketServer({ server })

function isAllowedPath(targetPath) {
  if (ALLOWED_ROOTS.length === 0) return true
  const resolved = path.resolve(targetPath)
  return ALLOWED_ROOTS.some((root) => resolved.startsWith(path.resolve(root)))
}

function resolveWorkingDir(requested) {
  const fallback = process.env.TERMINAL_DEFAULT_CWD || os.homedir()
  if (!requested) return fallback
  if (!isAllowedPath(requested)) return fallback
  return requested
}

wss.on('connection', (socket) => {
  let ptyProcess = null
  let fallbackProcess = null
  let mode = null

  const safeSend = (payload) => {
    if (socket.readyState === socket.OPEN) {
      socket.send(JSON.stringify(payload))
    }
  }

  const cleanup = () => {
    if (ptyProcess) {
      ptyProcess.kill()
      ptyProcess = null
    }
    if (fallbackProcess) {
      fallbackProcess.kill()
      fallbackProcess = null
    }
    mode = null
  }

  const attachPty = (cwd) => {
    if (!ptyProcess) return
    ptyProcess.on('data', (data) => safeSend({ type: 'output', data }))
    ptyProcess.on('exit', () => {
      safeSend({ type: 'status', message: 'Shell exited.' })
      ptyProcess = null
      mode = null
    })
    safeSend({ type: 'status', message: `Shell started (${cwd}).` })
  }

  const attachFallback = (cwd) => {
    if (!fallbackProcess) return
    fallbackProcess.stdout.on('data', (data) => safeSend({ type: 'output', data: data.toString() }))
    fallbackProcess.stderr.on('data', (data) => safeSend({ type: 'output', data: data.toString() }))
    fallbackProcess.on('close', () => {
      safeSend({ type: 'status', message: 'Shell exited.' })
      fallbackProcess = null
      mode = null
    })
    safeSend({ type: 'status', message: `Shell started (${cwd}).` })
  }

  const startPty = (shellPath, cwd, env, cols, rows) => {
    try {
      ptyProcess = pty.spawn(shellPath, [], {
        name: 'xterm-color',
        cols,
        rows,
        cwd,
        env,
      })
      mode = 'pty'
      attachPty(cwd)
      return true
    } catch (error) {
      const messageText = error && typeof error.message === 'string'
        ? error.message
        : `Failed to start shell: ${shellPath}`
      safeSend({ type: 'error', message: messageText })
      return false
    }
  }

  const startFallback = (shellPath, cwd, env, args) => {
    try {
      fallbackProcess = spawn(shellPath, args, {
        cwd,
        env,
        stdio: 'pipe',
      })
      mode = 'process'
      attachFallback(cwd)
      return true
    } catch (error) {
      const messageText = error && typeof error.message === 'string'
        ? error.message
        : `Fallback failed: ${shellPath}`
      safeSend({ type: 'error', message: messageText })
      return false
    }
  }

  socket.on('message', (raw) => {
    let message
    try {
      message = JSON.parse(raw.toString())
    } catch {
      safeSend({ type: 'error', message: 'Invalid JSON payload.' })
      return
    }

    if (message.type === 'init') {
      if (AUTH_TOKEN && message.token !== AUTH_TOKEN) {
        safeSend({ type: 'error', message: 'Unauthorized.' })
        socket.close()
        return
      }

      if (ptyProcess || fallbackProcess) {
        safeSend({ type: 'status', message: 'Shell already running.' })
        return
      }

      const shell = message.shell || process.env.SHELL || '/bin/zsh'
      const fallbackShell = process.env.TERMINAL_FALLBACK_SHELL || '/bin/bash'
      const cwd = resolveWorkingDir(message.cwd)
      const env = { ...process.env, ...(message.env || {}) }
      delete env.npm_config_prefix
      delete env.NPM_CONFIG_PREFIX
      delete env.npm_config_userconfig
      delete env.NPM_CONFIG_USERCONFIG
      const cols = Number(message.cols || 120)
      const rows = Number(message.rows || 30)
      const fallbackArgs = (process.env.TERMINAL_FALLBACK_ARGS || '-i')
        .split(' ')
        .filter(Boolean)

      if (startPty(shell, cwd, env, cols, rows)) return
      if (fallbackShell && fallbackShell !== shell) {
        if (startPty(fallbackShell, cwd, env, cols, rows)) return
      }
      if (startFallback(shell, cwd, env, fallbackArgs)) return
      if (fallbackShell && fallbackShell !== shell) {
        startFallback(fallbackShell, cwd, env, fallbackArgs)
      }
      return
    }

    if (message.type === 'input') {
      if (mode === 'pty' && ptyProcess) {
        ptyProcess.write(message.data || '')
      } else if (mode === 'process' && fallbackProcess && fallbackProcess.stdin) {
        fallbackProcess.stdin.write(message.data || '')
      }
      return
    }

    if (message.type === 'resize') {
      if (mode === 'pty' && ptyProcess) {
        ptyProcess.resize(Number(message.cols || 120), Number(message.rows || 30))
      }
      return
    }

    if (message.type === 'kill') {
      cleanup()
      safeSend({ type: 'status', message: 'Shell terminated.' })
      return
    }
  })

  socket.on('close', () => {
    cleanup()
  })
})

server.listen(PORT, HOST, () => {
  // eslint-disable-next-line no-console
  console.log(`Live shell listening on ws://${HOST}:${PORT}`)
})
