FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py .

ENV DEFAULT_MODEL=u2net
ENV MAX_UPLOAD_MB=20
ENV PORT=7860

EXPOSE 7860

# Must listen on 0.0.0.0 — required by Hugging Face Spaces
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860"]
