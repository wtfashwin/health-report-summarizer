# summarizer_script_v2.py

import fitz  # PyMuPDF
import pdfplumber
import spacy
from transformers import pipeline
from tqdm import tqdm
import time
import os
import glob
import pandas as pd # Make sure you have pandas installed!

# --- Text Processing & Chunking
# You need to install this model: python -m spacy download en_core_web_sm
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    print("Downloading spaCy model...")
    os.system("python -m spacy download en_core_web_sm")
    nlp = spacy.load("en_core_web_sm")

def extract_text_from_pdf(file_path):
    """
    Extracts text from a PDF file using PyMuPDF and pdfplumber.
    """
    text = ""
    try:
        with fitz.open(file_path) as doc:
            for page in doc:
                text += page.get_text()
    except Exception as e:
        print(f"Error with PyMuPDF: {e}. Trying pdfplumber...")
        try:
            with pdfplumber.open(file_path) as pdf:
                for page in pdf.pages:
                    text += page.extract_text() or ""
        except Exception as e:
            print(f"Error with pdfplumber: {e}")
            return None
            
    cleaned_text = os.linesep.join([s for s in text.splitlines() if s.strip()])
    return cleaned_text

def chunk_text(text, max_chunk_length=512):
    """
    Splits text into chunks based on sentence boundaries.
    """
    doc = nlp(text)
    sentences = [sent.text for sent in doc.sents]
    
    chunks = []
    current_chunk = ""
    for sentence in sentences:
        if len(current_chunk) + len(sentence) + 1 < max_chunk_length:
            current_chunk += " " + sentence
        else:
            chunks.append(current_chunk.strip())
            current_chunk = sentence
    if current_chunk:
        chunks.append(current_chunk.strip())
    
    return [c for c in chunks if c] # Filter out any empty chunks

# --- Summarization Model (Inference)
SUM_MODEL = "sshleifer/distilbart-cnn-12-6"

def get_summarizer(model_name=SUM_MODEL, device=-1):
    """
    Initializes and returns a summarization pipeline.
    """
    try:
        return pipeline("summarization", model=model_name, tokenizer=model_name, device=device)
    except Exception as e:
        print(f"Error loading model: {e}")
        return None

def batch_summarize(chunks, summarizer, batch_size=2, min_length=30, max_length=150):
    """
    Summarizes a list of text chunks in batches.
    """
    results = []
    for i in tqdm(range(0, len(chunks), batch_size), desc="Summarizing"):
        batch = chunks[i:i+batch_size]
        retry = 2
        while retry:
            try:
                out = summarizer(batch, truncation=True, min_length=min_length, max_length=max_length)
                results.extend([o['summary_text'] for o in out])
                break
            except Exception as e:
                print(f"Summarizer error: {e}, retrying...")
                retry -= 1
                time.sleep(1)
    return results

def stitch_summary(summary_sentences):
    """
    Joins a list of summary sentences into a single paragraph.
    """
    return " ".join(summary_sentences)

# --- Main Logic for Dataset Processing
def process_pdf_files_in_folder(root_folder, summarizer):
    """
    Walks through all subdirectories and processes PDF files.
    """
    output_dir = os.path.join(root_folder, "summaries_pdf")
    os.makedirs(output_dir, exist_ok=True)
    
    print(f"\n--- Starting PDF processing in {root_folder} ---")
    
    # Use os.walk to find all PDFs in the folder and its subfolders
    pdf_files = []
    for dirpath, dirnames, filenames in os.walk(root_folder):
        for filename in filenames:
            if filename.lower().endswith(".pdf"):
                pdf_files.append(os.path.join(dirpath, filename))
    
    if not pdf_files:
        print(f"No PDF files found in {root_folder} or its subfolders.")
        return

    print(f"Found {len(pdf_files)} PDF files to process.")
    for pdf_file_path in tqdm(pdf_files, desc="Processing PDFs"):
        full_text = extract_text_from_pdf(pdf_file_path)
        
        if not full_text:
            continue

        chunks = chunk_text(full_text)
        summary_sentences = batch_summarize(chunks, summarizer)
        final_summary = stitch_summary(summary_sentences)
        
        # Save summary to a new subfolder
        relative_path = os.path.relpath(pdf_file_path, root_folder)
        output_subfolder = os.path.join(output_dir, os.path.dirname(relative_path))
        os.makedirs(output_subfolder, exist_ok=True)

        output_filename = os.path.basename(pdf_file_path).replace('.pdf', '_summary.txt')
        output_path = os.path.join(output_subfolder, output_filename)
        
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(final_summary)
            
        # print(f"Summary saved to {output_path}")

def process_csv_file(file_path, summarizer, report_column_name='Report'):
    """
    Loads a CSV, processes the text, and summarizes it.
    """
    try:
        df = pd.read_csv(file_path)
    except Exception as e:
        print(f"Error reading CSV file: {e}")
        return

    if report_column_name not in df.columns:
        print(f"Column '{report_column_name}' not found in CSV '{os.path.basename(file_path)}'. Skipping.")
        return

    output_dir = os.path.dirname(file_path)
    output_path = os.path.join(output_dir, os.path.basename(file_path).replace('.csv', '_with_summaries.csv'))

    df['summary'] = ''
    
    print(f"\n--- Processing {len(df)} reports from {os.path.basename(file_path)} ---")
    for index, row in tqdm(df.iterrows(), total=len(df), desc="Summarizing CSV"):
        full_text = str(row[report_column_name])
        
        if not full_text or full_text.strip() == '':
            df.at[index, 'summary'] = "No text found."
            continue
        
        chunks = chunk_text(full_text)
        summary_sentences = batch_summarize(chunks, summarizer)
        final_summary = stitch_summary(summary_sentences)
        
        df.at[index, 'summary'] = final_summary
        
    df.to_csv(output_path, index=False)
    print(f"\nSummaries saved to {output_path}")

if __name__ == "__main__":
    # The only path you need to provide is to your main dataset folder
    dataset_root = "C:/Users/Administrator/Downloads/Projects/Healthcare Report Summarizer/health-report-summarizer/dataset"
    
    print("Loading summarization model...")
    summarizer = get_summarizer()
    
    if not summarizer:
        print("Model could not be loaded. Please ensure PyTorch is installed.")
        exit()

    # --- Find and process all files in the dataset folder ---
    for dirpath, dirnames, filenames in os.walk(dataset_root):
        for filename in filenames:
            file_path = os.path.join(dirpath, filename)
            
            if filename.lower().endswith(".pdf"):
                print(f"Found PDF file: {file_path}. Processing with dedicated PDF logic.")
                # This calls the PDF processing logic on a single file at a time
                process_pdf_files_in_folder(dirpath, summarizer)
                # We can break here to avoid re-processing the same folders
                break
            elif filename.lower().endswith(".csv"):
                print(f"Found CSV file: {file_path}. Processing with dedicated CSV logic.")
                process_csv_file(file_path, summarizer)