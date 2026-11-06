#!/usr/bin/env node
import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { resolve, dirname, relative, join } from 'node:path';
import { parse } from 'yaml';

function files(directory) {
  return readdirSync(directory, { withFileTypes: true })
    .sort((left, right) => left.name < right.name ? -1 : left.name > right.name ? 1 : 0)
    .flatMap(entry => {
      const source = join(directory, entry.name);
      if (entry.isDirectory()) {
        return files(source);
      }
      return entry.name.endsWith('.schema.yaml') ? [source] : [];
    });
}
const portable = value => value.replaceAll('\\', '/');
const escapeMarkdown = value => String(value)
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
  .replaceAll('\\', '&#92;').replaceAll('`', '&#96;').replaceAll('*', '&#42;')
  .replaceAll('_', '&#95;').replaceAll('[', '&#91;').replaceAll(']', '&#93;')
  .replaceAll('|', '&#124;').replaceAll('\r', ' ').replaceAll('\n', ' ');

function render(schemaDirectory, output) {
  const sources = files(schemaDirectory);
  if (!sources.length) {
    throw new Error('No schema files found');
  }
  const lines = ['# Realm v2.3 schema atlas', '',
    'Generated from the shipped YAML schemas. The YAML schemas define validation; this atlas lists fields, definitions, references and selected constraints rather than replacing a validator.',
    '', '## Schema files', ''];
  for (const source of sources) {
    const name = portable(relative(schemaDirectory, source));
    const link = encodeURI(portable(relative(dirname(output), source))).replaceAll('#', '%23').replaceAll('(', '%28').replaceAll(')', '%29');
    lines.push(`- [${escapeMarkdown(name)}](${link})`);
  }
  for (const source of sources) {
    const schema = parse(readFileSync(source, 'utf8'));
    const name = portable(relative(schemaDirectory, source));
    lines.push('', `## ${escapeMarkdown(name)}`, '', escapeMarkdown(schema?.title ?? ''), '',
      '| JSON Pointer | Type / constraints | Reference |', '|---|---|---|');
    function visit(value, pointer) {
      const isObject = Boolean(value) && typeof value === 'object';
      if (!isObject) {
        return;
      }
      const constraints = ['type', 'required', 'enum', 'const', 'pattern', 'additionalProperties', 'description']
        .filter(key => value[key] !== undefined)
        .map(key => `${key}: ${typeof value[key] === 'string' ? value[key] : JSON.stringify(value[key])}`);
      const hasRow = constraints.length > 0 || value.$ref !== undefined;
      if (hasRow) {
        lines.push(`| ${escapeMarkdown(pointer || '/')} | ${escapeMarkdown(constraints.join('; '))} | ${escapeMarkdown(value.$ref ?? '')} |`);
      }
      for (const [key, child] of Object.entries(value)) {
        if (key === 'x-gdsm') {
          continue;
        }
        visit(child, `${pointer}/${key.replaceAll('~', '~0').replaceAll('/', '~1')}`);
      }
    }
    visit(schema, '');
  }
  return `${lines.join('\n')}\n`;
}
try {
  const [mode, ...argumentsList] = process.argv.slice(2);
  if (!['generate', 'check'].includes(mode)) {
    throw new Error('Usage: cli.mjs generate|check [--schema directory] [--out file]');
  }
  let schemaDirectory = resolve('schema/v2.3');
  let output = resolve('docs/schema-atlas/2026-11-06-reference.md');
  for (let index = 0; index < argumentsList.length; index++) {
    const argument = argumentsList[index];
    const value = argumentsList[index + 1];
    const known = ['--schema', '--out'].includes(argument);
    const complete = Boolean(value) && !value.startsWith('--');
    if (!known) {
      throw new Error(`Unknown or incomplete option: ${argument}`);
    }
    if (!complete) {
      throw new Error(`Unknown or incomplete option: ${argument}`);
    }
    index++;
    if (argument === '--schema') {
      schemaDirectory = resolve(value);
    } else {
      output = resolve(value);
    }
  }
  const body = render(schemaDirectory, output);
  if (mode === 'generate') {
    mkdirSync(dirname(output), { recursive: true });
    writeFileSync(output, body);
    console.log('Atlas generated');
  } else {
    const matches = existsSync(output) && readFileSync(output, 'utf8') === body;
    console.log(matches ? 'Atlas is current' : 'Atlas missing or stale: run cli.mjs generate');
    process.exitCode = matches ? 0 : 1;
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 2;
}
