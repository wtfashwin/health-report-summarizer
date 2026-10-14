# Health Report Summarizer

Health Report Summarizer is a Python prototype for turning report PDFs into shorter text, with a separate unfinished web interface.

## What it does

- Extracts PDF text with PyMuPDF, with OCR through Tesseract for empty pages.
- Cleans and splits text, ranks sentences with TF-IDF, and groups them into chunks.
- Summarizes chunks with the Hugging Face `sshleifer/distilbart-cnn-12-6` model.
- Caches summaries in SQLite and writes Markdown and JSON outputs.
- Includes a separate batch script for PDF folders and CSV files with a `Report` column.

## Python setup and usage

No Python dependency file is included. The source requires PyMuPDF, pdfplumber, pytesseract, Pillow, spaCy, scikit-learn, transformers, a supported model runtime such as PyTorch, tqdm, and pandas. Scanned PDFs also require the Tesseract executable installed on your system. Compatible package versions have not been established in this repository.

In an environment with those dependencies installed, download the spaCy model and run the single-PDF entry point from the repository root:

```bash
python -m spacy download en_core_web_sm
python backend/pipeline_run.py "path/to/report.pdf"
```

Replace the path with a PDF you are authorized to process. Model weights may need downloading on first use. The command creates `cache.db` and `outputs/` in the current working directory. Repeated document text can reuse cached results.

For batch processing, `backend/summarizer.py` also handles PDF folders and a CSV `Report` column, but its `dataset_root` is an author-specific Windows path that must be changed before use.

## Web interface

`frontend/` contains Next.js, React, TypeScript, and Chakra UI code. Its package scripts are:

```bash
cd frontend
npm install
npm run dev
npm run build
```

These are defined commands, not a verified working web setup. The page expects `http://localhost:5000/upload` and `/api/history`, neither of which is implemented in the captured source. The UI also contains mock history results and missing imports/dependencies, including Chakra icons and theme components. It needs repair before integration.

## Project structure

- `backend/pipeline_run.py` — single-PDF processing entry point.
- `backend/pdf_extract.py`, `preprocess.py`, `scoring.py`, `chunker.py` — text preparation.
- `backend/summarizer.py`, `storage.py` — model inference, batch processing, and caching.
- `frontend/` — unfinished upload/history interface.
- `dataset/` — checked-in PDF and CSV data; source provenance is not documented.

## Status and limitations

This is a prototype with no automated test suite or clinically validated results. The model is a general summarizer; medical-term replacement is not implemented. Generated text can omit or change findings, so retain and check the original report. Cached summaries are stored locally without encryption or access controls in this code.

## License

No license file is included. Dataset reuse terms are not specified.
