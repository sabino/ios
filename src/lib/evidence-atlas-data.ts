import layout from '../data/evidence-layout.json';
import timeline from '../data/timeline.json';
import {articles, evidence, sections, url} from './content';

// One editorial home per tile. Chapter citations may connect the same record
// to several domains; the lane is a reading aid, not a runtime dependency.
export const atlasRecords = evidence.map(record => {
  const arrangement = layout[record.id as keyof typeof layout];
  if (!arrangement || !sections.includes(arrangement.domain)) throw Error('Missing evidence arrangement: ' + record.id);
  const chapters = articles.filter(a => a.evidence.includes(record.id));
  const shared = new Map<string, string[]>();
  for (const chapter of chapters) for (const id of chapter.evidence) {
    if (id === record.id) continue;
    const citations = shared.get(id) || [];
    citations.push(chapter.slug);
    shared.set(id, citations);
  }
  return {
    ...record, ...arrangement,
    href: url('evidence/' + record.id + '/'),
    milestones: timeline.filter(event=>event.evidence===record.id).map(event=>({...event,href:url('timeline/#day-'+event.date+(timeline.findIndex(other=>other.date===event.date)===timeline.indexOf(event)?'':'-'+event.evidence))})),
    chapters: chapters.map(a => ({slug:a.slug, title:a.title, section:a.section, href:url('articles/' + a.slug + '/')})),
    related: [...shared].map(([id, via]) => ({id, via})).sort((a,b) => b.via.length - a.via.length || a.id.localeCompare(b.id)),
    search: [record.id, record.title, record.observation, record.limits, record.method, record.environment, arrangement.domain, arrangement.label, ...chapters.map(a=>a.title)].join(' ').toLowerCase(),
  };
});

export const reviewGroups = [...new Set(atlasRecords.map(e => e.reviewedOn + '/' + e.sourceRevision))].sort().map(key => {
  const records = atlasRecords.filter(e => e.reviewedOn + '/' + e.sourceRevision === key);
  return {key, date:records[0].reviewedOn, revision:records[0].sourceRevision, records};
});
export const reviewLabel = (date:string) => new Intl.DateTimeFormat('en-GB', {day:'2-digit', month:'short', year:'numeric', timeZone:'UTC'}).format(new Date(date + 'T00:00:00Z'));
export const historyGroups = [...new Set(timeline.map(event=>event.date))].sort().map(date=>({date,events:timeline.filter(event=>event.date===date)}));
