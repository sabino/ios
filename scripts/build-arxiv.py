#!/usr/bin/env python3
"""Build an offline, source-complete preprint from the reviewed website edition.

Run npm run build first. Requires PDFLaTeX (TeX Live 2025) and the pinned
Python packages in arxiv-requirements.txt. No implementation assets are read.
"""
from pathlib import Path
from bs4 import BeautifulSoup, NavigableString, Tag
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import reportlab
from pypdf import PdfReader
import hashlib
import json
import re
import shutil
import subprocess
import zipfile

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / 'arxiv'
FIG = SRC / 'figures'
ANC = SRC / 'anc'
OUT = ROOT / 'output/pdf'
DOWNLOADS = ROOT / 'public/downloads'
TEMP = ROOT / 'tmp/pdfs/arxiv-compile'
STEM = 'early-iphone-os-native-pinephone-preprint'
pub = json.loads((ROOT / 'src/data/publication.json').read_text())
evidence = json.loads((ROOT / 'src/data/evidence.json').read_text())
evaluation = json.loads((ROOT / 'public/paper-evaluation.json').read_text())
html = BeautifulSoup((ROOT / 'dist/paper/index.html').read_text(), 'html.parser')
article = html.select_one('article.publication-prose')
assert article, 'Build the reviewed website before preparing the preprint.'
for d in (SRC, FIG, ANC, OUT, DOWNLOADS, TEMP):
    d.mkdir(parents=True, exist_ok=True)

font_dir = Path(reportlab.__file__).parent / 'fonts'
pdfmetrics.registerFont(TTFont('PrintSans', str(font_dir / 'Vera.ttf')))
pdfmetrics.registerFont(TTFont('PrintSansBold', str(font_dir / 'VeraBd.ttf')))
W = 451.0  # Printed at 444.1 pt; 10.25 pt labels remain over 10 pt after scaling.
INK, BLUE, PALE, BORDER = '#173653', '#3568b5', '#e7eff9', '#bccbd7'


def words(s, width, font='PrintSans', size=10.25):
    """Wrap by actual embedded-font advances, not character count."""
    lines, line = [], ''
    for word in s.split():
        candidate = (line + ' ' + word).strip()
        if line and pdfmetrics.stringWidth(candidate, font, size) > width:
            lines.append(line)
            line = word
        else:
            line = candidate
    if line:
        lines.append(line)
    return lines


def drawing(name, height):
    c = canvas.Canvas(str(FIG / (name + '.pdf')), pagesize=(W, height),
                      pageCompression=1, invariant=1,
                      initialFontName='PrintSans', initialFontSize=10)
    c.setTitle(name.replace('-', ' ').title())
    c.setAuthor(pub['author'])
    return c


def text(c, x, y, s, size=10.25, bold=False, color=INK, width=None):
    c.setFillColor(color)
    c.setFont('PrintSansBold' if bold else 'PrintSans', size)
    for i, line in enumerate(words(s, width, size=size,
                                 font='PrintSansBold' if bold else 'PrintSans') if width else [s]):
        c.drawString(x, y - i * (size + 3), line)


def box(c, x, y, w, h, title, detail, accent=False):
    c.setStrokeColor(BORDER)
    c.setFillColor(PALE if accent else '#ffffff')
    c.roundRect(x, y, w, h, 3, fill=1, stroke=1)
    text(c, x + 10, y + h - 18, title, bold=True, width=w - 20)
    title_lines = len(words(title, w - 20, 'PrintSansBold'))
    text(c, x + 10, y + h - 18 - title_lines * 13 - 4, detail, width=w - 20)


def arrow(c, x1, y1, x2, y2, dashed=False):
    import math
    c.setStrokeColor(BLUE)
    c.setLineWidth(.8)
    c.setDash(3, 3) if dashed else c.setDash()
    c.line(x1, y1, x2, y2)
    c.setDash()
    a = math.atan2(y2-y1, x2-x1)
    for d in (-.5, .5):
        c.line(x2, y2, x2-6*math.cos(a+d), y2-6*math.sin(a+d))


