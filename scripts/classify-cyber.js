const fs = require('fs');
const cyber = JSON.parse(fs.readFileSync('data/cyber-prospects.json', 'utf8'));

const cyberKeywords = [
  'cloudflare', 'horizon3', 'qualys', 'crowdstrike', 'cyberhaven', 'sumo logic',
  'netenrich', 'cyberark', 'ndatastor', 'brinqa', 'hive pro', 'underdefense',
  'mind sequencing', 'upguard', 'agileblue', 'asimily', 'material security',
  'security', 'cyber', 'secops', 'infosec', 'threat', 'vulnerability',
  'firewall', 'endpoint', 'siem', 'pentest', 'breach', 'malware',
  'halcyon', 'netskope', 'varonis', 'deepwatch', 'trustwave', 'secureworks',
  'mimecast', 'knowbe4', 'sailpoint', 'beyondtrust', 'bitdefender',
  'armis', 'claroty', 'nozomi', 'dragos', 'salt security',
  'checkmarx', 'veracode', 'drata', 'vanta', 'secureframe',
  'cobalt', 'bugcrowd', 'hackerone', 'island', 'menlo',
  'binary defense', 'invictus', 'defense', 'sentinel', 'fortinet',
  'zscaler', 'okta', 'proofpoint', 'tenable', 'rapid7', 'mandiant',
  'sophos', 'darktrace', 'recorded future', 'snyk', 'wiz', 'orca',
  'axonius', 'abnormal', 'expel', 'huntress', 'arctic wolf',
  'nucleus', 'plextrac'
];

const notCyberKeywords = [
  'google', 'meta', 'facebook', 'roblox', 'zynga', 'microsoft', 'apple',
  'coursera', 'epic games', 'waymo', 'cvs', 'alaska airlines', 'morgan stanley',
  'rakuten', 'hard rock', 'linkedin', 'amazon', 'netflix', 'uber', 'lyft',
  'airbnb', 'snap', 'pinterest', 'spotify', 'stripe', 'square',
  'paypal', 'shopify', 'salesforce', 'adobe', 'oracle',
  'nvidia', 'amd', 'intel', 'tesla', 'nike', 'disney',
  'freshpaint', 'monad', 'rapport', 'snowflake', 'fexa',
  'postmates', 'doordash', 'instacart', 'grubhub',
  'slack', 'zoom', 'twilio', 'datadog', 'mongodb', 'confluent',
  'hashicorp', 'elastic', 'splunk', 'new relic', 'pagerduty'
];

function classify(company) {
  if (!company) return 'unknown';
  const lower = company.toLowerCase();
  for (const kw of cyberKeywords) {
    if (lower.includes(kw)) return 'cyber';
  }
  for (const kw of notCyberKeywords) {
    if (lower.includes(kw)) return 'not_cyber';
  }
  return 'unknown';
}

const results = { cyber: [], not_cyber: [], unknown: [] };
cyber.prospects.forEach(p => {
  const cat = classify(p.company);
  results[cat].push(p);
});

console.log('=== CYBER (keep in Tool 2): ' + results.cyber.length + ' ===');
results.cyber.forEach(p => console.log('  ' + p.name + ' | ' + p.company + ' | ' + p.title + ' | ' + p.status));

console.log('\n=== NOT CYBER (remove or move to Tool 1): ' + results.not_cyber.length + ' ===');
results.not_cyber.forEach(p => console.log('  ' + p.name + ' | ' + p.company + ' | ' + p.title + ' | ' + p.status));

console.log('\n=== UNKNOWN (need review): ' + results.unknown.length + ' ===');
results.unknown.forEach(p => console.log('  ' + p.name + ' | ' + p.company + ' | ' + p.title + ' | ' + p.status));
