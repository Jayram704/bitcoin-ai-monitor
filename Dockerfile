FROM python:3.11-slim

WORKDIR /app

# Ensure standard bin paths are in PATH
ENV PATH="/root/.local/bin:/usr/local/bin:${PATH}"
ENV PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
# Install wheel and explicitly install uvicorn
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir uvicorn[standard] fastapi && \
    pip install --no-cache-dir -r requirements.txt

# Copy source code and files
COPY . .

EXPOSE 8000

# Use `python -m uvicorn` instead of bare `uvicorn`
CMD ["python", "-m", "uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"]