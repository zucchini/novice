#!/usr/bin/env node

import main from './cli';

main(process.argv.slice(2), process.stdin, process.stdout, process.stderr)
    .then(exitCode => process.exitCode = exitCode);
