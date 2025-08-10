import sqlite3
import hashlib
import json
from pathlib import Path

DB = "cache.db"
conn = sqlite3.connect(DB, check_same_thread=False)
c = conn.cursor()
c.execute('''CREATE TABLE IF NOT EXISTS docs
             (doc_hash TEXT PRIMARY KEY, filename TEXT, summary TEXT, metadata TEXT)''')
conn.commit()

def checksum_text(text: str):
    return hashlib.sha256(text.encode('utf-8')).hexdigest()

def save_summary_to_db(doc_hash, filename, summary, metadata: dict):
    c.execute("INSERT OR REPLACE INTO docs VALUES (?,?,?,?)",
              (doc_hash, filename, summary, json.dumps(metadata)))
    conn.commit()

def get_summary_from_db(doc_hash):
    c.execute("SELECT summary, metadata FROM docs WHERE doc_hash=?", (doc_hash,))
    row = c.fetchone()
    if row:
        return row[0], json.loads(row[1])
    return None, None

def write_output_files(out_dir, filename, summary, metadata):
    Path(out_dir).mkdir(parents=True, exist_ok=True)
    md_path = Path(out_dir)/f"{filename}.md"
    json_path = Path(out_dir)/f"{filename}.json"
    md_path.write_text("# Summary\n\n" + summary + "\n\n## Metadata\n" + json.dumps(metadata, indent=2))
    json_path.write_text(json.dumps({"summary": summary, "metadata": metadata}, indent=2))
