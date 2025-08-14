# preprocess.py 
import re
from typing import List
import spacy
nlp = spacy.load("en_core_web_sm")
PAGENUM_RE = re.compile(r'page\s*\d+|page:\s*\d+', re.I)
HEADER_FOOTER_RE = re.compile(r'^[A-Z\s]{4,}$', re.M)

def clean_page_text(text: str) -> str:
    text = PAGENUM_RE.sub("", text)
    text = HEADER_FOOTER_RE.sub("", text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def split_sentences(text: str) -> List[str]:
    doc = nlp(text)
    return [sent.text.strip() for sent in doc.sents if len(sent.text.strip())>10]

MED_TERM_RE = re.compile(r'\b(Hemoglobin|HbA1c|Glucose|WBC|RBC|Cholesterol|LDL|HDL|Triglycerides)\b', re.I)

def extract_med_terms(text: str) -> List[str]:
    return list({m.group(0).lower() for m in MED_TERM_RE.finditer(text)})
