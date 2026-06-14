from __future__ import annotations

import re
from pathlib import Path

from docx import Document
from docx.enum.section import WD_SECTION_START
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Inches, Pt, RGBColor


ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path(
    r"C:\Users\HUAWEI\.codex\attachments\b49cfeb9-7a81-413c-81a8-5d42c4508109\pasted-text.txt"
)
OUT = ROOT / "docs" / "PageU-作品说明文档.docx"

BLUE = RGBColor(46, 116, 181)
DARK_BLUE = RGBColor(31, 77, 120)
NAVY = RGBColor(11, 37, 69)
MUTED = RGBColor(99, 110, 123)
LIGHT_FILL = "F4F6F9"
LINE = "D9E2EF"


def set_run_font(run, font="Microsoft YaHei", size=None, color=None, bold=None, italic=None):
    run.font.name = font
    run._element.rPr.rFonts.set(qn("w:ascii"), font)
    run._element.rPr.rFonts.set(qn("w:hAnsi"), font)
    run._element.rPr.rFonts.set(qn("w:eastAsia"), font)
    if size is not None:
        run.font.size = Pt(size)
    if color is not None:
        run.font.color.rgb = color
    if bold is not None:
        run.bold = bold
    if italic is not None:
        run.italic = italic


def paragraph_border_bottom(paragraph, color="D9E2EF", size="10"):
    p_pr = paragraph._p.get_or_add_pPr()
    p_bdr = p_pr.find(qn("w:pBdr"))
    if p_bdr is None:
        p_bdr = OxmlElement("w:pBdr")
        p_pr.append(p_bdr)
    bottom = OxmlElement("w:bottom")
    bottom.set(qn("w:val"), "single")
    bottom.set(qn("w:sz"), size)
    bottom.set(qn("w:space"), "5")
    bottom.set(qn("w:color"), color)
    p_bdr.append(bottom)


def paragraph_box(paragraph, fill="F4F6F9", border="D9E2EF"):
    p_pr = paragraph._p.get_or_add_pPr()
    shd = p_pr.find(qn("w:shd"))
    if shd is None:
        shd = OxmlElement("w:shd")
        p_pr.append(shd)
    shd.set(qn("w:fill"), fill)

    p_bdr = p_pr.find(qn("w:pBdr"))
    if p_bdr is None:
        p_bdr = OxmlElement("w:pBdr")
        p_pr.append(p_bdr)
    for edge in ("top", "left", "bottom", "right"):
        node = OxmlElement(f"w:{edge}")
        node.set(qn("w:val"), "single")
        node.set(qn("w:sz"), "8")
        node.set(qn("w:space"), "6")
        node.set(qn("w:color"), border)
        p_bdr.append(node)


def add_page_field(paragraph):
    run = paragraph.add_run()
    fld_char_begin = OxmlElement("w:fldChar")
    fld_char_begin.set(qn("w:fldCharType"), "begin")
    instr_text = OxmlElement("w:instrText")
    instr_text.set(qn("xml:space"), "preserve")
    instr_text.text = "PAGE"
    fld_char_sep = OxmlElement("w:fldChar")
    fld_char_sep.set(qn("w:fldCharType"), "separate")
    text = OxmlElement("w:t")
    text.text = "1"
    fld_char_end = OxmlElement("w:fldChar")
    fld_char_end.set(qn("w:fldCharType"), "end")
    run._r.extend([fld_char_begin, instr_text, fld_char_sep, text, fld_char_end])


def clean_lines(text):
    lines = [line.rstrip() for line in text.replace("\r\n", "\n").replace("\r", "\n").split("\n")]
    return lines


def extract_document(lines):
    title = ""
    subtitle = ""
    body = []
    for line in lines:
        if line.startswith("# ") and not title:
            title = line[2:].strip()
            continue
        if line.startswith("## ") and not subtitle:
            subtitle = line[3:].strip()
            continue
        body.append(line)
    return title, subtitle, body


def collect_headings(lines):
    headings = []
    for line in lines:
        if line.startswith("## "):
            headings.append((1, line[3:].strip()))
        elif line.startswith("### "):
            headings.append((2, line[4:].strip()))
    return headings


def apply_styles(doc):
    section = doc.sections[0]
    section.page_width = Inches(8.5)
    section.page_height = Inches(11)
    section.top_margin = Inches(1)
    section.bottom_margin = Inches(1)
    section.left_margin = Inches(1)
    section.right_margin = Inches(1)
    section.header_distance = Inches(0.492)
    section.footer_distance = Inches(0.492)

    styles = doc.styles
    normal = styles["Normal"]
    normal.font.name = "Microsoft YaHei"
    normal._element.rPr.rFonts.set(qn("w:eastAsia"), "Microsoft YaHei")
    normal.font.size = Pt(11)
    normal.paragraph_format.space_before = Pt(0)
    normal.paragraph_format.space_after = Pt(8)
    normal.paragraph_format.line_spacing = 1.333
    normal.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY

    for name, size, color, before, after in [
        ("Heading 1", 16, BLUE, 18, 10),
        ("Heading 2", 13, BLUE, 12, 6),
        ("Heading 3", 12, DARK_BLUE, 8, 4),
    ]:
        style = styles[name]
        style.font.name = "Microsoft YaHei"
        style._element.rPr.rFonts.set(qn("w:eastAsia"), "Microsoft YaHei")
        style.font.size = Pt(size)
        style.font.color.rgb = color
        style.font.bold = True
        style.paragraph_format.space_before = Pt(before)
        style.paragraph_format.space_after = Pt(after)
        style.paragraph_format.line_spacing = 1.208


