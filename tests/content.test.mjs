import test from 'node:test';import assert from 'node:assert/strict';
import {readArticles,data,validate} from '../scripts/content.mjs';
import {searchArticles} from '../src/lib/search.mjs';
const articles=readArticles(),evidence=data('evidence'),sources=data('sources');
test('published research references resolve and provenance is complete',()=>assert.deepEqual(validate(articles,evidence,sources),[]));
test('editorial gate catches unknown evidence, damaged provenance and private paths',()=>{const a=structuredClone(articles),e=structuredClone(evidence);a[0].evidence.push('E999');a[0].body+=' /home/researcher/private';e[0].records[0].sha256='bad';const errors=validate(a,e,sources);assert.ok(errors.some(s=>s.includes('E999')));assert.ok(errors.some(s=>s.includes('provenance')));assert.ok(errors.some(s=>s.includes('private path')));});
test('search finds domain language, respects all query words and has an empty state',()=>{assert.equal(searchArticles(articles,'sound')[0].slug,'audio');assert.ok(searchArticles(articles,'completion ABI').some(a=>a.slug==='storage-abi'));assert.equal(searchArticles(articles,'not-a-real-research-term-xyz').length,0);assert.equal(searchArticles(articles,'   ').length,6);});
test('every evidence record is used and every article is reachable by a relationship',()=>{for(const e of evidence)assert.ok(articles.some(a=>a.evidence.includes(e.id)),e.id);for(const a of articles)assert.ok(articles.some(b=>b.related.includes(a.slug)),a.slug);});
test('evidence gate rejects orphaned excerpts and malformed captured tables',()=>{const e=structuredClone(evidence);e[0].exhibits[0].sourceIds=['not-present'];e[1].excerpts[0].sha256='0'.repeat(64);e[2].exhibits[0].rows[0].pop();const errors=validate(articles,e,sources);assert.ok(errors.some(s=>s.includes('unresolved exhibit source')));assert.ok(errors.some(s=>s.includes('untracked excerpt provenance')));assert.ok(errors.some(s=>s.includes('malformed table')));});
test('every reading continuation resolves and timeline claims cite existing records',()=>{const reading=data('reading');for(const a of articles){assert.ok(reading[a.slug]?.why);assert.ok(reading[a.slug]?.open);assert.ok(articles.some(b=>b.slug===reading[a.slug].next));}for(const e of data('timeline')){assert.ok(evidence.some(r=>r.id===e.evidence));assert.ok(articles.some(a=>a.slug===e.chapter));assert.match(e.date,/^\d{4}-\d{2}-\d{2}$/);assert.equal(new Date(e.date).toISOString().slice(0,10),e.date);assert.ok(e.date<=data('publication').date);}});

test('record snapshots remain explicit and working capabilities cite physical acceptance',()=>{
 const caps=data('capabilities'),publication=data('publication');
 assert.equal(caps.sourceRevision,publication.sourceRevision);
 for(const e of evidence){assert.match(e.sourceRevision,/^[a-f0-9]{40}$/);assert.ok(e.reviewedOn<=publication.date);}
 assert.notEqual(evidence.find(e=>e.id==='E17').sourceRevision,publication.sourceRevision);
 for(const f of caps.domains.flatMap(d=>d.features)){
  if(f.evidence)assert.ok(evidence.some(e=>e.id===f.evidence),f.feature);
  if(f.status==='Working')assert.equal(evidence.find(e=>e.id===f.evidence)?.environment,'Physical PinePhone',f.feature);
 }
});
