# pipeline_run.py
from pdf_extract import extract_text_from_pdf
from preprocess import clean_page_text, split_sentences, extract_med_terms
from scoring import rank_sentences_tfidf
from chunker import chunk_sentences
from pathlib import Path
from summarizer import get_summarizer, batch_summarize, stitch_summary
from storage import checksum_text, get_summary_from_db, save_summary_to_db, write_output_files

def process_pdf(path, out_dir="outputs"):
    pages = []
    for page in extract_text_from_pdf(path):
        pages.append(clean_page_text(page))
    full_text = "\n".join(pages)
    doc_hash = checksum_text(full_text)
    existing, meta = get_summary_from_db(doc_hash)
    if existing:
        print("Found cached summary. Skipping compute.")
        write_output_files(out_dir, Path(path).stem + "_cached", existing, meta)
        return existing, meta

    sentences = split_sentences(full_text)

    top_sentences = rank_sentences_tfidf(sentences, top_k=min(80, len(sentences)))

    chunks = chunk_sentences(top_sentences, max_tokens=700)

    summarizer = get_summarizer()
    chunk_summaries = batch_summarize(chunks, summarizer, batch_size=1)
    final_summary = stitch_summary(chunk_summaries)

    metadata = {
        "n_pages": len(pages),
        "n_sentences": len(sentences),
        "n_chunks": len(chunks),
        "terms": extract_med_terms(full_text)[:10]
    }

    save_summary_to_db(doc_hash, Path(path).name, final_summary, metadata)
    write_output_files(out_dir, Path(path).stem, final_summary, metadata)
    return final_summary, metadata

if __name__ == "__main__":
    import sys
    from pathlib import Path

    if len(sys.argv) < 2:
        print("❌ Error: Please provide the path to a PDF file.")
        print("Example: python pipeline_run.py dataset/Breast_Cancer/Test/report_0_801.pdf")
        sys.exit(1)

    path = Path(sys.argv[1])

    if not path.exists():
        print(f"❌ Error: File not found → {path}")
        sys.exit(1)

    if path.suffix.lower() != ".pdf":
        print("❌ Error: Provided file is not a PDF.")
        sys.exit(1)

    out, meta = process_pdf(path)
    print("\n✅ Summary complete.")
    print("📊 Metadata:", meta)