def set_header_footer(section):
    header_p = section.header.paragraphs[0]
    header_p.text = ""
    header_p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    run = header_p.add_run("PageU 作品说明文档")
    set_run_font(run, size=9, color=MUTED)

    footer_p = section.footer.paragraphs[0]
    footer_p.text = ""
    footer_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = footer_p.add_run("第 ")
    set_run_font(run, size=9, color=MUTED)
    add_page_field(footer_p)
    run = footer_p.add_run(" 页")
    set_run_font(run, size=9, color=MUTED)


def add_cover(doc, title, subtitle):
    for _ in range(6):
        doc.add_paragraph()

    kicker = doc.add_paragraph()
    kicker.alignment = WD_ALIGN_PARAGRAPH.CENTER
    kicker.paragraph_format.space_after = Pt(16)
    r = kicker.add_run("智联招聘 AI 大赛参赛作品")
    set_run_font(r, size=12, color=MUTED, bold=True)

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_after = Pt(8)
    r = p.add_run("PageU")
    set_run_font(r, size=30, color=NAVY, bold=True)

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_after = Pt(12)
    r = p.add_run("面向未来求职方式的 AI 个人网站生成平台")
    set_run_font(r, size=18, color=NAVY, bold=True)

    rule = doc.add_paragraph()
    paragraph_border_bottom(rule, color=LINE, size="12")
    rule.paragraph_format.space_after = Pt(18)

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_after = Pt(28)
    r = p.add_run(subtitle)
    set_run_font(r, size=14, color=MUTED)

    p = doc.add_paragraph()
    paragraph_box(p, fill=LIGHT_FILL, border=LINE)
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.left_indent = Cm(0.2)
    p.paragraph_format.right_indent = Cm(0.2)
    p.paragraph_format.space_before = Pt(6)
    p.paragraph_format.space_after = Pt(6)
    r = p.add_run("AI 能力 + 模板系统 + 项目展示 + 发布分享，帮助求职者生成可访问、可传播的个人展示网站。")
    set_run_font(r, size=11, color=NAVY, bold=True)

    for _ in range(7):
        doc.add_paragraph()

    meta = doc.add_paragraph()
    meta.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = meta.add_run("生成日期：2026 年 6 月 14 日")
    set_run_font(r, size=10, color=MUTED)
    doc.add_page_break()


def add_toc(doc, headings):
    p = doc.add_paragraph()
    p.style = "Heading 1"
    p.add_run("目录")
    intro = doc.add_paragraph()
    intro.paragraph_format.space_after = Pt(10)
    r = intro.add_run("以下目录按正文结构整理，便于评审快速浏览作品定位、功能方案、技术架构与落地规划。")
    set_run_font(r, size=10.5, color=MUTED)

    for level, text in headings:
        if level == 1:
            p = doc.add_paragraph()
            p.paragraph_format.left_indent = Cm(0)
            p.paragraph_format.space_after = Pt(3)
            r = p.add_run(text)
            set_run_font(r, size=10.5, color=NAVY, bold=True)
        else:
            p = doc.add_paragraph()
            p.paragraph_format.left_indent = Cm(0.6)
            p.paragraph_format.space_after = Pt(2)
            r = p.add_run(text)
            set_run_font(r, size=9.5, color=MUTED)
    doc.add_page_break()


def add_screenshot_placeholder(doc, text):
    p = doc.add_paragraph()
    paragraph_box(p, fill="F8FAFD", border=LINE)
    p.paragraph_format.left_indent = Cm(0.2)
    p.paragraph_format.right_indent = Cm(0.2)
    p.paragraph_format.space_before = Pt(6)
    p.paragraph_format.space_after = Pt(8)
    r = p.add_run("截图占位｜")
    set_run_font(r, size=10.5, color=BLUE, bold=True)
    r = p.add_run(text)
    set_run_font(r, size=10.5, color=MUTED)


def add_body_paragraph(doc, text):
    text = text.strip()
    if not text:
        return
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(8)
    r = p.add_run(text)
    set_run_font(r, size=11)


def add_bullet(doc, text):
    p = doc.add_paragraph(style="List Bullet")
    p.paragraph_format.left_indent = Cm(0.7)
    p.paragraph_format.first_line_indent = Cm(-0.3)
    p.paragraph_format.space_after = Pt(4)
    r = p.add_run(text)
    set_run_font(r, size=10.8)


def build_docx():
    text = SOURCE.read_text(encoding="utf-8")
    lines = clean_lines(text)
    title, subtitle, body = extract_document(lines)
    headings = collect_headings(body)

    doc = Document()
    apply_styles(doc)
    set_header_footer(doc.sections[0])
    add_cover(doc, title, subtitle)
    add_toc(doc, headings)

    for line in body:
        stripped = line.strip()
        if not stripped or stripped == "---":
            continue
        if stripped.startswith("## "):
            p = doc.add_paragraph(style="Heading 1")
            p.add_run(stripped[3:].strip())
        elif stripped.startswith("### "):
            p = doc.add_paragraph(style="Heading 2")
            p.add_run(stripped[4:].strip())
        elif stripped.startswith("* "):
            add_bullet(doc, stripped[2:].strip())
        elif re.fullmatch(r"【插入截图：.+】", stripped):
            add_screenshot_placeholder(doc, stripped.strip("【】").replace("插入截图：", ""))
        else:
            add_body_paragraph(doc, stripped)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    doc.save(OUT)
    return OUT


if __name__ == "__main__":
    print(build_docx())
