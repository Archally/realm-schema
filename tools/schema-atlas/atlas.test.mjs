import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, existsSync, statSync, readdirSync, utimesSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const executable = fileURLToPath(new URL('./cli.mjs', import.meta.url));
function fixture(context) {
  const root = mkdtempSync(join(tmpdir(), 'realm-atlas-'));
  context.after(() => rmSync(root, { recursive: true, force: true }));
  const schemaDirectory = join(root, 'schema/v2.3');
  const output = join(root, 'docs/schema-atlas/2026-11-06-reference.md');
  mkdirSync(join(schemaDirectory, 'topology/deep'), { recursive: true });
  writeFileSync(join(schemaDirectory, 'realm.schema.yaml'), 'title: Realm\ntype: object\nproperties:\n  parcels:\n    type: array\n    items:\n      $ref: "topology/deep/estate.schema.yaml#/$defs/parcel"\n');
  writeFileSync(join(schemaDirectory, 'topology/deep/estate.schema.yaml'), 'title: Estate\n$defs:\n  parcel:\n    type: object\n    properties:\n      "a/b~c":\n        type: string\n        description: |\n          A | B <tag> `code` [link] *text* \\path\n          next line\n    allOf:\n      - required: [id]\n    additionalProperties: false\nx-gdsm:\n  description: omitted metadata\n');
  writeFileSync(join(schemaDirectory, 'empty.schema.yaml'), 'title: Empty\n');
  writeFileSync(join(schemaDirectory, 'ignored.template.yaml'), 'type: object\n');
  const run = (...argumentsList) => spawnSync(process.execPath, [executable, ...argumentsList], { cwd: root, encoding: 'utf8' });
  return { root, schemaDirectory, output, run };
}

