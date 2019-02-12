#!/bin/bash

wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
dpkg -x google-chrome-stable_current_amd64.deb /tmp/dir
pnpm i
rm $0
