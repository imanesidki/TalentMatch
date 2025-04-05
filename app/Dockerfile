FROM python:3.11-slim

WORKDIR /app

# Copy requirements file
COPY requirements.txt .

# Install Python dependencies with pip
RUN pip install --no-cache-dir -r requirements.txt 

RUN python -m spacy download en_core_web_sm

# Copy application code
COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]