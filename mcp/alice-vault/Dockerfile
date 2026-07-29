FROM python:3.12-slim
RUN pip install --no-cache-dir "mcp>=2,<3"
WORKDIR /app
COPY server.py fixtures.json ./
EXPOSE 9020
CMD ["python", "server.py"]
