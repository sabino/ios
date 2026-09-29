import evidence from '../data/evidence.json';
import sources from '../data/sources.json';
import publication from '../data/publication.json';
const modules = import.meta.glob('../../content/articles/*.md', { eager: true }) as Record<string, any>;
export const articles = Object.values(modules).map(m => ({ ...m.frontmatter, Content: m.Content, headings: m.getHeadings(), raw: m.rawContent(), words: m.rawContent().split(/\s+/).length })).sort((a,b) => a.order-b.order);
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
 {id:'boot',title:'From handoff to userspace',description:'The contracts that turn a kernel image into a running system.',slugs:['orientation','three-machines','boot-handoff','device-tree','cpu-compatibility','mmu-and-caches','time-and-interrupts','iokit-discovery','storage-abi','async-storage','hfs-integrity']},
 {id:'pixels',title:'Follow a pixel',description:'Memory, presentation, dimming—and the button that brings it back.',slugs:['graphics-stack','surface-memory','presentation','display-blanking','hid-dependencies','buttons','touch','audio']},
 {id:'method',title:'How the evidence changed',description:'A short course in experimental humility, told through real findings.',slugs:['emulator-fidelity','observability','power','source-archaeology','preservation-method']},
];
export const url = (path='') => '/ios/' + path.replace(/^\/+/, '');
export {evidence, sources, publication};
export const articleBySlug = (slug:string) => articles.find(a=>a.slug===slug);
