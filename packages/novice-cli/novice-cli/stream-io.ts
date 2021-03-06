import { Readable, Writable } from 'stream';

class StreamIO {
    private stdin: Readable;
    private stdout: Writable;

    public constructor(stdin: Readable, stdout: Writable) {
        this.stdin = stdin;
        this.stdout = stdout;
    }

    public async getc(): Promise<number> {
        const buf = this.stdin.read(1);

        // The in trap provides no way to handle EOFs
        if (!buf) {
            throw new Error('unexpected EOF on stdin');
        }

        return buf[0];
    }

    public putc(c: number): void {
        this.stdout.write(new Uint8Array([c]));
    }
}

export { StreamIO };
