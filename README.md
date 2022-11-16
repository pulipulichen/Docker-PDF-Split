# Docker-PDF-Split
Split a PDF file with configuration.

# Environment

- Docker and docker-compose: https://docs.docker.com/compose/install/
- Node.js: https://nodejs.org/en/download/
# How to use

1. Prepare `data/config.csv` and `data/input.pdf`. You can find examples in `data/demo`. Please setup each filename and page range you want to split from `input.pdf` in `config.csv`.
2. Excute `npm run d1.start`.
3. Get output files in `data/output` .