#!/bin/bash
# Starts backend and frontend dev servers, each in its own terminal window.
# Uses "bash -ic" so ~/.bashrc runs (needed for nvm/npm and uv on PATH).

set -e

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_CMD="cd '$ROOT_DIR/backend' && uv run backend; exec bash"
FRONTEND_CMD="cd '$ROOT_DIR/frontend' && npm run dev; exec bash"

open_terminal() {
  title="$1"
  cmd="$2"

  if command -v gnome-terminal >/dev/null 2>&1; then
    gnome-terminal --title="$title" -- bash -ic "$cmd"
  elif command -v konsole >/dev/null 2>&1; then
    konsole --new-tab -p tabtitle="$title" -e bash -ic "$cmd"
  elif command -v xfce4-terminal >/dev/null 2>&1; then
    xfce4-terminal --title="$title" -e "bash -ic \"$cmd\""
  elif command -v tilix >/dev/null 2>&1; then
    tilix --title="$title" -e bash -ic "$cmd"
  elif command -v alacritty >/dev/null 2>&1; then
    alacritty --title "$title" -e bash -ic "$cmd" &
  elif command -v kitty >/dev/null 2>&1; then
    kitty --title "$title" bash -ic "$cmd" &
  elif command -v x-terminal-emulator >/dev/null 2>&1; then
    x-terminal-emulator -T "$title" -e bash -ic "$cmd"
  elif command -v xterm >/dev/null 2>&1; then
    xterm -T "$title" -e bash -ic "$cmd" &
  else
    echo "No supported terminal emulator found. Please run manually:"
    echo "  $cmd"
    return 1
  fi
}

open_terminal "FaceOff Backend" "$BACKEND_CMD"
open_terminal "FaceOff Frontend" "$FRONTEND_CMD"
