import { execFileSync } from 'node:child_process';

// Ordered cheapest first, so a formatting slip fails in seconds rather than
// after a production build. `sourceOnly` mirrors CI's per-step gates, plus the
// build and the browser suite, which CI runs in its second job and the release
// checklist requires before a pull request.
const CHECKS = [
  { args: ['prettier:check'], name: 'Formatting' },
  { args: ['docs:check-links'], name: 'Documentation links' },
  { args: ['agent:check-config'], name: 'Agent configuration' },
  {
    args: ['css-vars:check'],
    name: 'Generated CSS variables',
    sourceOnly: true,
  },
  { args: ['icons:check'], name: 'Generated icons', sourceOnly: true },
  { args: ['eslint:check'], name: 'Lint', sourceOnly: true },
  { args: ['type-check'], name: 'Types', sourceOnly: true },
  {
    args: [
      'tsc',
      '--pretty',
      '--noEmit',
      '--project',
      'service-worker/tsconfig.json',
    ],
    name: 'Types (service worker)',
    sourceOnly: true,
  },
  { args: ['test:coverage'], name: 'Unit tests' },
  { args: ['build'], name: 'Production build', sourceOnly: true },
  { args: ['test:e2e'], name: 'Browser suite', sourceOnly: true },
];

const classify = () => {
  const output = execFileSync(
    'node',
    ['scripts/classify-change.mjs', '--explain'],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] }
  );

  return output.includes('docs_only=true');
};

const documentationOnly = classify();
const [running, skipped] = [
  CHECKS.filter(check => !documentationOnly || !check.sourceOnly),
  CHECKS.filter(check => documentationOnly && check.sourceOnly),
];

// Printed rather than silently applied: a wrong classification should be
// visible in the output, not just cheap.
if (documentationOnly) {
  console.log(
    `\nDocumentation-only change. Skipping ${skipped.length} check(s) that cannot be affected: ${skipped.map(check => check.name).join(', ')}.`
  );
  console.log(
    'CI decides this again for itself, so a wrong skip here costs a round trip rather than a merge.\n'
  );
} else {
  console.log('\nNot documentation-only. Running everything.\n');
}

for (const check of running) {
  console.log(`── ${check.name}`);

  try {
    execFileSync('yarn', check.args, { stdio: 'inherit' });
  } catch {
    console.error(`\n${check.name} failed. Stopping here.`);
    process.exit(1);
  }
}

console.log(`\nAll ${running.length} check(s) passed.`);
