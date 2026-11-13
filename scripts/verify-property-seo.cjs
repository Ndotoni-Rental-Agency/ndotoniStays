/* Regression checks for public metadata, fetch failures and exhaustive sitemap pagination.
 * Run: node scripts/verify-property-seo.cjs (uses the app's TypeScript dev dependency).
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const short = JSON.parse(fs.readFileSync(path.join(root, 'package.json'))).name === 'ndotoni-stays';
let api;
const calls = [];
function load(relative, dependencies = {}) {
  const filename = path.join(root, relative);
  const module = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  vm.runInNewContext(code, {
    module, exports: module.exports,
    require: name => {
      if (name === 'server-only') return {};
      if (name === 'react') return { cache: fn => fn };
      if (name in dependencies) return dependencies[name];
      throw new Error(`Unexpected runtime import: ${name}`);
    },
    process: { env: { NEXT_PUBLIC_GRAPHQL_ENDPOINT: 'https://fixture.invalid/graphql', NEXT_PUBLIC_API_KEY: 'fixture' } },
    fetch: async (_url, options) => {
      const body = JSON.parse(options.body); calls.push(body);
      return api(body);
    },
    AbortSignal, URL, URLSearchParams, console,
  }, { filename });
  return module.exports;
}
const location = load('src/lib/location/format.ts');
const metadata = load('src/lib/property-seo.ts', { './location/format': location });
const fetcher = load('src/lib/fetch-property.ts');
const catalog = load('src/lib/sitemap-listings.ts');
const operation = short ? 'getShortTermProperty' : 'getProperty';
const fetchProperty = short ? fetcher.fetchPropertyForSEO : fetcher.fetchLongTermPropertyForSEO;
const response = value => ({ ok: true, json: async () => value });
const property = {
  propertyId: 'real', title: '  A real\n  property ', status: 'AVAILABLE',
  region: 'dar-es-salaam', district: 'kinondoni', nightlyRate: 120000, currency: 'TZS',
  address: { district: 'kinondoni', region: 'dar-es-salaam' },
  pricing: { monthlyRent: 500000, currency: 'TZS' },
  images: ['https://example.invalid/photo.jpg'], media: { images: ['https://example.invalid/photo.jpg'] },
  bedrooms: 2, maxGuests: 4, amenities: ['WiFi'], specifications: { bedrooms: 2, bathrooms: 1 },
};
(async () => {
  const jsonLdComponent = load('src/components/seo/PropertyJsonLd.tsx', {
    'react/jsx-runtime': { jsx: (tag, props) => ({ tag, props }) },
  });
  const markup = jsonLdComponent.PropertyJsonLd({ property: {
    ...property, title: '</script><script>bad()</script>', ratingSummary: { averageRating: 4.8, totalReviews: 5 },
  } }).props.dangerouslySetInnerHTML.__html;
  assert(!markup.includes('</script>'));
  const structured = JSON.parse(markup);
  assert.equal(structured.name, '</script><script>bad()</script>');
  if (short) {
    assert.equal(structured.starRating, undefined);
    assert.equal(structured.aggregateRating.ratingValue, 4.8);
    assert.equal(structured.offers.availability, undefined);
  }
  const active = metadata.buildPropertyMetadata(property);
  assert.equal(active.alternates.canonical, `https://www.${short ? 'ndotonistays' : 'ndotoni'}.com/property/real`);
  assert(active.title.includes('A real property'));
  assert(!active.title.includes('dar-es-salaam'));
  assert(active.description.includes(short ? '120,000' : '500,000'));
  assert(active.description.length <= 160);
  assert.equal(active.robots.index, true);
  assert.equal(metadata.buildPropertyMetadata({ ...property, status: 'INACTIVE' }).robots.index, false);
  assert(!metadata.buildPropertyMetadata({ ...property, nightlyRate: NaN, pricing: null }).description.includes('NaN'));

  api = () => response({ data: { [operation]: property } });
  assert.equal((await fetchProperty('real')).propertyId, 'real');
  assert(!calls.at(-1).query.includes('wifiPassword'));
  assert(!calls.at(-1).query.includes('accessCode'));
  api = () => response({ data: { [operation]: null } });
  assert.equal(await fetchProperty('missing'), null);
  api = () => response({ data: { [operation]: { ...property, status: 'DRAFT' } } });
  assert.equal(await fetchProperty('draft'), null);
  api = () => response({ errors: [{ message: 'The requested property could not be found.', errorType: 'Lambda:Unhandled', path: [operation] }], data: { [operation]: null } });
  assert.equal(await fetchProperty('missing'), null);
  api = () => response({ errors: [{ message: 'The requested property could not be found.', errorType: 'Lambda:Unhandled', path: [operation, 'landlord'] }], data: { [operation]: null } });
  await assert.rejects(fetchProperty('nested-error'));
  api = () => response({ errors: [{ message: 'Unavailable' }], data: { [operation]: null } });
  await assert.rejects(fetchProperty('upstream-failure'));
  api = () => ({ ok: false, status: 503 });
  await assert.rejects(fetchProperty('upstream-failure'));
  api = () => response({});
  await assert.rejects(fetchProperty('malformed'));

  calls.length = 0;
  const field = short ? 'searchShortTermProperties' : 'getPropertiesByLocation';
  api = ({ query, variables }) => {
    if (query.includes('SitemapRegions')) return response({ data: { getRegions: [{ name: 'Dodoma' }, { name: 'Pwani' }] } });
    const input = short ? variables.input : variables;
    assert.equal(input.checkInDate, undefined);
    assert.equal(input.checkOutDate, undefined);
    assert.equal(input.numberOfGuests, undefined);
    const properties = input.nextToken ? [{ ...property, propertyId: 'last-page' }] : [property, { ...property, propertyId: 'test', title: 'HydraTest-fixture' }];
    if (short) properties.push({ ...property, propertyId: 'draft', status: 'DRAFT' });
    return response({ data: { [field]: { properties, nextToken: input.nextToken ? null : 'second-page' } } });
  };
  assert.deepEqual(Array.from(await catalog.getSitemapListings(), p => p.propertyId), ['last-page', 'real']);
  assert.equal(calls.filter(c => !c.query.includes('SitemapRegions')).length, 6);
  assert(calls.some(c => c.variables && (c.variables.input || c.variables).region === 'Zanzibar'));

  api = ({ query }) => query.includes('SitemapRegions')
    ? response({ data: { getRegions: [{ name: 'Dodoma' }] } })
    : response({ data: { [field]: { properties: [], nextToken: 'loop' } } });
  await assert.rejects(catalog.getSitemapListings(), /repeated a cursor/);
  api = () => response({ errors: [{ message: 'Unavailable' }] });
  await assert.rejects(catalog.getSitemapListings());
  console.log(`PASS ${short ? 'Stays' : 'Ndotoni'}: metadata, publication status, missing-vs-failed fetches, safe projection, pagination, deduplication and failure handling.`);
})().catch(error => { console.error(error); process.exitCode = 1; });
