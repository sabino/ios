import evidence from '../data/evidence.json';
import sources from '../data/sources.json';
import publication from '../data/publication.json';
const modules = import.meta.glob('../../content/articles/*.md', { eager: true }) as Record<string, any>;
export const articles = Object.values(modules).map(m => ({ ...m.frontmatter, Content: m.Content, compiled: m.compiledContent as () => Promise<string>, headings: m.getHeadings(), raw: m.rawContent(), words: m.rawContent().split(/\s+/).length })).sort((a,b) => a.order-b.order);
export const sections = ['Foundations','Machine','Storage','Graphics','Interaction','Method'];
export const sectionDescriptions: Record<string,string> = {
 Foundations: 'Identify the software. Separate the machines. Read the source critically.',
 Machine: 'Follow the handoff through CPU state, memory, time and interrupts.',
 Storage: 'Trace a request from class discovery to a checked, persistent volume.',
 Graphics: 'Follow a pixel from its owner to the physical panel.',
 Interaction: 'Connect service readiness to input, media and visible response.',
 Method: 'Understand the model, test the observer and preserve uncertainty.',
};
export const tours = [
 {id:'boot',title:'From handoff to userspace',description:'The contracts that turn a kernel image into a running system.',slugs:['orientation','three-machines','boot-handoff','device-tree','cpu-compatibility','mmu-and-caches','time-and-interrupts','iokit-discovery','storage-abi','async-storage','hfs-integrity','native-iphone']},
 {id:'pixels',title:'Follow a pixel',description:'From shared surfaces and visible response to Camera preview and saved photographs.',slugs:['graphics-stack','surface-memory','presentation','display-blanking','hid-dependencies','buttons','touch','camera-capture','camera-preview','frame-retirement','camera-stills','audio']},
 {id:'method',title:'How the evidence changed',description:'A short course in experimental humility, told through real findings.',slugs:['emulator-fidelity','observability','power','source-archaeology','measuring-performance','preservation-method']},
];
export const url = (path='') => '/ios/' + path.replace(/^\/+/, '');
export {evidence, sources, publication};
export const articleBySlug = (slug:string) => articles.find(a=>a.slug===slug);
export const evidenceById = (id:string) => evidence.find(e=>e.id===id);
export const readingMinutes = (a:any) => Math.max(2,Math.ceil(a.words/220));
// Compact labels for dense diagrams, indexed by chapter order.
export const shortNames=['Scope','Three machines','Boot handoff','Device tree','CPU compatibility','Memory & caches','Time & interrupts','Service discovery','Storage ABI','Async completion','HFS integrity','Graphics stack','Surface memory','Presentation','Display blanking','HID readiness','Buttons','Touch','Audio','Power','Emulator fidelity','Observability','Source archaeology','Preservation','iPhone profile','Sensor capture','Live preview','Image retirement','Saved photographs','Performance'];
export const shortName = (a:any) => shortNames[a.order-1];
// Evidence environments, in the fixed order used by every legend and palette slot.
export const environments = ['iPod reference','PinePhone QEMU','Physical PinePhone','Synthetic probe','Static inspection'];
export const envKey = (environment:string) => environment.toLowerCase().replace(/[^a-z0-9]+/g,'-');
export const environmentNotes: Record<string,string> = {
 'iPod reference': 'The original iPod touch model in the reference emulator.',
 'PinePhone QEMU': 'The partial PinePhone board contract in QEMU.',
 'Physical PinePhone': 'Measured on the physical phone.',
 'Synthetic probe': 'A purpose-built fixture that isolates one contract.',
 'Static inspection': 'Read from files and binaries without executing them.',
};
/** Chapters linked to a chapter in either direction, in reading order. */
export const neighbors = (slug:string) => { const a=articleBySlug(slug)!; const set=new Set([...a.related,...articles.filter(b=>b.related.includes(slug)).map(b=>b.slug)]); set.delete(slug); return articles.filter(b=>set.has(b.slug)); };
export const citing = (id:string) => articles.filter(a=>a.evidence.includes(id));
