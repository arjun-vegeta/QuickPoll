#!/usr/bin/env bash
# exit on error
set -o errexit

pip install -r requirements.txt

# Run database migrations
python create_tables.py
python add_category_migration.py
python add_comments_table.py
