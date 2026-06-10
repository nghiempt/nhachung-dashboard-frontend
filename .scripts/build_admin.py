# -*- coding: utf-8 -*-
import re, os, glob

SRC_DIR = '/Users/nghiempt/Workspace/Tino/nhachung/nhachung-admin-html'
APP_DIR = '/Users/nghiempt/Workspace/Tino/nhachung/nhachung-dashboard/nhachung-frontend/app/(admin)'
CSS_FILE = APP_DIR + '/admin.css'

ROUTE = {
 'admin-dashboard':'dashboard','admin-thong-bao':'thong-bao','admin-phan-anh':'phan-anh',
 'admin-cu-dan':'cu-dan','admin-can-ho':'can-ho','admin-phi':'phi','admin-thu-chi':'thu-chi',
 'admin-quy-bao-tri':'quy-bao-tri','admin-van-hanh':'van-hanh','admin-tai-lieu':'tai-lieu',
 'admin-bao-cao':'bao-cao','admin-phan-quyen':'phan-quyen','admin-cai-dat':'cai-dat'}

COMPNAME = {
 'dashboard':'AdminDashboardPage','thong-bao':'AdminThongBaoPage','phan-anh':'AdminPhanAnhPage',
 'cu-dan':'AdminCuDanPage','can-ho':'AdminCanHoPage','phi':'AdminPhiPage','thu-chi':'AdminThuChiPage',
 'quy-bao-tri':'AdminQuyBaoTriPage','van-hanh':'AdminVanHanhPage','tai-lieu':'AdminTaiLieuPage',
 'bao-cao':'AdminBaoCaoPage','phan-quyen':'AdminPhanQuyenPage','cai-dat':'AdminCaiDatPage'}

# ---------- attribute maps ----------
COLON_MAP = {'xlink:href':'xlinkHref','xlink:title':'xlinkTitle','xml:space':'xmlSpace','xml:lang':'xmlLang'}
RENAME = {'class':'className','for':'htmlFor','tabindex':'tabIndex','colspan':'colSpan',
          'rowspan':'rowSpan','maxlength':'maxLength','readonly':'readOnly','autocomplete':'autoComplete',
          'contenteditable':'contentEditable','crossorigin':'crossOrigin','autofocus':'autoFocus',
          'srcset':'srcSet','novalidate':'noValidate','enctype':'encType'}
VOID = {'img','input','br','hr','meta','area','base','col','embed','source','track','wbr'}

def camel(name):
    return re.sub(r'[-:]([a-zA-Z])', lambda m: m.group(1).upper(), name)

def split_paren(s, sep):
    out, depth, cur = [], 0, ''
    for ch in s:
        if ch in '([': depth += 1
        elif ch in ')]': depth -= 1
        if ch == sep and depth == 0:
            out.append(cur); cur = ''
        else:
            cur += ch
    out.append(cur)
    return out

def style_to_obj(val):
    decls = split_paren(val, ';')
    parts = []
    for d in decls:
        d = d.strip()
        if not d: continue
        i = d.find(':')
        if i < 0: continue
        k = d[:i].strip(); v = d[i+1:].strip()
        v = v.replace('\\', '\\\\').replace('"', '\\"')
        if k.startswith('--'):
            key = '"%s"' % k
        else:
            key = camel(k)
        parts.append('%s: "%s"' % (key, v))
    return '{ ' + ', '.join(parts) + ' }'

ATTR_RE = re.compile(r'([:\w-]+)(\s*=\s*(?:"[^"]*"|\'[^\']*\'|[^\s"\'>]+))?')

FORM_VALUE_TAGS = {'input', 'textarea', 'select'}

