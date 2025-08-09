
from sklearn.feature_extraction.text import TfidfVectorizer 
import heapq

def rank_sentences_tfidf(sentences, top_k=5):
    if len(sentences) <= top_k:
        return sentences
    vect = TfidfVectorizer(stop_words='english', max_df=0.8, min_df=1)
    X = vect.fit_transform(sentences)  
    import numpy as np
    scores = (X.power(2)).sum(axis=1).A1  # get squared L2 norm of each sentence vector
    scores = np.array(scores).flatten()
    topk_idx = heapq.nlargest(top_k, range(len(scores)), key=lambda i: scores[i])
    topk_idx.sort()
    return [sentences[i] for i in topk_idx]
