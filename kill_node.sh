#!/bin/bash
pids=$(ps aux | grep node | grep -v grep | awk '{print $2}')
if [ -z "$pids" ]; then
  echo "No node processes found."
else
  echo $pids | xargs kill -9
  echo "Node processes killed."
fi
