import os
import sys

# Prevent Python 3.11+ / 3.12+ security error with sys.path[0] on Windows
sys.path = [p for p in sys.path if p not in ("", ".")]

import re
import pickle
import warnings
import torch
import torch.nn as nn
import nltk
from nltk.corpus import stopwords
from nltk.stem import PorterStemmer
from nltk.tokenize import word_tokenize

# Suppress scikit-learn version mismatch warnings on unpickling
warnings.filterwarnings("ignore", category=UserWarning)

# Ensure NLTK resources are downloaded
try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')

try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

# 1. Define RNN Model Architecture (Matching training)
class RNN(nn.Module):
    def __init__(self, input_size, hidden_size=128, num_layers=1):
        super(RNN, self).__init__()
        self.hidden_size = hidden_size
        self.num_layers = num_layers
        self.rnn = nn.RNN(input_size, hidden_size, num_layers, batch_first=True)
        self.fc = nn.Linear(hidden_size, 1)

    def forward(self, x):
        h0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size)
        out, _ = self.rnn(x, h0)
        out = self.fc(out[:, -1, :])
        return out

_ps = PorterStemmer()
_stop_words = set(stopwords.words("english"))

class _Artifacts:
    model = None
    vectorizer = None

_artifacts = _Artifacts()

def load_artifacts():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(base_dir, "model", "moviemood_rnn.pth")
    vectorizer_path = os.path.join(base_dir, "model", "tfidf_vectorizer.pkl")

    if not os.path.exists(model_path) or not os.path.exists(vectorizer_path):
        raise FileNotFoundError("Model or TF-IDF Vectorizer file missing in backend/model/")

    with open(vectorizer_path, "rb") as f:
        _artifacts.vectorizer = pickle.load(f)

    input_size = len(_artifacts.vectorizer.get_feature_names_out())
    _artifacts.model = RNN(input_size=input_size)
    _artifacts.model.load_state_dict(torch.load(model_path, map_location=torch.device('cpu')))
    _artifacts.model.eval()
    print("PyTorch RNN Model and TF-IDF Vectorizer loaded successfully!")

def clean_text(text: str) -> str:
    text = text.lower()
    text = re.sub(r"http\S+", "", text)
    text = re.sub(r"<.*?>", "", text)
    text = re.sub(r"[^a-zA-Z\s]", "", text)
    words = text.split()
    filtered_words = [w for w in words if w not in _stop_words]
    return " ".join(filtered_words)

def stemming(text: str) -> str:
    tokens = word_tokenize(text)
    stemmed_words = [_ps.stem(token) for token in tokens]
    return " ".join(stemmed_words)

def predict_sentiment(review_text: str):
    if _artifacts.model is None or _artifacts.vectorizer is None:
        load_artifacts()

    # Preprocess
    cleaned = clean_text(review_text)
    stemmed = stemming(cleaned)

    # Vectorize
    vectorized = _artifacts.vectorizer.transform([stemmed]).toarray()
    tensor_input = torch.from_numpy(vectorized).float().unsqueeze(1)

    # Predict
    with torch.inference_mode():
        output = _artifacts.model(tensor_input)
        prob = torch.sigmoid(output.squeeze()).item()

    is_positive = prob >= 0.5
    confidence = prob if is_positive else (1.0 - prob)

    return {
        "review": review_text,
        "sentiment": "Positive" if is_positive else "Negative",
        "confidence_percentage": round(confidence * 100, 2),
        "raw_score": round(prob, 4),
        "processed_tokens": len(stemmed.split())
    }
