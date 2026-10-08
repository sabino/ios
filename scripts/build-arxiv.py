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
W = 460.8  # Two-column text width: US Letter, 1.05-inch margins.
COL = 221.4  # Draw narrow plots at their actual printed column width.
INK, PALE, BORDER = '#171717', '#f2f2f2', '#777777'


def words(s, width, font='PrintSans', size=10):
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


def drawing(name, height, width=W):
    c = canvas.Canvas(str(FIG / (name + '.pdf')), pagesize=(width, height),
                      pageCompression=1, invariant=1,
                      initialFontName='PrintSans', initialFontSize=10)
    c.setTitle(name.replace('-', ' ').title())
    c.setAuthor(pub['author'])
    return c


def text(c, x, y, s, size=10, bold=False, color=INK, width=None):
    c.setFillColor(color)
    c.setFont('PrintSansBold' if bold else 'PrintSans', size)
    for i, line in enumerate(words(s, width, size=size,
                                 font='PrintSansBold' if bold else 'PrintSans') if width else [s]):
        c.drawString(x, y - i * (size + 2), line)


def box(c, x, y, w, h, title, detail, accent=False):
    c.setStrokeColor(BORDER)
    c.setFillColor(PALE if accent else '#ffffff')
    c.setLineWidth(.6)
    c.rect(x, y, w, h, fill=1, stroke=1)
    text(c, x + 7, y + h - 13, title, bold=True, width=w - 14)
    title_lines = len(words(title, w - 14, 'PrintSansBold'))
    text(c, x + 7, y + h - 13 - title_lines * 12 - 2, detail, width=w - 14)


def arrow(c, x1, y1, x2, y2, dashed=False):
    import math
    c.setStrokeColor(INK)
    c.setLineWidth(.8)
    c.setDash(3, 3) if dashed else c.setDash()
    c.line(x1, y1, x2, y2)
    c.setDash()
    a = math.atan2(y2-y1, x2-x1)
    for d in (-.5, .5):
        c.line(x2, y2, x2-6*math.cos(a+d), y2-6*math.sin(a+d))


# Original explanatory diagrams are redrawn for print; research captures are
# copied byte for byte below. The diagrams are never represented as evidence.
c = drawing('substrates', 138)
columns = [('Original iPod model', ['4A102 reference', 'XNU 933 reference', 'ARMv6 model', 'S5L8900 model']),
           ('PinePhone QEMU', ['4A102 / 7E18 gates', '933 / 1357 bindings', 'A53 contract', 'Selected A64 I/O']),
           ('Physical PinePhone', ['4A102 / 7E18 trials', '933 / 1357 native', 'A53 execution', 'Physical A64'])]
for i, (title, cells) in enumerate(columns):
    x = 100 + i * 120
    text(c, x, 123, title, bold=True)
    for j, s in enumerate(cells):
        text(c, x, 99 - j*20, s)
for j, label in enumerate(['Userspace', 'Kernel', 'CPU / memory', 'Board / I/O']):
    text(c, 0, 99-j*20, label, bold=True)
c.setStrokeColor(BORDER)
c.setLineWidth(.5)
for y in (115,31):
    c.line(0,y,W,y)
text(c, 0, 12, 'Results do not transfer between substrates without a separate gate.')
c.save()

c = drawing('native-architecture', 263)
stages = [('Stock consumers', 'SpringBoard, Camera, Photos; original frameworks'),
          ('Original IOKit providers', 'MMC / AES, display, touch / power, H1ISP / JPEG'),
          ('Adapted original XNU', 'AArch32; exact-build guards and bindings'),
          ('Resident EL2 compatibility / reset', 'Selective legacy handling; drained reset route'),
          ('A64 hardware / Cortex-A53', 'Physical execution, MMIO, DMA, panel and sensor')]
for i, (a, b) in enumerate(stages):
    y = 210-i*50
    box(c, 0, y, 250, 44, a, b, accent=i in (1,4))
    if i < 4:
        arrow(c, 125, y-1, 125, y-6)
box(c, 274, 153, 186.8, 75, 'Boot-time preparation', 'Tow-Boot / TF-A; pre-XNU NuttX panel initializer and profile selector')
c.setStrokeColor(INK);c.setDash(3,3)
c.lines([(274,166,262,166),(262,166,262,132)])
arrow(c,262,132,251,132,True)
box(c, 274, 43, 186.8, 75, 'Recovery after reset', 'RTC route to separate Jumpdrive Linux; fresh media checks')
c.setStrokeColor(INK);c.setDash(3,3)
c.lines([(251,82,262,82),(262,82,262,80)])
arrow(c,262,80,273,80,True)
text(c, 274, 18, 'Dashed: boot / reset transitions', width=186.8)
c.save()

