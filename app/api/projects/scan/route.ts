import { NextResponse } from 'next/server'
import fs from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'

const DEFAULT_ALLOWED = [os.homedir()]

function normalizeAllowedRoots() {
  const fromEnv = process.env.PROJECT_ALLOWED_ROOTS || process.env.TERMINAL_ALLOWED_ROOTS || ''
  const roots = fromEnv
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
  return roots.length > 0 ? roots : DEFAULT_ALLOWED
}

function isAllowedPath(targetPath: string) {
  const resolved = path.resolve(targetPath)
  return normalizeAllowedRoots().some((root) => resolved.startsWith(path.resolve(root)))
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function inferCategory(name: string, command: string) {
  const lowered = `${name} ${command}`.toLowerCase()
  if (lowered.includes('docker')) return 'docker'
  if (lowered.includes('vercel') || lowered.includes('deploy')) return 'vercel'
  if (['dev', 'start', 'build', 'lint', 'test', 'typecheck'].some((key) => name.includes(key))) {
    return 'npm'
  }
  return 'workflow'
}

function inferIcon(category: string) {
  if (category === 'docker') return 'Container'
  if (category === 'vercel') return 'Cloud'
  if (category === 'npm') return 'Package'
  return 'Workflow'
}

function inferDangerous(command: string) {
  const lowered = command.toLowerCase()
  return lowered.includes('rm ') || lowered.includes('delete') || lowered.includes('drop')
}

export async function POST(request: Request) {
  let payload: { path?: string }

  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON payload.' }, { status: 400 })
  }

  if (!payload.path) {
    return NextResponse.json({ ok: false, error: 'path is required.' }, { status: 400 })
  }

  const resolvedPath = path.resolve(payload.path)
  if (!isAllowedPath(resolvedPath)) {
    return NextResponse.json({ ok: false, error: 'Path is outside allowed roots.' }, { status: 403 })
  }

  const packageJsonPath = path.join(resolvedPath, 'package.json')
  let packageJson
  try {
    const raw = await fs.readFile(packageJsonPath, 'utf-8')
    packageJson = JSON.parse(raw)
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: 'package.json not found or invalid.' },
      { status: 404 }
    )
  }

  const scripts = packageJson.scripts || {}
  const projectName = packageJson.name || path.basename(resolvedPath)
  const slug = slugify(projectName)

  const commands = Object.entries(scripts).map(([name, cmd]) => {
    const command = `npm run ${name}`
    const category = inferCategory(name, String(cmd))
    return {
      id: `${slug}-${slugify(name)}`,
      name: name.replace(/(^\w|[-_\s]\w)/g, (match) => match.replace(/[-_\s]/, '').toUpperCase()),
      description: `Script from package.json: ${name}`,
      category,
      command,
      icon: inferIcon(category),
      status: 'stub',
      dangerous: inferDangerous(String(cmd)),
    }
  })

  return NextResponse.json({
    ok: true,
    project: {
      name: projectName,
      path: resolvedPath,
      scriptCount: Object.keys(scripts).length,
      scripts,
      commands,
    },
  })
}
