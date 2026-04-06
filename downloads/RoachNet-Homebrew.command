#!/bin/zsh
set -euo pipefail

clear
echo "RoachNet Homebrew install"
echo

if ! command -v brew >/dev/null 2>&1; then
  echo "Homebrew is not installed yet."
  echo "Running the official Homebrew installer from brew.sh ..."
  echo
  NONINTERACTIVE=1 /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  if [ -x /opt/homebrew/bin/brew ]; then
    eval "$(/opt/homebrew/bin/brew shellenv)"
  elif [ -x /usr/local/bin/brew ]; then
    eval "$(/usr/local/bin/brew shellenv)"
  fi
fi

if ! command -v brew >/dev/null 2>&1; then
  echo "Homebrew still is not available."
  echo "Install Homebrew from https://brew.sh and rerun this helper."
  echo
  read -r "?Press Return to close..."
  exit 1
fi

brew tap AHGRoach/roachnet

if brew list --cask roachnet >/dev/null 2>&1; then
  brew reinstall --cask roachnet
else
  brew install --cask roachnet
fi

open "$HOME/RoachNet/app/RoachNet.app"

echo
echo "RoachNet is installed in $HOME/RoachNet/app/RoachNet.app"
echo
read -r "?Press Return to close..."
