from decouple import config
from functools import lru_cache
from langchain_groq import ChatGroq

@lru_cache(maxsize=None)
def get_llm():
    GROQ_API_KEY = config("GROQ_API_KEY")
    return ChatGroq(temperature=0, groq_api_key=GROQ_API_KEY, model_name="llama3-70b-8192")

LLM = get_llm()