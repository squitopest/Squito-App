#!/bin/sh
# Xcode Cloud post-clone script
# Installs Node/npm and runs the proper Capacitor iOS static build

cd $CI_WORKSPACE
brew install node
npm install
node scripts/build-ios.js
