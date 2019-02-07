#!/bin/bash
set -e

[[ $# -eq 1 ]] || {
    printf 'usage: %s <parser>\n' "$0"
    printf '\n'
    printf 'will generate an LR(1) parse table for parser.ts\n'
    exit 1
} >&2

parser=$1

[[ -f novice/assembler/parsers/$parser.ts ]] || {
    printf "error: unknown parser \`%s', sorry bud\n" "$parser" >&2
    exit 1
}

{
    printf '/* tslint:disable */\n'
    printf '// WARNING: GENERATED CODE by generate-parse-table.sh\n'
    printf "import { ParseTable } from '../../lr1';\n"
    printf "import { NT, T } from '../grammars/%s';\n" "$parser"
    printf 'const table: ParseTable<NT, T> = '
    node novice/main.js tablegen "$parser"
    printf ';\n'
    printf 'export default table;\n'
} >"novice/assembler/parsers/tables/$parser.ts"