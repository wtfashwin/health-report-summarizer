import fitz  
import pdfplumber
from typing import Iterator
import pytesseract 
from PIL import Image
import io

def extract_text_from_pdf(path: str, ocr_if_empty: bool = True) -> Iterator[str]:
    """Yield page-level text strings."""
    doc = fitz.open(path)
    for page_num in range(doc.page_count):
        page = doc.load_page(page_num)
        text = page.get_text("text")
        if text and text.strip():
            yield text
            continue
        if ocr_if_empty:
            with pdfplumber.open(path) as p:
                pil = p.pages[page_num].to_image(resolution=150).original
                txt = pytesseract.image_to_string(pil)
                yield txt
        else:
            yield ""
    doc.close()
