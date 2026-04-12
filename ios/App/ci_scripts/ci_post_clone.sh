#!/bin/sh
cd $CI_WORKSPACE
brew install node
npm install
npx cap sync