test('independent file enumeration detects index and section omissions and resolves source links', context => {
  const { schemaDirectory, output, run } = fixture(context);
  assert.equal(run('generate').status, 0);
  const body = readFileSync(output, 'utf8');
  const expected = readdirSync(schemaDirectory, { recursive: true })
    .filter(name => name.endsWith('.schema.yaml')).map(name => name.replaceAll('\\', '/')).sort();
  const indexEntries = [...body.matchAll(/^- \[([^\n]+)\]\(([^\n]+)\)$/gm)];
  assert.deepEqual(indexEntries.map(entry => entry[1]).sort(), expected);
  const sections = [...body.matchAll(/^## (.+\.schema\.yaml)$/gm)].map(entry => entry[1]).sort();
  assert.deepEqual(sections, expected);
  for (const [, name, link] of indexEntries) {
    assert.equal(relative(schemaDirectory, resolve(dirname(output), decodeURI(link))).replaceAll('\\', '/'), name);
    assert.ok(existsSync(resolve(dirname(output), decodeURI(link))));
  }
});

test('public-shaped default invocation has Realm title, defaults and deterministic bytes', context => {
  const { root, output, run } = fixture(context);
  assert.equal(run('generate').status, 0);
  assert.ok(existsSync(output));
  const body = readFileSync(output, 'utf8');
  assert.match(body, /^# Realm v2\.3 schema atlas\n/);
  assert.match(body, /YAML schemas define validation.*selected constraints.*rather than replacing a validator/);
  assert.ok(!body.includes(root));
  assert.equal(run('generate').status, 0);
  assert.equal(readFileSync(output, 'utf8'), body);
});

test('traverses nested definitions, arrays and references with JSON Pointer and Markdown escaping', context => {
  const { output, run } = fixture(context);
  assert.equal(run('generate').status, 0);
  const body = readFileSync(output, 'utf8');
  assert.match(body, /\/\$defs\/parcel\/properties\/a~1b~0c/);
  assert.match(body, /\/\$defs\/parcel\/allOf\/0 \| required: &#91;"id"&#93;/);
  assert.match(body, /topology\/deep\/estate\.schema\.yaml#\/\$defs\/parcel/);
  assert.match(body, /A &#124; B &lt;tag&gt; &#96;code&#96; &#91;link&#93; &#42;text&#42; &#92;path next line/);
  assert.ok(!body.includes('omitted metadata'));
});

test('check preserves bytes and mtime for current and stale output and never creates missing output', context => {
  const { output, run } = fixture(context);
  assert.equal(run('check').status, 1);
  assert.ok(!existsSync(output));
  assert.ok(!existsSync(dirname(output)));
  assert.equal(run('generate').status, 0);
  for (const stale of [false, true]) {
    if (stale) {
      writeFileSync(output, 'stale');
    }
    utimesSync(output, 1234567890, 1234567890);
    const before = readFileSync(output);
    const modified = statSync(output).mtimeMs;
    assert.equal(run('check').status, stale ? 1 : 0);
    assert.deepEqual(readFileSync(output), before);
    assert.equal(statSync(output).mtimeMs, modified);
  }
});

test('explicit schema and output options resolve from the working directory', context => {
  const { root, run } = fixture(context);
  assert.equal(run('generate', '--schema', 'schema/v2.3', '--out', 'custom/reference.md').status, 0);
  assert.ok(existsSync(join(root, 'custom/reference.md')));
  assert.equal(run('check', '--schema', 'schema/v2.3', '--out', 'custom/reference.md').status, 0);
});

test('empty schema tree fails clearly without creating output', context => {
  const { root, output, run } = fixture(context);
  mkdirSync(join(root, 'empty'));
  const result = run('generate', '--schema', 'empty');
  assert.equal(result.status, 2);
  assert.match(result.stderr, /No schema files found/);
  assert.ok(!existsSync(output));
});

test('malformed YAML fails without changing existing output', context => {
  const { schemaDirectory, output, run } = fixture(context);
  assert.equal(run('generate').status, 0);
  const before = readFileSync(output);
  writeFileSync(join(schemaDirectory, 'broken.schema.yaml'), 'type: [\n');
  assert.equal(run('generate').status, 2);
  assert.equal(run('check').status, 2);
  assert.deepEqual(readFileSync(output), before);
});

test('invalid modes and options including option-valued missing arguments fail without writes', context => {
  const { output, run } = fixture(context);
  const invalidArguments = [[], ['unknown'], ['generate', '--unknown', 'value'], ['generate', '--schema'],
    ['generate', '--out'], ['generate', '--schema', '--out', 'file.md'], ['generate', '--out', '--schema', 'schema/v2.3'],
    ['generate', 'extra'], ['generate', '--out', '']];
  for (const argumentsList of invalidArguments) {
    const result = run(...argumentsList);
    assert.equal(result.status, 2, JSON.stringify(argumentsList));
    assert.match(result.stderr, /Usage:|Unknown or incomplete option:/);
    assert.ok(!existsSync(output));
  }
});

const repository = resolve(dirname(executable), '../..');
const deployed = existsSync(join(repository, 'package.json')) && existsSync(join(repository, 'schema/v2.3'));
test('shipped atlas covers all 24 schemas with working source links and public package invariants', { skip: !deployed }, () => {
  const schemaDirectory = join(repository, 'schema/v2.3');
  const output = join(repository, 'docs/schema-atlas/2026-11-06-reference.md');
  const body = readFileSync(output, 'utf8');
  const expected = readdirSync(schemaDirectory, { recursive: true })
    .filter(name => name.endsWith('.schema.yaml')).map(name => name.replaceAll('\\', '/')).sort();
  assert.equal(expected.length, 24);
  const entries = [...body.matchAll(/^- \[([^\n]+)\]\(([^\n]+)\)$/gm)];
  assert.deepEqual(entries.map(entry => entry[1]).sort(), expected);
  assert.deepEqual([...body.matchAll(/^## (.+\.schema\.yaml)$/gm)].map(entry => entry[1]).sort(), expected);
  for (const [, name, link] of entries) {
    const target = resolve(dirname(output), decodeURI(link));
    assert.equal(relative(schemaDirectory, target).replaceAll('\\', '/'), name);
    assert.ok(existsSync(target), link);
  }
  const manifest = JSON.parse(readFileSync(join(repository, 'package.json'), 'utf8'));
  assert.equal(manifest.engines.node, '>=22.0.0');
  assert.ok(manifest.files.includes('docs/'));
  assert.equal(manifest.scripts.atlas, 'node tools/schema-atlas/cli.mjs generate');
  assert.equal(manifest.scripts['atlas:check'], 'node tools/schema-atlas/cli.mjs check');
  assert.match(readFileSync(join(repository, '.github/workflows/validate.yml'), 'utf8'), /node-version: 22\b/);
  for (const path of ['LICENSE', 'tools/LICENSE']) {
    const license = readFileSync(join(repository, path), 'utf8');
    assert.match(license.split('Functional Source License 1.1')[0], /schema-atlas\//);
  }
});
