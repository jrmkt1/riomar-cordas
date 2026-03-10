const { execSync } = require('child_process');

const ACCEPTED_PACKAGES = new Set([
  'sqlite3',
  'node-gyp',
  'make-fetch-happen',
  'cacache',
  'tar',
  'http-proxy-agent',
  '@tootallnate/once',
]);

function runAudit() {
  try {
    const out = execSync('npm audit --omit=dev --json', { encoding: 'utf8' });
    return JSON.parse(out);
  } catch (error) {
    const stdout = error.stdout ? error.stdout.toString() : '';
    if (!stdout) throw error;
    return JSON.parse(stdout);
  }
}

function isHighOrCritical(severity) {
  return severity === 'high' || severity === 'critical';
}

function main() {
  const report = runAudit();
  const vulns = report.vulnerabilities || {};

  const unexpected = Object.entries(vulns)
    .filter(([, info]) => isHighOrCritical(info.severity))
    .filter(([name]) => !ACCEPTED_PACKAGES.has(name))
    .map(([name, info]) => ({ name, severity: info.severity }));

  if (unexpected.length > 0) {
    console.error('Falha de seguranca: vulnerabilidades altas/criticas fora da lista aceita.');
    unexpected.forEach((item) => {
      console.error(`- ${item.name} (${item.severity})`);
    });
    process.exit(1);
  }

  const meta = report.metadata?.vulnerabilities || {};
  console.log(
    `OK: sem novas vulnerabilidades high/critical fora do risco aceito. Totais atuais: high=${meta.high || 0}, critical=${meta.critical || 0}.`
  );
}

main();
