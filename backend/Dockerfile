FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

RUN adduser --disabled-password --gecos "" appuser

COPY backend/requirements.txt /tmp/backend-requirements.txt
RUN pip install --upgrade pip && pip install -r /tmp/backend-requirements.txt

COPY . /app

RUN chmod +x /app/backend/entrypoint.sh && chown -R appuser:appuser /app

USER appuser
WORKDIR /app/backend

EXPOSE 8000

ENTRYPOINT ["/app/backend/entrypoint.sh"]
