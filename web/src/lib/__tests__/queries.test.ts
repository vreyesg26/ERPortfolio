import {readdirSync, readFileSync, statSync} from 'node:fs'
import {join} from 'node:path'
import {describe, expect, it} from 'vitest'

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f)
    if (statSync(p).isDirectory()) return f === '__tests__' ? [] : walk(p)
    return /\.(ts|tsx|astro)$/.test(f) && !f.endsWith('sanity.types.ts') ? [p] : []
  })

describe('defineQuery', () => {
  it('cada defineQuery tiene un nombre único en todo el proyecto', () => {
    const names = walk(join(__dirname, '../..')).flatMap((p) =>
      [...readFileSync(p, 'utf8').matchAll(/(?:const|let|var)\s+(\w+)\s*=\s*defineQuery\(/g)].map(
        (m) => m[1],
      ),
    )
    expect(names.length).toBe(7)
    expect(new Set(names).size).toBe(names.length)
  })
})
