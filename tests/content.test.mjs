import test from 'node:test';import assert from 'node:assert/strict';
import {readArticles,data,validate} from '../scripts/content.mjs';
import {searchArticles} from '../src/lib/search.mjs';
const articles=readArticles(),evidence=data('evidence'),sources=data('sources');
test('published research references resolve and provenance is complete',()=>assert.deepEqual(validate(articles,evidence,sources),[]));
test('editorial gate catches unknown evidence, damaged provenance and private paths',()=>{const a=structuredClone(articles),e=structuredClone(evidence);a[0].evidence.push('E999');a[0].body+=' /home/researcher/private';e[0].records[0].sha256='bad';const errors=validate(a,e,sources);assert.ok(errors.some(s=>s.includes('E999')));assert.ok(errors.some(s=>s.includes('provenance')));assert.ok(errors.some(s=>s.includes('private path')));});
test('search finds domain language, respects all query words and has an empty state',()=>{assert.equal(searchArticles(articles,'sound')[0].slug,'audio');assert.ok(searchArticles(articles,'completion ABI').some(a=>a.slug==='storage-abi'));assert.equal(searchArticles(articles,'not-a-real-research-term-xyz').length,0);assert.equal(searchArticles(articles,'   ').length,6);});
test('every evidence record is used and every article is reachable by a relationship',()=>{for(const e of evidence)assert.ok(articles.some(a=>a.evidence.includes(e.id)),e.id);for(const a of articles)assert.ok(articles.some(b=>b.related.includes(a.slug)),a.slug);});
