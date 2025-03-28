FROM continuumio/miniconda3:latest

WORKDIR /app

# Create conda environment
RUN conda create -n myenv python=3.11 -y
SHELL ["/bin/bash", "-c"]

# Activate conda environment and install dependencies
ENV PATH /opt/conda/envs/myenv/bin:$PATH
ENV CONDA_DEFAULT_ENV myenv

# Install spacy and its dependencies using conda
RUN conda install -c conda-forge spacy -y && \
    conda run -n myenv python -m spacy download en_core_web_sm

# Copy requirements file
COPY requirements.txt .

# Remove spacy from requirements since we installed it with conda
RUN grep -v "^spacy" requirements.txt > requirements_no_spacy.txt && \
    conda run -n myenv pip install --no-cache-dir -r requirements_no_spacy.txt

# Copy application code
COPY . .

CMD ["conda", "run", "-n", "myenv", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]