# -*- coding: utf-8 -*-
"""매뉴얼 연습용 지반조사 보고서(예시) PDF 만들기 — 2026-11-10 v1.1.0
   실행: python -X utf8 make_sample_pdf.py  →  manual/assets/sample_soil_report.pdf
   값은 모두 가상. 시추주상도 서식은 여러 업체 보고서의 공통 칸(공번 · 지하수위 (GL-) · 심도 · N치 · 「◎ 지층(a∼b m)」 설명)을 본뜸"""
import os
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.abspath(__file__))
M = os.path.abspath(os.path.join(HERE, '..'))
HOLES = {
    'BH-1': {'gw': '3.5', 'elev': '24.50', 'layers': [
        ('매립층', 0.0, 1.2, '실트질 모래', 'SM', '느슨 · 습윤 · 갈색'),
        ('퇴적층', 1.2, 4.5, '모래질 점토', 'CL', '연약 내지 보통 견고 · 암갈색'),
        ('풍화토', 4.5, 9.0, '실트질 모래', 'SM', '기반암의 완전풍화 · 보통 조밀 내지 매우 조밀'),
        ('풍화암', 9.0, 10.5, '실트질 모래', 'SM', '굴진 시 암편 섞인 실트질 모래로 분해 · 매우 조밀')],
        'spt': [(1.5, '8/30'), (3.0, '6/30'), (4.5, '14/30'), (6.0, '21/30'), (7.5, '33/30'), (9.0, '50/18'), (10.5, '50/8')]},
    'BH-2': {'gw': '2.8', 'elev': '24.10', 'layers': [
        ('매립층', 0.0, 0.8, '실트질 모래', 'SM', '느슨 · 습윤'),
        ('퇴적층', 0.8, 3.2, '실트질 모래', 'SM', '보통 조밀 · 젖은 상태'),
        ('풍화토', 3.2, 8.5, '실트질 모래', 'SM', '기반암의 완전풍화 · 조밀 내지 매우 조밀'),
        ('풍화암', 8.5, 10.0, '실트질 모래', 'SM', '매우 조밀')],
        'spt': [(1.5, '10/30'), (3.0, '12/30'), (4.5, '18/30'), (6.0, '26/30'), (7.5, '41/30'), (9.0, '50/15')]},
}

def log_page(hole, d):
    h = ['<div class="pg"><div class="mark">예시 자료</div>',
         '<h2>시추주상도</h2><div class="sub">DRILL LOG</div>',
         '<table class="hd">',
         '<tr><td style="width:14%">공 사 명<br>PROJECT</td><td style="width:40%">만민 근린생활시설 신축공사</td><td style="width:16%">공 번<br>HOLE No.</td><td>' + hole + '</td></tr>',
         '<tr><td>위 치<br>LOCATION</td><td>전북 ○○시 ○○동 123 (예시)</td><td>지반표고<br>ELEVATION</td><td>' + d['elev'] + ' M</td></tr>',
         '<tr><td>날 짜<br>DATE</td><td>2026-11-02</td><td>지하수위<br>GROUND WATER</td><td>(GL-) ' + d['gw'] + ' M</td></tr>',
         '</table><br>',
         '<table class="log"><tr><th style="width:54%">지층 설명<br>Description</th><th style="width:10%">통일분류<br>USCS</th><th style="width:12%">시료 심도<br>(m)</th><th>N치<br>(회/cm)</th></tr>']
    used = set()
    for z, n in d['spt']:
        desc, code, bot = '', '', ''
        for L in d['layers']:
            if L[0] in used:
                continue
            if L[1] <= z + 1e-9:
                used.add(L[0])
                desc += f'<div>◎ {L[0]}({L[1]:.1f}∼{L[2]:.1f}m)</div><div>- {L[3]}</div><div>- {L[5]}</div>'
                code = L[4]; bot = f'{L[2]:.2f}'
        h.append(f'<tr><td>{desc}</td><td class="c">{code}</td><td class="c">{z:.1f}</td><td class="c">{n}</td></tr>')
    h.append('</table></div>')
    return '\n'.join(h)

html = open(os.path.join(HERE, 'sample_report.html'), encoding='utf-8').read()
for k, d in HOLES.items():
    html = html.replace(f'<!--LOG:{k}-->', log_page(k, d))
os.makedirs(os.path.join(M, 'assets'), exist_ok=True)
out = os.path.join(M, 'assets', 'sample_soil_report.pdf')
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page()
    pg.set_content(html); pg.wait_for_timeout(300)
    pg.pdf(path=out, format='A4', print_background=True, prefer_css_page_size=True)
    b.close()
print('ok', out, os.path.getsize(out))
