#!/usr/bin/env node
/**
 * check-i18n-complete.mjs
 *
 * Valida que os catálogos Lingui estão 100% alinhados:
 *
 * 1. Roda `lingui extract --clean` para sincronizar os .po com o código-fonte.
 * 2. Se algum .po mudou após o extract → há keys novas no código que não foram
 *    extraídas. Reverte as mudanças e falha (1).
 * 3. Se algum entry não-source ainda tem `msgstr ""` não-vazio → há traduções
 *    pendentes. Falha (2).
 *
 * Exit 0 se tudo OK. Exit 1 se alguma das falhas acima.
 *
 * Uso: node scripts/check-i18n-complete.mjs
 */

import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const SOURCE_LOCALE = 'pt-BR'
const LOCALES = ['pt-BR', 'es']
const LOCALES_DIR = 'src/locales'

const poFiles = LOCALES.map((l) => path.join(LOCALES_DIR, l, 'messages.po'))

// ---------------------------------------------------------------------------
// STEP 1 — Snapshot .po atuais para detectar drift após o extract
// ---------------------------------------------------------------------------
const snapshots = {}
for (const po of poFiles) {
  snapshots[po] = fs.existsSync(po) ? fs.readFileSync(po, 'utf-8') : null
}

// ---------------------------------------------------------------------------
// STEP 2 — Roda o extract (atualiza source refs + adiciona keys novas)
// ---------------------------------------------------------------------------
try {
  execSync('npm run --silent i18n:extract', { stdio: 'pipe' })
} catch (err) {
  console.error('[31m✗ i18n:extract failed[0m')
  console.error(err.stderr?.toString() || err.stdout?.toString() || err.message)
  process.exit(1)
}

// ---------------------------------------------------------------------------
// STEP 3 — Detecta drift (keys adicionadas no código mas não commitadas no .po)
//
// Ignora apenas mudanças nos comentários de source-reference (`#:`): o extract
// atualiza line numbers automaticamente e isso não indica keys novas.
// ---------------------------------------------------------------------------
function stripSourceRefs(content) {
  return content
    .split('\n')
    .filter((l) => !l.startsWith('#:'))
    .join('\n')
}

const driftFiles = []
for (const po of poFiles) {
  const before = snapshots[po]
  const after = fs.existsSync(po) ? fs.readFileSync(po, 'utf-8') : null

  if (before === null && after !== null) {
    driftFiles.push({ po, reason: 'new file created by extract' })
    continue
  }

  if (stripSourceRefs(before ?? '') !== stripSourceRefs(after ?? '')) {
    driftFiles.push({ po, reason: 'keys added or removed' })
  }
}

if (driftFiles.length > 0) {
  // Restaura snapshots para não sujar o working tree do desenvolvedor com line
  // numbers atualizados — ele deve rodar `npm run i18n:extract` explicitamente.
  for (const po of poFiles) {
    if (snapshots[po] !== null) {
      fs.writeFileSync(po, snapshots[po])
    }
  }

  console.error('')
  console.error('[31m╳ i18n catalogs are out of sync with the source code[0m')
  console.error('')
  for (const { po, reason } of driftFiles) {
    console.error(`  [33m${po}[0m — ${reason}`)
  }
  console.error('')
  console.error('  → Run [36mnpm run i18n:extract[0m, translate new entries,')
  console.error('    and commit the updated [36m.po[0m files.')
  console.error('')
  process.exit(1)
}

// ---------------------------------------------------------------------------
// STEP 4 — Parse .po de locales não-source e detecta msgstr vazios
// ---------------------------------------------------------------------------
function parsePoFile(content) {
  const entries = content.split(/\n\n+/)
  const parsed = []

  for (const entry of entries) {
    const lines = entry.split('\n').filter(Boolean)

    const msgidIdx = lines.findIndex((l) => l.startsWith('msgid '))
    if (msgidIdx === -1) continue

    let msgid = lines[msgidIdx].replace(/^msgid\s+"([\s\S]*)"$/, '$1')
    let i = msgidIdx + 1
    while (i < lines.length && lines[i].startsWith('"')) {
      msgid += lines[i].replace(/^"([\s\S]*)"$/, '$1')
      i++
    }

    const msgstrIdx = lines.findIndex((l) => l.startsWith('msgstr '))
    if (msgstrIdx === -1) continue

    let msgstr = lines[msgstrIdx].replace(/^msgstr\s+"([\s\S]*)"$/, '$1')
    let j = msgstrIdx + 1
    while (j < lines.length && lines[j].startsWith('"')) {
      msgstr += lines[j].replace(/^"([\s\S]*)"$/, '$1')
      j++
    }

    parsed.push({ msgid, msgstr })
  }

  return parsed
}

let exitCode = 0
const missingReport = []

for (const locale of LOCALES) {
  if (locale === SOURCE_LOCALE) continue

  const poPath = path.join(LOCALES_DIR, locale, 'messages.po')
  if (!fs.existsSync(poPath)) {
    console.error(`[31m✗[0m Catalog file not found: ${poPath}`)
    exitCode = 1
    continue
  }

  const content = fs.readFileSync(poPath, 'utf-8')
  const entries = parsePoFile(content)

  // Header do .po tem msgid vazio — não conta.
  const missing = entries.filter((e) => e.msgid !== '' && e.msgstr === '')

  if (missing.length > 0) {
    exitCode = 1
    missingReport.push({ locale, missing })
  }
}

if (exitCode === 1 && missingReport.length > 0) {
  console.error('')
  console.error('[31m╳ Missing i18n translations detected[0m')
  console.error('')
  for (const { locale, missing } of missingReport) {
    console.error(`  [33m${locale}[0m — ${missing.length} missing:`)
    for (const { msgid } of missing.slice(0, 10)) {
      const preview = msgid.length > 80 ? `${msgid.slice(0, 77)}...` : msgid
      console.error(`    • "${preview}"`)
    }
    if (missing.length > 10) {
      console.error(`    • ...and ${missing.length - 10} more`)
    }
    console.error('')
  }
  console.error(`  → Fill the empty [36mmsgstr ""[0m entries in [36msrc/locales/<locale>/messages.po[0m.`)
  console.error('')
  process.exit(exitCode)
}

console.log('[32m✓[0m All i18n catalogs are in sync and translations complete.')