# Original explanatory diagrams are redrawn for print; research captures are
# copied byte for byte below. The diagrams are never represented as evidence.
c = drawing('substrates', 343)
columns = [('Original iPod model', ['4A102 reference', 'XNU 933 reference', 'ARMv6 model', 'S5L8900 model']),
           ('PinePhone QEMU', ['4A102 / 7E18 gates', '933 / 1357 bindings', 'A53 contract', 'Selected A64 I/O']),
           ('Physical PinePhone', ['4A102 / 7E18 trials', '933 / 1357 native', 'A53 execution', 'Physical A64'])]
for i, (title, cells) in enumerate(columns):
    x = i * 153
    text(c, x+4, 325, title, bold=True)
    for j, s in enumerate(cells):
        y = 263 - j*65
        box(c, x, y, 145, 44, s, '', accent=i==2)
for j, label in enumerate(['Userspace', 'Kernel', 'CPU / memory', 'Board / I/O']):
    text(c, 5, 312-j*65, label, color=BLUE)
text(c, 5, 13, 'A result in one substrate does not establish a result in another.', width=W-10)
c.save()

c = drawing('native-architecture', 426)
stages = [('Stock consumers', 'SpringBoard, Camera, Photos; original frameworks'),
          ('Original IOKit providers', 'MMC / AES, display, touch / power, H1ISP / JPEG'),
          ('Adapted original XNU', 'AArch32; exact-build guards and bindings'),
          ('Resident EL2 compatibility / reset', 'Selective legacy handling; drained reset route'),
          ('A64 hardware / Cortex-A53', 'Physical execution, MMIO, DMA, panel and sensor')]
for i, (a, b) in enumerate(stages):
    y = 352-i*70
    box(c, 0, y, 280, 62, a, b, accent=i in (1,4))
    if i < 4:
        arrow(c, 140, y-1, 140, y-8)
box(c, 295, 296, 156, 118, 'Boot-time preparation', 'Tow-Boot / TF-A, then pre-XNU NuttX panel initialization and selector')
arrow(c, 296, 308, 282, 241, True)
box(c, 295, 129, 156, 116, 'Recovery after reset', 'RTC route to separate Jumpdrive Linux; fresh media checks')
arrow(c, 282, 173, 295, 173, True)
text(c, 0, 35, 'Boot-time initialization, resident runtime and recovery have different lifetimes.', width=W)
text(c, 0, 7, 'Ordinary instructions execute as AArch32 on A53.', width=W)
c.save()

c = drawing('trial-loop', 247)
trials = [('1. Freeze / preflight', 'Exact inputs; protected read-only baselines'),
          ('2. Boot / capture', 'Exclusive UART; bounded diagnostics'),
          ('3. Recover', 'Declared watchdog / RTC route to Jumpdrive'),
          ('4. Fresh readback', 'Immutable hashes; filesystem and media checks'),
          ('5. Owner acceptance', 'Visible hand use; independent result'),
          ('6. Record boundary', 'Accepted scope and retained failures')]
