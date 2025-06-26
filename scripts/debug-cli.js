#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cliPath = path.join(__dirname, '../dist/index.js');

console.log('Testing CLI at:', cliPath);
console.log('Current directory:', process.cwd());

// Test with --help
const child = spawn('node', [cliPath, '--help'], {
  stdio: 'inherit',
  cwd: process.cwd()
});

child.on('error', (error) => {
  console.error('Failed to start CLI:', error);
});

child.on('exit', (code) => {
  console.log('CLI exited with code:', code);
});