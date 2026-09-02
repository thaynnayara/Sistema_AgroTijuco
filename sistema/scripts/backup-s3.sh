#!/bin/bash
# =============================================================================
# AGROTIJUCO SAAS - AUTOMATED POSTGRESQL BACKUP & AWS S3 UPLOAD SCRIPT
# =============================================================================
set -eo pipefail

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/tmp/agrotijuco_backups"
DB_NAME="${POSTGRES_DB:-agrotijuco_prod}"
DB_USER="${POSTGRES_USER:-agrotijuco_admin}"
DB_HOST="${POSTGRES_HOST:-localhost}"
DB_PORT="${POSTGRES_PORT:-5432}"
S3_BUCKET="${S3_BACKUP_BUCKET:-s3://agrotijuco-backups-production/postgres}"
FILE_NAME="backup_${DB_NAME}_${TIMESTAMP}.sql.gz"

mkdir -p ${BACKUP_DIR}

echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] Starting pg_dump for database: ${DB_NAME}..."

PGPASSWORD="${POSTGRES_PASSWORD}" pg_dump \
  -h "${DB_HOST}" \
  -p "${DB_PORT}" \
  -U "${DB_USER}" \
  -d "${DB_NAME}" \
  -F c \
  -b \
  -v | gzip -9 > "${BACKUP_DIR}/${FILE_NAME}"

echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] Dump generated successfully (${FILE_NAME}). Uploading to S3..."

aws s3 cp "${BACKUP_DIR}/${FILE_NAME}" "${S3_BUCKET}/${FILE_NAME}" \
    --sse aws:kms \
    --storage-class STANDARD_IA

# Remove local backup file
rm -f "${BACKUP_DIR}/${FILE_NAME}"
echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] Backup process completed successfully."