def transform_attrs(attrs, tag=''):
    tag = tag.lower()
    out = []
    pos = 0
    for m in ATTR_RE.finditer(attrs):
        name = m.group(1)
        raw = m.group(2)
        if raw is None:
            # boolean attr
            if name.lower().startswith('on'): continue
            out.append(name)
            continue
        rawval = raw.split('=', 1)[1].strip()
        if rawval and rawval[0] in '"\'':
            val = rawval[1:-1]
        else:
            val = rawval
        ln = name.lower()
        if ln.startswith('on'):
            continue
        if name == 'xmlns:xlink':
            continue
        if ln == 'style':
            out.append('style={%s}' % style_to_obj(val))
            continue
        if ln == 'class':
            out.append('className="%s"' % val); continue
        # uncontrolled form fields: a static value/checked needs the default* prop
        if tag in FORM_VALUE_TAGS and ln == 'value':
            out.append('defaultValue="%s"' % val); continue
        if tag == 'input' and ln == 'checked':
            out.append('defaultChecked'); continue
        if ln in RENAME:
            newname = RENAME[ln]
        elif ln.startswith('data-') or ln.startswith('aria-'):
            newname = name
        elif name in COLON_MAP:
            newname = COLON_MAP[name]
        elif ':' in name:
            newname = camel(name)
        elif '-' in name:
            newname = camel(name)
        else:
            newname = name
        # value: braces would break JSX in attribute strings; none expected
        val_esc = val.replace('{', '&#123;').replace('}', '&#125;') if newname not in ('d',) else val
        out.append('%s="%s"' % (newname, val))
    return ' '.join(out)

TAG_RE = re.compile(r'<(/?)([a-zA-Z][\w:-]*)((?:[^<>"\']|"[^"]*"|\'[^\']*\')*?)(/?)>', re.S)

def html_to_jsx(html):
    # strip comments & scripts
    html = re.sub(r'<!--.*?-->', '', html, flags=re.S)
    html = re.sub(r'<script.*?</script>', '', html, flags=re.S)
    def repl(m):
        closing, tag, attrs, selfclose = m.groups()
        if closing:
            return '</%s>' % tag
        attrs = attrs.strip()
        newattrs = transform_attrs(attrs, tag) if attrs else ''
        body = tag + ((' ' + newattrs) if newattrs else '')
        if selfclose or tag.lower() in VOID:
            return '<%s />' % body
        return '<%s>' % body
    return TAG_RE.sub(repl, html)

# ---------- CSS scoping ----------
def parse_blocks(css):
    """Yield ('rule', selector, body) or ('at', header, body_or_None)."""
    blocks = []
    i, n = 0, len(css)
    while i < n:
        while i < n and css[i] in ' \t\r\n': i += 1
        if i >= n: break
        # at-rule
        if css[i] == '@':
            j = i
            while j < n and css[j] not in '{;': j += 1
            header = css[i:j].strip()
            if j < n and css[j] == ';':
                blocks.append(('at', header, None)); i = j+1; continue
            # block at-rule
            depth = 0; k = j
            while k < n:
                if css[k] == '{': depth += 1
                elif css[k] == '}':
                    depth -= 1
                    if depth == 0: break
                k += 1
            body = css[j+1:k]
            blocks.append(('at', header, body)); i = k+1; continue
        # normal rule
        j = i
        while j < n and css[j] != '{': j += 1
        sel = css[i:j].strip()
        depth = 0; k = j
        while k < n:
            if css[k] == '{': depth += 1
            elif css[k] == '}':
                depth -= 1
                if depth == 0: break
            k += 1
        body = css[j+1:k]
        blocks.append(('rule', sel, body)); i = k+1
    return blocks

def prefix_selectors(sel, scope):
    parts = split_paren(sel, ',')
    out = []
    for p in parts:
        p = p.strip()
        if not p: continue
        if p.startswith(':root'):
            out.append(p.replace(':root', scope, 1))
        else:
            out.append('%s %s' % (scope, p))
    return ', '.join(out)