c = drawing('trial-loop', 158)
trials = [('1. Freeze / preflight', 'Exact inputs; protected read-only baselines'),
          ('2. Boot / capture', 'Exclusive UART; bounded diagnostics'),
          ('3. Recover', 'Declared watchdog / RTC route to Jumpdrive'),
          ('4. Fresh readback', 'Immutable hashes; filesystem and media checks'),
          ('5. Owner acceptance', 'Visible hand use; independent result'),
          ('6. Record boundary', 'Accepted scope and retained failures')]
for i, (a, b) in enumerate(trials):
    x, y = (i%3)*157, 90-(i//3)*72
    box(c, x, y, 146.8, 60, a, b, accent=i in (1,3))
    if i%3<2:
        arrow(c,x+148,y+30,x+156,y+30)
c.setStrokeColor(INK);c.setLineWidth(.8)
c.lines([(387.4,89,387.4,84),(387.4,84,73.4,84)])
arrow(c,73.4,84,73.4,79)
text(c, 0, 4, 'Failure: diagnose, then freeze a new trial. Acceptance remains scoped.', width=W)
c.save()

c = drawing('camera-rates', 229, COL)
text(c, 0, 214, '4A102 physical queue trials', bold=True)
c.setFillColor('#444444');c.rect(0,194,9,9,fill=1,stroke=0)
text(c,13,195,'Two slots')
c.setFillColor('#ffffff');c.setStrokeColor(INK);c.rect(109,194,9,9,fill=1,stroke=1)
text(c,122,195,'Six slots')
left, scale = 0, 184/35
for i, metric in enumerate(evaluation['camera']):
    y = 173-i*49
    text(c, 0, y, metric['label'])
    for j, v in enumerate(metric['values']):
        by=y-15-j*13
        c.setFillColor('#444444' if j==0 else '#ffffff');c.setStrokeColor(INK)
        c.setLineWidth(.5);c.rect(left,by,v['value']*scale,10,fill=1,stroke=1)
        text(c,left+v['value']*scale+4,by+1,f"{v['value']:.3f}")
c.setStrokeColor(BORDER);c.line(0,36,184,36)
for v in range(0, 36, 5):
    x=left+v*scale;c.line(x,33,x,36);text(c,x if not v else x-5,21,str(v))
text(c,68,5,'Events / second')
c.save()

c = drawing('display-timing', 244, COL)
text(c, 0, 229, '7E18 idle display: n = 64', bold=True)
labels = ['Source work', '2x expansion', 'Total work', 'Presentation gap']
chosen = [evaluation['display'][i] for i in (0,1,2,3)]
for i, (label, d) in enumerate(zip(labels, chosen)):
    y = 211-i*32
    text(c, 0, y, label)
    c.setFillColor('#444444' if d['label']=='total' else '#ffffff');c.setStrokeColor(INK)
    c.rect(0,y-16,d['value']/15*174,10,fill=1,stroke=1)
    text(c,4+d['value']/15*174,y-15,f"{d['value']:.4f}")
c.setStrokeColor(BORDER);c.line(0,89,174,89)
for v in range(0, 16, 5):
    x=v/15*174;c.line(x,86,x,89);text(c,x if not v else x-5,75,str(v))
text(c,64,60,'Elapsed ms')
d = evaluation['display'][4]
text(c,0,43,'Log elapsed ms; n = 1 (own scale)',bold=True)
c.setFillColor('#ffffff');c.setStrokeColor(INK)
c.rect(0,26,d['value']/80*174,10,fill=1,stroke=1)
text(c,4+d['value']/80*174,27,f"{d['value']:.4f}")
c.setStrokeColor(BORDER);c.line(0,20,174,20)
text(c,0,6,'0');text(c,163,6,'80')
c.save()

listener = next(e for e in evidence if e['id']=='E54')
timing = next(json.loads(x['content'])['/interpretation/timing_limit'] for x in listener['excerpts']
              if x['format']=='json' and '/interpretation/timing_limit' in json.loads(x['content']))
seconds = re.search(r'([\d.]+)s after daemon startup', timing).group(1)
c = drawing('usb-ladder', 116)
gates = [('1. Enumeration', 'EP0 passes in later finite physical trials. Earlier failures retained.'),
         ('2. Stock mux v2', 'Handshake passes through native bulk transport.'),
         ('3. Local listener', f'First positive sample: {seconds} s. Exact bind time unmeasured.'),
         ('4. Pair / services', 'Ordinary pairing, information, syslog and AFC remain pending.')]
for i, (a, b) in enumerate(gates):
    x=i*117.6
    box(c,x,4,108,108,a,b,accent=i<2)
    if i<3:
        arrow(c,x+109,58,x+116.6,58)
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
        code=''.join(esc(x)+(r'\allowbreak{}' if x in '/_-.:' else '') for x in el.get_text())
        return r'\texttt{' + code + '}'
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
    env='figure*' if number in (2,3,4,7) else 'figure'
    return '\n'.join([r'\begin{'+env+'}['+('t' if env=='figure*' else 'tb')+']', r'\centering', art,
                      r'\caption[]{'+cap+'}', r'\label{fig:'+str(number)+'}', r'\end{'+env+'}'])


def table(el, caption, number):
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
    env='table' if number in (3,6) else 'table*'
    weights={1:[.65,.95,1.4],2:[.85,.85,1.15,1.15],
             3:[.85,.65,1.5],6:[1.5,.65,.85],8:[1.15,.75,1.15,.95],
             9:[.45,1.55,1.25,.75]}.get(number,[1]*columns)
    assert abs(sum(weights)-columns)<.001
    spec=''.join(r'>{\hsize='+str(w)+r'\hsize\linewidth=\hsize\raggedright\arraybackslash}X' for w in weights)
    return '\n'.join([r'\begin{'+env+'}['+('t' if env=='table*' else 'tb')+']',r'\centering',r'\caption[]{'+caption+'}',r'\label{tab:'+str(number)+'}',
                       r'\setlength{\tabcolsep}{4pt}\renewcommand{\arraystretch}{1.08}',
                       r'\begin{tabularx}{\linewidth}{@{}'+spec+r'@{}}',
                       r'\toprule',*rows_tex,r'\bottomrule',r'\end{tabularx}',r'\end{'+env+'}'])


front = json.loads((ROOT/'content/paper.md').read_text().split('---')[1])
title=front['title']+': '+front['subtitle']
abstract = article.find('h2',id='abstract').find_next_sibling('p')
meta_fragment=BeautifulSoup(str(abstract),'html.parser')
for citation in meta_fragment.select('a[href^="/ios/evidence/"]'):
    citation.decompose()
meta_abstract = meta_fragment.get_text(' ',strip=True)
meta_abstract = meta_abstract.replace('×','x').replace('’',"'").replace('–','-')
assert len(meta_abstract)<1920, len(meta_abstract)

preamble = r'''\documentclass[10pt,letterpaper,twocolumn]{article}
\usepackage[T1]{fontenc}
\usepackage[utf8]{inputenc}
\usepackage{mathptmx}
\usepackage[scaled=.92]{helvet}
\usepackage{courier}
\usepackage[margin=1.05in,includefoot]{geometry}
\setlength{\columnsep}{18pt}
\usepackage{microtype}
\usepackage{graphicx}
\usepackage{booktabs,tabularx,array}
\usepackage{caption}
\usepackage{enumitem}
\usepackage{placeins}
\usepackage{xurl}
\usepackage[unicode]{hyperref}
\input{glyphtounicode}
\pdfgentounicode=1
\hypersetup{hidelinks,pdfauthor={AUTHOR},pdftitle={TITLE},pdfsubject={Preprint prepared for arXiv submission; not yet submitted}}
\captionsetup{font=normalsize,labelfont=bf,justification=raggedright,singlelinecheck=false,skip=5pt}
\setlength{\emergencystretch}{2em}
\setlength{\parskip}{0pt}
\widowpenalty=10000
\clubpenalty=10000
\setlist{nosep,leftmargin=*}
\renewcommand{\topfraction}{0.9}
\renewcommand{\bottomfraction}{0.85}
\renewcommand{\textfraction}{0.08}
\renewcommand{\floatpagefraction}{0.7}
\renewcommand{\dbltopfraction}{0.9}
\renewcommand{\dblfloatpagefraction}{0.7}
\setcounter{topnumber}{3}
\setcounter{dbltopnumber}{3}
\setlength{\textfloatsep}{10pt plus 2pt minus 2pt}
\setlength{\dbltextfloatsep}{10pt plus 2pt minus 2pt}
\makeatletter
\renewcommand{\section}{\@startsection{section}{1}{0pt}
  {-2.5ex plus -.5ex minus -.2ex}{1.2ex plus .2ex}
  {\normalfont\large\bfseries\raggedright}}
\renewcommand{\subsection}{\@startsection{subsection}{2}{0pt}
  {-2ex plus -.4ex minus -.2ex}{.8ex plus .2ex}
  {\normalfont\normalsize\bfseries\raggedright}}
\setlength{\@fptop}{0pt}
\setlength{\@fpsep}{10pt}
\setlength{\@fpbot}{0pt plus 1fil}
\setlength{\@dblfptop}{0pt}
\setlength{\@dblfpsep}{10pt}
\setlength{\@dblfpbot}{0pt plus 1fil}
\renewcommand{\@maketitle}{\begin{center}
{\fontsize{16}{18}\selectfont\bfseries TITLE\par}\vskip .7em
{\large AUTHOR\par}\vskip .4em
{\normalsize 7 October 2026. Preprint prepared for arXiv; not yet submitted or peer reviewed.\par}
\end{center}\vskip .7em}
\makeatother
\begin{document}
\raggedbottom
\maketitle
\section*{Abstract}
ABSTRACT

\noindent\textit{Publication snapshot: edition 2.0, source \texttt{15b3a95}.
Curated ancillary records support inspection of private experiments;
independent reproduction of the port is not provided.}
'''.replace('TITLE',esc(title)).replace('AUTHOR',esc(pub['author'])).replace('ABSTRACT',inline(abstract))

body=[]
children=[x for x in article.children if isinstance(x,Tag)]
skip_next=False
in_abstract=True
in_bib=False
table_number=0
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
            body.insert(len(body)-1, r'''\begin{figure*}[t]
\centering\includegraphics[width=\linewidth]{figures/substrates.pdf}
\caption{Distinct execution substrates. Original print schematic separating the
4A102 iPod reference, partial PinePhone QEMU contract and physical 4A102/7E18
results. This is explanatory organization, not a measured call graph.}
\label{fig:1}\end{figure*}''')
        continue
    if in_abstract:
        continue
    if el.name=='h3':
        heading=re.sub(r'^\d+\.\d+\s*','',el.get_text())
        body.append(r'\subsection{'+esc(heading)+'}')
        if heading=='Two axes of evidence':
            body.append(r'Table~\ref{tab:2} separates the experiment substrate from its observation method; neither axis is an acceptance state.')
        elif heading=='Milestone chronology':
            body.append(r'Table~\ref{tab:9} locates selected engineering milestones in the pinned source history; a date alone does not establish acceptance.')
        elif heading=='Display elapsed-time baseline':
            body.append(r'Figure~\ref{fig:6} and Table~\ref{tab:6} separate the elapsed display-work boundaries from the diagnostic logging sample.')
        elif heading=='USB protocol ladder':
            body.append(r'Figure~\ref{fig:7} and Table~\ref{tab:7} distinguish enumeration, mux transport, listener readiness and ordinary service acceptance.')
    elif el.name=='p':
        body.append(inline(el))
    elif el.name=='figure':
        body.append(figure(el))
    elif el.name=='table':
        next_el=children[i+1]
        caption=''.join(inline(x) for x in next_el.em.children) if next_el.name=='p' and next_el.em else 'Reviewed experimental result.'
        assert caption.startswith('Table '), 'Every reviewed table must retain its caption.'
        table_number+=1
        body.append(table(el,caption,table_number))
        skip_next=True
    elif el.name in ('ul','ol'):
        if in_bib:
            body.append(r'\FloatBarrier\begin{thebibliography}{99}\setlength{\itemsep}{2pt}')
            for j,li in enumerate(el.find_all('li',recursive=False),1):
                body.append(r'\bibitem{ref-'+str(j)+'} '+inline(li,bib=True))
            body.append(r'\end{thebibliography}')
        else:
            env='enumerate' if el.name=='ol' else 'itemize'
            body.append(r'\begin{'+env+'}')
            body.extend(r'\item '+inline(li) for li in el.find_all('li',recursive=False))
            body.append(r'\end{'+env+'}')
    else:
        raise ValueError('Unsupported article element: '+el.name)

cited=sorted(set(a['href'].split('/')[-2] for a in article.select('a[href^="/ios/evidence/"]')))
catalog=[r'\appendix',r'\section{Curated experiment citation index}',
         'E identifiers denote the author\'s curated reports of private experiments, rather than independent publications. '
         r'All 63 reviewed records are supplied in ancillary \texttt{evidence.json}, with source basenames, SHA-256, '
         'excerpt locators, selected measurements, capture provenance and limits. '
         r'\texttt{claims.json} maps claims to those records. This index lists the '+str(len(cited))+' cited identities.',
         r'\setlength{\parskip}{2pt}']
for e in evidence:
    if e['id'] in cited:
        catalog.append(r'\noindent\hypertarget{e-'+e['id']+r'}{\textbf{'+e['id']+'}} '+esc(e['title'])+
                       '. '+esc(e['environment'])+'.')
catalog.extend([r'\normalsize',r'\end{document}'])
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
                          cwd=TEMP,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,text=True,
                          encoding='utf-8',errors='replace')
    (TEMP/'compile-stdout.txt').write_text(result.stdout)
    if result.returncode:
        raise SystemExit(result.stdout[-7000:])
# TeX diagnostics may contain font-encoding bytes for accented author names.
# Replacement decoding preserves the ASCII error markers used by this gate.
log=(TEMP/'main.log').read_text(encoding='utf-8',errors='replace')
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