for i, (a, b) in enumerate(trials):
    x, y = (i%3)*153, 143-(i//3)*103
    box(c, x, y, 145, 94, a, b, accent=i in (1,3))
text(c, 0, 15, 'A failure returns to diagnosis and a newly frozen trial.', width=W)
c.save()

c = drawing('camera-rates', 276)
text(c, 0, 259, '4A102: one physical queue pair', bold=True)
text(c, 248, 259, 'Two slots', color=BLUE)
text(c, 346, 259, 'Six slots', color='#53749f')
left, scale = 154, 254/35
for i, metric in enumerate(evaluation['camera']):
    y = 216-i*67
    text(c, 0, y-2, metric['label'], width=142)
    for j, v in enumerate(metric['values']):
        c.setFillColor(BLUE if j==0 else '#8ab2e4')
        c.rect(left, y-j*25-12, v['value']*scale, 17, fill=1, stroke=0)
        text(c, left+v['value']*scale+4, y-j*25-8, f"{v['value']:.3f}")
for v in range(0, 36, 5):
    text(c, left+v*scale-3, 28, str(v))
text(c, 0, 6, 'Events/s. Unequal intervals; these counters do not establish 7E18 FPS.', width=W)
c.save()

c = drawing('display-timing', 277)
text(c, 0, 259, '7E18: 64 later idle presentations', bold=True)
labels = ['Source work', '2x expansion', 'Total work', 'Presentation gap']
chosen = [evaluation['display'][i] for i in (0,1,2,3)]
for i, (label, d) in enumerate(zip(labels, chosen)):
    y = 225-i*37
    text(c, 0, y-4, label)
    c.setFillColor(BLUE if d['label']=='total' else '#8ab2e4')
    c.rect(140, y-12, d['value']/15*250, 20, fill=1, stroke=0)
    text(c, 145+d['value']/15*250, y-5, f"{d['value']:.4f}")
for v in range(0, 16, 5):
    text(c, 140+v/15*250, 83, str(v)+' ms')
d = evaluation['display'][4]
text(c, 0, 61, 'Diagnostic log: one sample', bold=True)
c.setFillColor('#d8dde4')
c.rect(140, 29, d['value']/80*250, 19, fill=1, stroke=0)
text(c, 145+d['value']/80*250, 34, f"{d['value']:.4f}")
text(c, 140, 13, '0 ms')
text(c, 362, 13, '80 ms')
c.save()

listener = next(e for e in evidence if e['id']=='E54')
timing = next(json.loads(x['content'])['/interpretation/timing_limit'] for x in listener['excerpts']
              if x['format']=='json' and '/interpretation/timing_limit' in json.loads(x['content']))
seconds = re.search(r'([\d.]+)s after daemon startup', timing).group(1)
c = drawing('usb-ladder', 249)
gates = [('1. EP0 / enumeration', 'Later finite physical trials pass; earlier failures remain'),
         ('2. Stock mux v2', 'Handshake passes through the native bulk transport'),
         ('3. Local listener', f'First positive sample: {seconds} s; not exact bind time'),
         ('4. Pairing and services', 'Ordinary pairing, information, syslog and AFC remain pending')]
for i, (a, b) in enumerate(gates):
    box(c, (i%2)*232, 136-(i//2)*114, 219, 102, a, b, accent=i<2)
text(c, 0, 3, 'A scoped pass does not repair the false original whole-capture gate.', width=W)
c.save()

captures = ['E43-313-lock-qemu.png', 'E43-313-home-qemu.png', 'E44-313-camera-stock.png']
for name in captures:
    original = ROOT / 'public/evidence/images' / name
    shutil.copyfile(original, FIG / name)
    assert hashlib.sha256(original.read_bytes()).digest() == hashlib.sha256((FIG/name).read_bytes()).digest()
for name, original in [('evidence.json', ROOT/'src/data/evidence.json'),
                       ('claims.json', ROOT/'src/data/claims.json'),
                       ('paper-evaluation.json', ROOT/'public/paper-evaluation.json')]:
    shutil.copyfile(original, ANC/name)

SPECIAL = {'\\': r'\textbackslash{}', '&': r'\&', '%': r'\%', '$': r'\$', '#': r'\#',
           '_': r'\_', '{': r'\{', '}': r'\}', '~': r'\textasciitilde{}', '^': r'\textasciicircum{}',
           '×': r'\(\times\)', '→': r'\(\rightarrow\)', '≠': r'\(\ne\)', '≤': r'\(\le\)',
           '≥': r'\(\ge\)', 'µ': r'\(\mu\)', 'μ': r'\(\mu\)', '°': r'\(^{\circ}\)',
           '–': '-', '—': '---', '‑': '-', '−': '-', '\u00a0': ' ',
           '“': '``', '”': "''", '’': "'", '‘': '`'}


def esc(s):
    return ''.join(SPECIAL.get(x,x) for x in s)


def inline(el, bib=False):
    if isinstance(el, NavigableString):
        return esc(str(el))
    if el.name in ('span', 'p', 'div', 'li', 'td', 'th', 'figcaption'):
        return ''.join(inline(x,bib) for x in el.children)
    if el.name in ('strong','b'):
        return r'\textbf{' + ''.join(inline(x,bib) for x in el.children) + '}'
    if el.name in ('em','i'):
        return r'\emph{' + ''.join(inline(x,bib) for x in el.children) + '}'
    if el.name=='code':
        return r'\texttt{' + esc(el.get_text()) + '}'
    if el.name=='br':
        return r'\newline{}'
    if el.name=='a':
        href, label = el.get('href',''), el.get_text()
        if href.startswith('/ios/evidence/'):
            eid=href.split('/')[-2]
            return r'\hyperlink{e-'+eid+r'}{\textsf{'+esc(label)+'}}'
        if href.startswith('#ref-'):
            return r'\cite{'+href[1:]+'}'
        if href.startswith('/ios/'):
            return esc(label)
        if bib:
            return r'\emph{'+esc(label)+r'}. \url{'+href+'}'
        return r'\href{'+href+'}{'+esc(label)+'}'
    return ''.join(inline(x,bib) for x in el.children)


figure_names = {2:'native-architecture',4:'trial-loop',5:'camera-rates',6:'display-timing',7:'usb-ladder'}
figure_files = [FIG/(name+'.pdf') for name in ['substrates',*figure_names.values()]] + [FIG/name for name in captures]


def figure(el):
    number = int(el['id'].split('-')[-1])
    cap = inline(el.find('figcaption'))
    cap = re.sub(r'^\\textbf\{Figure \d+\. ', r'\\textbf{', cap)
    if number==3:
        art = '\n'.join(r'\includegraphics[width=.31\linewidth]{figures/'+n+'}' for n in captures)
    else:
        art = r'\includegraphics[width=\linewidth]{figures/'+figure_names[number]+'.pdf}'
    return '\n'.join([r'\begin{figure}[htbp]', r'\centering', art,
                      r'\caption[]{'+cap+'}', r'\label{fig:'+str(number)+'}', r'\end{figure}'])


def table(el, caption):
    rows=el.find_all('tr')
    columns=len(rows[0].find_all(['th','td'],recursive=False))
    rows_tex=[]
    for i,row in enumerate(rows):
        cells=[inline(cell) for cell in row.find_all(['th','td'],recursive=False)]
        if i==0:
            cells=[r'\textbf{'+x+'}' for x in cells]
        rows_tex.append(' & '.join(cells)+r' \\')
        if i==0:
            rows_tex.append(r'\midrule')
    caption = re.sub(r'^Table \d+\.\s*','',caption)
    return '\n'.join([r'\begin{table}[htbp]',r'\centering',r'\caption[]{'+caption+'}',
                       r'\small\setlength{\tabcolsep}{4pt}\renewcommand{\arraystretch}{1.18}',
                       r'\begin{tabularx}{\linewidth}{@{}'+(r'>{\raggedright\arraybackslash}X'*columns)+r'@{}}',
                       r'\toprule',*rows_tex,r'\bottomrule',r'\end{tabularx}',r'\end{table}'])


front = json.loads((ROOT/'content/paper.md').read_text().split('---')[1])
title=front['title']+': '+front['subtitle']
abstract = article.find('h2',id='abstract').find_next_sibling('p')
meta_abstract = abstract.get_text(' ',strip=True)
meta_abstract = re.sub(r'\s*E\d{2}\b','',meta_abstract).strip()
meta_abstract = meta_abstract.replace('×','x').replace('’',"'").replace('–','-')
assert len(meta_abstract)<1920, len(meta_abstract)

preamble = r'''\documentclass[11pt,a4paper]{article}
\usepackage[T1]{fontenc}
\usepackage[utf8]{inputenc}
\usepackage{lmodern}
\usepackage[margin=1.05in,includefoot]{geometry}
\usepackage{microtype}
\usepackage{graphicx}
\usepackage{booktabs,tabularx,array}
\usepackage{caption}
\usepackage{enumitem}
\usepackage[section]{placeins}
\usepackage{multicol}
\usepackage{xurl}
\usepackage[unicode]{hyperref}
\input{glyphtounicode}
\pdfgentounicode=1
\hypersetup{hidelinks,pdfauthor={Felipe Sabino},pdftitle={TITLE},pdfsubject={Preprint prepared for arXiv submission; not yet submitted}}
\captionsetup{font=small,labelfont=bf,justification=raggedright,singlelinecheck=false}
\setlength{\emergencystretch}{2em}
\setlength{\parskip}{3pt}
\widowpenalty=10000
\clubpenalty=10000
\setlist{nosep,leftmargin=*}
\renewcommand{\topfraction}{0.9}
\renewcommand{\bottomfraction}{0.85}
\renewcommand{\textfraction}{0.08}
\renewcommand{\floatpagefraction}{0.7}
\title{TITLE}
\author{Felipe Sabino}
\date{7 October 2026}
\begin{document}
\maketitle
\begin{center}\small Preprint. Prepared for arXiv submission. Not yet submitted or peer reviewed.\end{center}
\begin{abstract}
ABSTRACT
\end{abstract}
\noindent\small\textbf{Publication boundary.} Edition 2.0; reviewed source snapshot
\texttt{15b3a95} (full revision in the ancillary data). AI-assisted investigation,
engineering and publication preparation; the author is responsible for the reviewed record.
The implementation, firmware and private experiment artifacts are not distributed.
Curated ancillary records support inspection, not independent public reproduction.
\normalsize
'''.replace('TITLE',esc(title)).replace('ABSTRACT',inline(abstract))

body=[]
children=[x for x in article.children if isinstance(x,Tag)]
skip_next=False
in_abstract=True
in_bib=False
for i,el in enumerate(children):
    if skip_next:
        skip_next=False
        continue
    if el.name=='h2':
        if el.get('id')=='abstract':
            continue
        in_abstract=False
        title_text=re.sub(r'^\d+\.\s*','',el.get_text())
        in_bib=title_text=='References'
        if not in_bib:
            body.append(r'\section{'+esc(title_text)+'}')
        if title_text=='Background':
            body.insert(len(body)-1, r'''\begin{figure}[htbp]
\centering\includegraphics[width=\linewidth]{figures/substrates.pdf}
\caption{Distinct execution substrates. Original print schematic separating the
4A102 iPod reference, partial PinePhone QEMU contract and physical 4A102/7E18
results. This is explanatory organization, not a measured call graph.}
\label{fig:1}\end{figure}''')
        continue
    if in_abstract:
        continue
    if el.name=='h3':
        if el.get_text().startswith(('6.2 ', '7.3 ', '7.4 ', '7.5 ', '7.6 ')):
            body.append(r'\FloatBarrier')
        body.append(r'\subsection{'+esc(re.sub(r'^\d+\.\d+\s*','',el.get_text()))+'}')
    elif el.name=='p':
        body.append(inline(el))
    elif el.name=='figure':
        body.append(figure(el))
    elif el.name=='table':
        next_el=children[i+1]
        caption=''.join(inline(x) for x in next_el.em.children) if next_el.name=='p' and next_el.em else 'Reviewed experimental result.'
        assert caption.startswith('Table '), 'Every reviewed table must retain its caption.'
        body.append(table(el,caption))
        skip_next=True
    elif el.name in ('ul','ol'):
        if in_bib:
            body.append(r'\begingroup\small\begin{thebibliography}{99}\setlength{\itemsep}{4pt}')
            for j,li in enumerate(el.find_all('li',recursive=False),1):
                body.append(r'\bibitem{ref-'+str(j)+'} '+inline(li,bib=True))
            body.append(r'\end{thebibliography}\endgroup')
        else:
            env='enumerate' if el.name=='ol' else 'itemize'
            body.append(r'\begin{'+env+'}')
            body.extend(r'\item '+inline(li) for li in el.find_all('li',recursive=False))
            body.append(r'\end{'+env+'}')
    else:
        raise ValueError('Unsupported article element: '+el.name)

cited=sorted(set(a['href'].split('/')[-2] for a in article.select('a[href^="/ios/evidence/"]')))
catalog=[r'\clearpage',r'\appendix',r'\section{Curated experiment citation index}',
         'E identifiers denote the author\'s curated reports of private experiments, rather than independent publications. '
         r'All 63 reviewed records are supplied in ancillary \texttt{evidence.json}, with source basenames, SHA-256, '
         'excerpt locators, selected measurements, capture provenance and limits. '
         r'\texttt{claims.json} maps claims to those records. This index lists the '+str(len(cited))+' cited identities.',
         r'\begin{multicols}{2}\small\setlength{\parskip}{1pt}']
for e in evidence:
    if e['id'] in cited:
        catalog.append(r'\noindent\hypertarget{e-'+e['id']+r'}{\textbf{'+e['id']+'}} '+esc(e['title'])+
                       '. '+esc(e['environment'])+'.')
catalog.extend([r'\end{multicols}',r'\end{document}'])
source=preamble+'\n\n'.join(body+catalog)+'\n'
(SRC/'main.tex').write_text(source)
(ANC/'provenance.txt').write_text('''Curated ancillary records for the preprint, edition 2.0, 7 October 2026.

These files are reports of private experiments, not independent public reproductions.
evidence.json: 63 reviewed records, source identities, selected excerpts and limits.
claims.json: 64 claim mappings, evidence classes and remaining gates.
paper-evaluation.json: exact selected values used for the camera and display plots.

Publication source snapshot: '''+pub['sourceRevision']+'''
The article lists the 44 records it cites. The full reviewed catalog is retained here.
Captures E43-313-lock-qemu.png, E43-313-home-qemu.png and E44-313-camera-stock.png
are selected, complete, byte-identical files; no retouching or crop is performed.
Their source basenames, SHA-256 and pixel bounds are in evidence.json.
Original plot/diagram PDFs are explanatory drawings, not capture evidence.

Original text, diagrams, data organization and website code are MIT licensed.
Depicted third-party interfaces retain their original rights. The repository MIT
license does not transfer those rights. Firmware, source implementation, device
images, raw capture files, credentials and private identifiers are not included.
''')

pdflatex=shutil.which('pdflatex')
if not pdflatex:
    raise SystemExit('PDFLaTeX is required. Add a TeX Live 2025 binary directory to PATH.')
for f in [SRC/'main.tex', *figure_files]:
    target=TEMP/f.relative_to(SRC)
    target.parent.mkdir(parents=True,exist_ok=True)
    shutil.copyfile(f,target)
for _ in range(3):
    result=subprocess.run([pdflatex,'-no-shell-escape','-interaction=nonstopmode','-halt-on-error','main.tex'],
                          cwd=TEMP,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,text=True)
    (TEMP/'compile-stdout.txt').write_text(result.stdout)
    if result.returncode:
        raise SystemExit(result.stdout[-7000:])
log=(TEMP/'main.log').read_text()
warnings=[line for line in log.splitlines() if 'Overfull' in line or 'undefined' in line or 'Warning:' in line]
if any('Overfull' in line or 'undefined' in line for line in warnings):
    raise SystemExit('Fix layout or citation errors before packaging: '+ '\n'.join(warnings))
if warnings:
    print('TeX diagnostics:', '\n'.join(warnings))
pdf=TEMP/'main.pdf'
pages=len(PdfReader(pdf).pages)
metadata={'status':'Preprint; prepared for arXiv submission; not yet submitted or peer reviewed',
          'title':title,'authors':pub['author'],'abstract':meta_abstract,
          'suggestedPrimaryCategory':'cs.OS (Operating Systems); author decision required',
          'comments':f'{pages} pages, 7 figures, 10 tables; curated ancillary evidence and measurement data',
          'journalReference':'','doi':'','reportNumber':'','license':'Choose in the arXiv form; not selected by this preparation',
          'texEngine':'PDFLaTeX','texLive':'2025','mainFile':'main.tex','sourceRevision':pub['sourceRevision']}
for destination in (OUT,DOWNLOADS):
    shutil.copyfile(pdf,destination/(STEM+'.pdf'))
    (destination/(STEM+'-metadata.json')).write_text(json.dumps(metadata,indent=2,ensure_ascii=True)+'\n')
    with zipfile.ZipFile(destination/(STEM+'-source.zip'),'w',zipfile.ZIP_DEFLATED) as z:
        anc_files = [ANC/name for name in ['evidence.json','claims.json','paper-evaluation.json','provenance.txt']]
        for f in sorted([SRC/'main.tex',*figure_files,*anc_files]):
            entry=zipfile.ZipInfo(str(f.relative_to(SRC)),date_time=(2026,10,7,0,0,0))
            entry.compress_type=zipfile.ZIP_DEFLATED
            entry.external_attr=0o644<<16
            z.writestr(entry,f.read_bytes())
    hashes={f.name:hashlib.sha256(f.read_bytes()).hexdigest() for f in destination.glob(STEM+'*')
            if not f.name.endswith('sha256.json')}
    (destination/(STEM+'-sha256.json')).write_text(json.dumps(hashes,indent=2)+'\n')
print(f'Prepared {pages}-page preprint, source ZIP and ASCII metadata; {len(cited)} cited E records.')
print(f'PDF: {pdf.stat().st_size:,} bytes; source ZIP: {(DOWNLOADS/(STEM+"-source.zip")).stat().st_size:,} bytes.')
