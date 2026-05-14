#!/usr/bin/env bash
# Convenience dev script. The production stack is Supabase + frontend only.
set -e
cd frontend
npm install
npm run dev
