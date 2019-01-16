import { isas } from '../../isa';
import { Loader } from './loader';
import { ComplxObjectFileLoader } from './complx';
import { Readable } from 'stream';
import { Memory } from '../mem';

interface Mem extends Memory {
    data: {[n: number]: number};
}

describe('complx loader', () => {
    let mem: Mem;
    let fp: Readable;
    let loader: Loader;

    beforeEach(() => {
        mem = {
            data: {},
            load: (addr: number) =>
                  mem.data.hasOwnProperty(addr)? mem.data[addr] : 0,
            store: (addr: number, val: number) =>
                   mem.data[addr] = val,
        };
        fp = new Readable();
        loader = new ComplxObjectFileLoader();
    });

    describe('load()', () => {
        it('loads trivial object file', () => {
            fp.push(new Uint8Array([
                0x30,0x00,
                0x00,0x01,
                0x13,0x37,
            ]));
            fp.push(null);

            loader.load(isas.lc3, fp, mem);

            expect(mem.data).toEqual({
                0x3000: 0x1337,
            });
        });

        it('loads larger object file', () => {
            fp.push(new Uint8Array([
                0x30,0x00,
                0x00,0x04,
                0x13,0x37,
                0x69,0x69,
                0xde,0xad,
                0xbe,0xef,
            ]));
            fp.push(null);

            loader.load(isas.lc3, fp, mem);

            expect(mem.data).toEqual({
                0x3000: 0x1337,
                0x3001: 0x6969,
                0x3002: 0xdead,
                0x3003: 0xbeef,
            });
        });

        it('loads multiple sections', () => {
            fp.push(new Uint8Array([
                0x30,0x00,
                0x00,0x02,
                0x13,0x37,
                0x69,0x69,

                0x40,0x00,
                0x00,0x03,
                0x04,0x20,
                0xde,0xad,
                0xbe,0xef,
            ]));
            fp.push(null);

            loader.load(isas.lc3, fp, mem);

            expect(mem.data).toEqual({
                0x3000: 0x1337,
                0x3001: 0x6969,
                0x4000: 0x0420,
                0x4001: 0xdead,
                0x4002: 0xbeef,
            });
        });

        it('loads empty section', () => {
            fp.push(new Uint8Array([
                0x40,0x00,
                0x00,0x00,
                0x30,0x00,
                0x00,0x01,
                0x69,0x69,
            ]));
            fp.push(null);

            loader.load(isas.lc3, fp, mem);

            expect(mem.data).toEqual({
                0x3000: 0x6969,
            });
        });

        it('loads flaky stream', () => {
            fp = new Readable({
                objectMode: true,
            });
            fp.push(Buffer.from([0x30]));
            fp.push(Buffer.from([0x00]));
            fp.push(Buffer.from([0x00]));
            fp.push(Buffer.from([0x05]));
            fp.push(Buffer.from([0x13, 0x37]));
            fp.push(Buffer.from([0x69, 0x69, 0x04]));
            fp.push(Buffer.from([0x20]));
            fp.push(Buffer.from([0xde, 0xad, 0xbe]));
            fp.push(Buffer.from([0xef]));
            fp.push(null);

            loader.load(isas.lc3, fp, mem);

            expect(mem.data).toEqual({
                0x3000: 0x1337,
                0x3001: 0x6969,
                0x3002: 0x0420,
                0x3003: 0xdead,
                0x3004: 0xbeef,
            });
        });

        it('errors on too few words', () => {
            fp.push(new Uint8Array([
                0x30,0x00,
                0x00,0x02,
                0x13,0x37,
            ]));
            fp.push(null);

            expect(() => {
                loader.load(isas.lc3, fp, mem);
            }).toThrow('expected 1 more words');
        });

        it('errors on odd number of bytes', () => {
            fp.push(new Uint8Array([
                0x30,0x00,
                0x00,0x01,
                0x13,0x37,
                0x69,
            ]));
            fp.push(null);

            expect(() => {
                loader.load(isas.lc3, fp, mem);
            }).toThrow('not divisible by 2');
        });

        it('errors on malformed object file', () => {
            fp.push(new Uint8Array([
                0x40,0x00,
            ]));
            fp.push(null);

            expect(() => {
                loader.load(isas.lc3, fp, mem);
            }).toThrow('unexpected end-of-file');
        });
    });
});