def scope_css(css, scope, kf_counter):
    """Return (scoped_css, global_keyframes_css). Renames keyframes per scope."""
    blocks = parse_blocks(css)
    # collect keyframe renames
    kf_renames = {}
    for typ, header, body in blocks:
        m = re.match(r'@(-webkit-)?keyframes\s+([\w-]+)', header) if typ=='at' else None
        if m:
            name = m.group(2)
            kf_renames.setdefault(name, '%s__%s' % (name, scope.lstrip('.').replace('-', '_')))
    out = []
    glob_kf = []
    for typ, header, body in blocks:
        if typ == 'rule':
            out.append('%s{%s}' % (prefix_selectors(header, scope), body.strip()))
        else:
            mkf = re.match(r'@(-webkit-)?keyframes\s+([\w-]+)(.*)', header)
            if mkf:
                pre = mkf.group(1) or ''
                name = mkf.group(2)
                newname = kf_renames[name]
                glob_kf.append('@%skeyframes %s{%s}' % (pre, newname, body))
                continue
            if header.startswith('@media') or header.startswith('@supports'):
                inner = parse_blocks(body or '')
                ib = []
                for t2, h2, b2 in inner:
                    if t2 == 'rule':
                        ib.append('%s{%s}' % (prefix_selectors(h2, scope), b2.strip()))
                    elif t2 == 'at':
                        mk2 = re.match(r'@(-webkit-)?keyframes\s+([\w-]+)', h2)
                        if mk2:
                            nm = mk2.group(2); nn = kf_renames.get(nm, nm)
                            glob_kf.append('@%skeyframes %s{%s}' % (mk2.group(1) or '', nn, b2))
                        else:
                            ib.append('%s{%s}' % (h2, b2 or ''))
                    else:
                        ib.append(h2 + ';')
                out.append('%s{%s}' % (header, ''.join(ib)))
            elif header.startswith('@font-face'):
                glob_kf.append('@font-face{%s}' % (body or ''))
            else:
                out.append('%s{%s}' % (header, body or ''))
    scoped = '\n'.join(out)
    # apply keyframe renames to animation references inside scoped css
    for old, new in kf_renames.items():
        scoped = re.sub(r'\b%s\b' % re.escape(old), new, scoped)
    return scoped, '\n'.join(glob_kf)

# ---------- main ----------
def extract_body(src):
    m = re.search(r'<div class="content-scroll">', src)
    start = m.end()
    sm = re.search(r'<script', src[start:])
    end = start + (sm.start() if sm else len(src)-start)
    inner = src[start:end]
    inner = re.sub(r'<!--.*?-->', '', inner, flags=re.S).strip()
    # source HTML has malformed self-closing tags like `<line .../</svg>`
    # (missing the closing `>`). `/<` only ever appears in that broken case.
    inner = inner.replace('/<', '/><')
    # remove trailing two closing divs (content-scroll, main)
    for _ in range(2):
        inner = re.sub(r'</div>\s*$', '', inner).strip()
    return inner

def fix_links(html):
    html = re.sub(r'href="admin-([a-z-]+)\.html"', r'href="/admin/\1"', html)
    html = re.sub(r'href="ai-assistant\.html"', r'href="/admin/ai-assistant"', html)
    html = re.sub(r'href="[a-z-]+\.html"', r'href="#"', html)
    return html

css_chunks = []
kf_chunks = []
for path in sorted(glob.glob(SRC_DIR + '/admin-*.html')):
    base = os.path.splitext(os.path.basename(path))[0]
    route = ROUTE[base]
    scope = '.adm-r-%s' % route
    src = open(path, encoding='utf-8').read()
    style = re.search(r'<style>(.*?)</style>', src, re.S).group(1)
    scoped, gkf = scope_css(style, scope, None)
    css_chunks.append('/* ===== %s ===== */\n%s' % (route, scoped))
    if gkf.strip(): kf_chunks.append(gkf)

    body = extract_body(src)
    body = fix_links(body)
    jsx = html_to_jsx(body)
    comp = COMPNAME[route]
    page = ('export default function %s() {\n  return (\n    <div className="adm-r-%s">\n%s\n    </div>\n  );\n}\n'
            % (comp, route, '\n'.join('      ' + ln for ln in jsx.split('\n'))))
    outdir = '%s/admin/%s' % (APP_DIR, route)
    os.makedirs(outdir, exist_ok=True)
    open(outdir + '/page.tsx', 'w', encoding='utf-8').write(page)
    print('generated', route, 'jsx_lines=%d css_lines=%d' % (jsx.count(chr(10)), scoped.count(chr(10))))

# dedupe global keyframes, append all to css
seen = set(); uniq = []
for chunk in kf_chunks:
    if chunk not in seen:
        seen.add(chunk); uniq.append(chunk)

base_css = open(CSS_FILE, encoding='utf-8').read()
MARK = 'AUTO-GENERATED PER-PAGE STYLES BELOW'
idx = base_css.find(MARK)
if idx != -1:
    end = base_css.find('*/', idx)
    base_css = base_css[:end + 2] + '\n'
with open(CSS_FILE, 'w', encoding='utf-8') as f:
    f.write(base_css)
    f.write('\n\n/* ====== per-page keyframes ====== */\n')
    f.write('\n'.join(uniq))
    f.write('\n\n')
    f.write('\n\n'.join(css_chunks))
    f.write('\n')
print('DONE')
