from decouple import config
from functools import lru_cache
import spacy
from spacy.matcher import Matcher
from langchain_groq import ChatGroq

@lru_cache(maxsize=None)
def get_nlp_model():
    print("Loading NLP model...")
    return spacy.load('en_core_web_sm')

@lru_cache(maxsize=None)
def get_matcher():
    nlp = get_nlp_model()
    print("Initializing matcher...")
    return Matcher(nlp.vocab)

@lru_cache(maxsize=None)
def get_llm():
    print("Initializing LLM client...")
    GROQ_API_KEY = config("GROQ_API_KEY")
    return ChatGroq(temperature=0, groq_api_key=GROQ_API_KEY, model_name="llama3-70b-8192")


NLP = get_nlp_model() 
MATCHER = get_matcher()
LLM = get_llm()