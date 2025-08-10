# chunker.py
from collections import deque
from typing import List

def approx_tokens(text: str):
    words = len(text.split())
    return int(words / 0.75) + 1

def chunk_sentences(sentences: List[str], max_tokens=800):
    chunks = []
    buf = []
    buf_tokens = 0
    for s in sentences:
        t = approx_tokens(s)
        if buf_tokens + t <= max_tokens:
            buf.append(s)
            buf_tokens += t
        else:
            if buf:
                chunks.append(" ".join(buf))
            if t > max_tokens:
                words = s.split()
                sub = []
                sub_t = 0
                for w in words:
                    sub.append(w)
                    sub_t += 1/0.75
                    if sub_t >= max_tokens:
                        chunks.append(" ".join(sub))
                        sub = []
                        sub_t = 0
                if sub:
                    chunks.append(" ".join(sub))
                buf = []
                buf_tokens = 0
            else:
                buf = [s]
                buf_tokens = t
    if buf:
        chunks.append(" ".join(buf))
    return chunks
