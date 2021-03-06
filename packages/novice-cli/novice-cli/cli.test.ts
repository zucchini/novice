import { Readable, Writable } from 'stream';
import { Buffer } from 'buffer';
import main from './cli';

// Mocks
jest.mock('fs');
import * as fs from 'fs';
jest.mock('novice');
import { AssemblerConfig, getConfig, getParser, Simulator, getIsa, Symbols,
         SymbTable, MachineCodeSection } from 'novice';
jest.mock('./stream-io');
import { StreamIO } from './stream-io';
jest.mock('./stream-assembler');
import { StreamAssembler } from './stream-assembler';
jest.mock('./serializers');
import { Serializer, getSerializer } from './serializers';
jest.mock('./loaders');
import { Loader, getLoader } from './loaders';
jest.mock('./cli-debugger');
import { CliDebugger } from './cli-debugger';

describe('cli', () => {
    let stdin: Readable, stdout: Writable, stderr: Writable;
    let stdinActual: string, stdoutActual: string, stderrActual: string;

    beforeEach(() => {
        stdinActual = stdoutActual = stderrActual = "";
        stdin = new Readable({
            read(n) {
                n = Math.min(n, stdinActual.length);
                if (!n) {
                    return null;
                } else {
                    const res = Buffer.from(stdinActual.slice(0, n));
                    stdinActual = stdinActual.slice(n);
                    return res;
                }
            }
        });
        stdout = new Writable({
            write(str, encoding, callback) {
                stdoutActual += str;
                if (callback) callback();
            }
        });
        stderr = new Writable({
            write(str, encoding, callback) {
                stderrActual += str;
                if (callback) callback();
            }
        });
    });

    afterEach(() => {
        // @ts-ignore
        fs.createReadStream.mockReset();
        // @ts-ignore
        fs.createWriteStream.mockReset();
        // @ts-ignore
        StreamAssembler.mockReset();
        // @ts-ignore
        getConfig.mockReset();
        // @ts-ignore
        getParser.mockReset();
        // @ts-ignore
        getSerializer.mockReset();
    });

    describe('asm subcommand', () => {
        let mockInFp: Readable;
        let mockOutFp: Writable;
        let mockSymbFp: Writable;
        let mockAssemble: (inFp: Readable) => Promise<[SymbTable, MachineCodeSection[]]>;
        let mockAssembleResult: [SymbTable, MachineCodeSection[]];
        let mockConfig: AssemblerConfig;
        let mockSerializer: Serializer;

        beforeEach(() => {
            // @ts-ignore
            mockInFp = {
                // @ts-ignore
                on(event: string, handler: () => void) {
                    if (event === 'open') {
                        handler();
                    }
                }
            };
            // @ts-ignore
            fs.createReadStream.mockReturnValue(mockInFp);

            // @ts-ignore
            mockOutFp = {
                // @ts-ignore
                whoami: 'out',
                cork: () => {},
                uncork: () => {},
                end: () => {},
            };
            // @ts-ignore
            fs.createWriteStream.mockReturnValueOnce(mockOutFp);

            // @ts-ignore
            mockSymbFp = {
                // @ts-ignore
                whoami: 'symb',
                cork: () => {},
                uncork: () => {},
                end: () => {},
            };
            // @ts-ignore
            fs.createWriteStream.mockReturnValueOnce(mockSymbFp);

            // @ts-ignore
            mockAssemble = jest.fn();
            // @ts-ignore
            StreamAssembler.mockImplementation((cfg: AssemblerConfig) => {
                return { assemble: mockAssemble };
            });
            mockAssembleResult = [{daisy: 0x420},
                                  [{startAddr: 0x69, words: [0xdead, 0xbeef]}]];
            // @ts-ignore
            mockAssemble.mockReturnValue(Promise.resolve(mockAssembleResult));

            // @ts-ignore
            mockConfig = {isa: 'daddy', adam: 'friedland'};
            // @ts-ignore
            getConfig.mockReturnValue(mockConfig);

            // @ts-ignore
            mockSerializer = {
                fileExt: () => 'star',
                symbFileExt: () => 'squidward',
                serialize: jest.fn(),
                serializeSymb: jest.fn(),
            };
            // @ts-ignore
            getSerializer.mockReturnValue(mockSerializer);
        });

        it('assembles asm file', () => {
            return main(['asm', '-c', 'bread', 'patrick.asm'],
                        stdin, stdout, stderr).then(exitCode => {
                expect(stderrActual).toEqual('');
                expect(stdoutActual).toEqual('');
                expect(exitCode).toEqual(0);

                // @ts-ignore
                expect(fs.createReadStream.mock.calls).toEqual([['patrick.asm']]);
                // @ts-ignore
                expect(fs.createWriteStream.mock.calls).toEqual([['patrick.star'], ['patrick.squidward']]);
                // @ts-ignore
                expect(getConfig.mock.calls).toEqual([['bread']]);
                // @ts-ignore
                expect(getSerializer.mock.calls).toEqual([['bread']]);
                // @ts-ignore
                expect(StreamAssembler.mock.calls).toEqual([[mockConfig]]);
                // @ts-ignore
                expect(mockAssemble.mock.calls).toEqual([[mockInFp]]);
                // @ts-ignore
                expect(mockSerializer.serialize.mock.calls).toEqual([[mockConfig.isa, mockAssembleResult[1], mockOutFp]]);
                // @ts-ignore
                expect(mockSerializer.serializeSymb.mock.calls).toEqual([[mockAssembleResult[0], mockSymbFp]]);
            });
        });

        it('assembles asm file without extension', () => {
            return main(['asm', '-c', 'bread', 'chickenworld'],
                        stdin, stdout, stderr).then(exitCode => {
                expect(stderrActual).toEqual('');
                expect(stdoutActual).toEqual('');
                expect(exitCode).toEqual(0);

                // @ts-ignore
                expect(fs.createReadStream.mock.calls).toEqual([['chickenworld']]);
                // @ts-ignore
                expect(fs.createWriteStream.mock.calls).toEqual([['chickenworld.star'], ['chickenworld.squidward']]);
                // @ts-ignore
                expect(getConfig.mock.calls).toEqual([['bread']]);
                // @ts-ignore
                expect(getSerializer.mock.calls).toEqual([['bread']]);
                // @ts-ignore
                expect(StreamAssembler.mock.calls).toEqual([[mockConfig]]);
                // @ts-ignore
                expect(mockAssemble.mock.calls).toEqual([[mockInFp]]);
                // @ts-ignore
                expect(mockSerializer.serialize.mock.calls).toEqual([[mockConfig.isa, mockAssembleResult[1], mockOutFp]]);
                // @ts-ignore
                expect(mockSerializer.serializeSymb.mock.calls).toEqual([[mockAssembleResult[0], mockSymbFp]]);
            });
        });

        it('assembles asm file with period in earlier path components', () => {
            return main(['asm', '-c', 'bread', '/home/travis.adams/chickenworld'],
                        stdin, stdout, stderr).then(exitCode => {
                expect(stderrActual).toEqual('');
                expect(stdoutActual).toEqual('');
                expect(exitCode).toEqual(0);

                // @ts-ignore
                expect(fs.createReadStream.mock.calls).toEqual([['/home/travis.adams/chickenworld']]);
                // @ts-ignore
                expect(fs.createWriteStream.mock.calls).toEqual([['/home/travis.adams/chickenworld.star'], ['/home/travis.adams/chickenworld.squidward']]);
                // @ts-ignore
                expect(getConfig.mock.calls).toEqual([['bread']]);
                // @ts-ignore
                expect(getSerializer.mock.calls).toEqual([['bread']]);
                // @ts-ignore
                expect(StreamAssembler.mock.calls).toEqual([[mockConfig]]);
                // @ts-ignore
                expect(mockSerializer.serialize.mock.calls).toEqual([[mockConfig.isa, mockAssembleResult[1], mockOutFp]]);
                // @ts-ignore
                expect(mockSerializer.serializeSymb.mock.calls).toEqual([[mockAssembleResult[0], mockSymbFp]]);
            });
        });

        it('assembles asm file with hardcoded out path', () => {
            return main(['asm', '-c', 'bread', 'chickenworld.asm', '-o', 'jeff'],
                        stdin, stdout, stderr).then(exitCode => {
                expect(stderrActual).toEqual('');
                expect(stdoutActual).toEqual('');
                expect(exitCode).toEqual(0);

                // @ts-ignore
                expect(fs.createReadStream.mock.calls).toEqual([['chickenworld.asm']]);
                // @ts-ignore
                expect(fs.createWriteStream.mock.calls).toEqual([['jeff'], ['jeff.squidward']]);
                // @ts-ignore
                expect(getConfig.mock.calls).toEqual([['bread']]);
                // @ts-ignore
                expect(getSerializer.mock.calls).toEqual([['bread']]);
                // @ts-ignore
                expect(StreamAssembler.mock.calls).toEqual([[mockConfig]]);
                // @ts-ignore
                expect(mockSerializer.serialize.mock.calls).toEqual([[mockConfig.isa, mockAssembleResult[1], mockOutFp]]);
                // @ts-ignore
                expect(mockSerializer.serializeSymb.mock.calls).toEqual([[mockAssembleResult[0], mockSymbFp]]);
            });
        });

        it('assembles asm file with lc3 config by default', () => {
            return main(['asm', 'chickenworld.asm'],
                        stdin, stdout, stderr).then(exitCode => {
                expect(stderrActual).toEqual('');
                expect(stdoutActual).toEqual('');
                expect(exitCode).toEqual(0);

                // @ts-ignore
                expect(fs.createReadStream.mock.calls).toEqual([['chickenworld.asm']]);
                // @ts-ignore
                expect(fs.createWriteStream.mock.calls).toEqual([['chickenworld.star'], ['chickenworld.squidward']]);
                // @ts-ignore
                expect(getConfig.mock.calls).toEqual([['lc3']]);
                // @ts-ignore
                expect(getSerializer.mock.calls).toEqual([['lc3']]);
                // @ts-ignore
                expect(StreamAssembler.mock.calls).toEqual([[mockConfig]]);
                // @ts-ignore
                expect(mockSerializer.serialize.mock.calls).toEqual([[mockConfig.isa, mockAssembleResult[1], mockOutFp]]);
                // @ts-ignore
                expect(mockSerializer.serializeSymb.mock.calls).toEqual([[mockAssembleResult[0], mockSymbFp]]);
            });
        });

        it('assembles asm file with custom serializer', () => {
            mockSerializer.fileExt = () => 'tl6';
            mockSerializer.symbFileExt = () => 'anime';

            return main(['asm', 'chickenworld.asm', '-f', 'honker'],
                        stdin, stdout, stderr).then(exitCode => {
                expect(stderrActual).toEqual('');
                expect(stdoutActual).toEqual('');
                expect(exitCode).toEqual(0);

                // @ts-ignore
                expect(fs.createReadStream.mock.calls).toEqual([['chickenworld.asm']]);
                // @ts-ignore
                expect(fs.createWriteStream.mock.calls).toEqual([['chickenworld.tl6'], ['chickenworld.anime']]);
                // @ts-ignore
                expect(getConfig.mock.calls).toEqual([['lc3']]);
                // @ts-ignore
                expect(getSerializer.mock.calls).toEqual([['honker']]);
                // @ts-ignore
                expect(StreamAssembler.mock.calls).toEqual([[mockConfig]]);
                // @ts-ignore
                expect(mockSerializer.serialize.mock.calls).toEqual([[mockConfig.isa, mockAssembleResult[1], mockOutFp]]);
                // @ts-ignore
                expect(mockSerializer.serializeSymb.mock.calls).toEqual([[mockAssembleResult[0], mockSymbFp]]);
            });
        });

        it('handles nonexistent file', () => {
            // @ts-ignore
            mockInFp.on = (event: string, handler: (reason: any) => void) => {
                if (event === 'error') {
                    handler(new Error('wow bad'));
                }
            };

            return main(['asm', 'sanjay.asm'],
                        stdin, stdout, stderr).then(exitCode => {
                // @ts-ignore
                expect(fs.createReadStream.mock.calls).toEqual([['sanjay.asm']]);

                expect(exitCode).toEqual(1);
                expect(stdoutActual).toEqual('');
                expect(stderrActual).toContain('wow bad');
            });
        });
    });

    describe('simulation', () => {
        let mockLoader: Loader;
        let mockFp: Readable;
        let mockAsm: StreamAssembler;
        // @ts-ignore
        let mockCfg: AssemblerConfig = {isa: {peter: 'pan'}, joe: 'biden'};
        let mockSymbTable: SymbTable = {nice: 0x69};
        let mockSections: MachineCodeSection[] = [
            {startAddr: 0x420, words: [0xdead, 0xbeef]},
        ];

        beforeAll(() => {
            mockLoader = {
                load: jest.fn(),
                fileExt: () => 'obj',
                symbFileExt: () => 'lemonade',
                loadSymb: jest.fn(),
            };

            // @ts-ignore
            mockFp = {
                iam: 'fp',
                // @ts-ignore
                on(ev, cb) {
                    if (ev === 'open') cb();
                }
            };
        });

        beforeEach(() => {
            // @ts-ignore
            getConfig.mockReturnValue(mockCfg);
            // @ts-ignore
            getLoader.mockReturnValue(mockLoader);
            // @ts-ignore
            StreamAssembler.mockImplementation(() => mockAsm);
            // @ts-ignore
            mockAsm.assemble.mockReturnValue(
                Promise.resolve([mockSymbTable, mockSections]));
            // @ts-ignore
            fs.createReadStream.mockReturnValue(mockFp);
        });

        afterEach(() => {
            // @ts-ignore
            getConfig.mockReset();
            // @ts-ignore
            getLoader.mockReset();
            // @ts-ignore
            StreamAssembler.mockReset();
            // @ts-ignore
            fs.createReadStream.mockReset();
            // @ts-ignore
            mockLoader.load.mockReset();
            // @ts-ignore
            mockLoader.loadSymb.mockReset();
        });

        describe('sim subcommand', () => {
            let mockStdin: Readable;
            let mockIo: StreamIO;
            let mockSim: Simulator;

            beforeAll(() => {
                // @ts-ignore
                mockAsm = {
                    assemble: jest.fn(),
                };
                // @ts-ignore
                mockStdin = {
                    iam: 'stdin',
                    // @ts-ignore
                    on(ev, cb) {
                        if (ev === 'open') cb();
                    }
                };
                // @ts-ignore
                mockIo = {timothy: 'aveni'};
                // @ts-ignore
                mockSim = {
                    loadSections: jest.fn(),
                    run: jest.fn(),
                };
            });

            beforeEach(() => {
                // @ts-ignore
                StreamIO.mockImplementation(() => mockIo);
                // @ts-ignore
                Simulator.mockImplementation(() => mockSim);
            });

            afterEach(() => {
                // @ts-ignore
                mockAsm.assemble.mockReset();
                // @ts-ignore
                StreamIO.mockReset();
                // @ts-ignore
                Simulator.mockReset();
                // @ts-ignore
                mockSim.loadSections.mockReset();
                // @ts-ignore
                mockSim.run.mockReset();
            });

            it('simulates object file', () => {
                return main(['sim', '-l', 'banana', 'farzam.obj'],
                            mockStdin, stdout, stderr).then(exitCode => {
                    expect(stdoutActual).toEqual('');
                    expect(stderrActual).toEqual('');
                    expect(exitCode).toEqual(0);

                    // @ts-ignore
                    expect(fs.createReadStream.mock.calls).toEqual([['farzam.obj']]);
                    // @ts-ignore
                    expect(getConfig.mock.calls).toEqual([['lc3']]);
                    // @ts-ignore
                    expect(getLoader.mock.calls).toEqual([['banana']]);
                    // @ts-ignore
                    expect(StreamAssembler.mock.calls).toEqual([]);
                    // @ts-ignore
                    expect(mockLoader.load.mock.calls).toEqual([[mockCfg.isa, mockFp, mockSim]]);
                    // @ts-ignore
                    expect(mockLoader.loadSymb.mock.calls).toEqual([]);
                    // @ts-ignore
                    expect(mockSim.loadSections.mock.calls).toEqual([]);
                    // @ts-ignore
                    expect(StreamIO.mock.calls).toEqual([[mockStdin, stdout]]);
                    // @ts-ignore
                    expect(Simulator.mock.calls).toEqual([[mockCfg.isa, mockIo, 8192]]);
                    // @ts-ignore
                    expect(mockSim.run.mock.calls).toEqual([[]]);
                });
            });

            it('simulates object file with diff max exec', () => {
                return main(['sim', '-l', 'dinkleberg', '-x', '69', 'persia.obj'],
                            mockStdin, stdout, stderr).then(exitCode => {
                    expect(stdoutActual).toEqual('');
                    expect(stderrActual).toEqual('');
                    expect(exitCode).toEqual(0);

                    // @ts-ignore
                    expect(getConfig.mock.calls).toEqual([['lc3']]);
                    // @ts-ignore
                    expect(getLoader.mock.calls).toEqual([['dinkleberg']]);
                    // @ts-ignore
                    expect(fs.createReadStream.mock.calls).toEqual([['persia.obj']]);
                    // @ts-ignore
                    expect(StreamAssembler.mock.calls).toEqual([]);
                    // @ts-ignore
                    expect(mockLoader.load.mock.calls).toEqual([[mockCfg.isa, mockFp, mockSim]]);
                    // @ts-ignore
                    expect(mockLoader.loadSymb.mock.calls).toEqual([]);
                    // @ts-ignore
                    expect(mockSim.loadSections.mock.calls).toEqual([]);
                    // @ts-ignore
                    expect(StreamIO.mock.calls).toEqual([[mockStdin, stdout]]);
                    // @ts-ignore
                    expect(Simulator.mock.calls).toEqual([[mockCfg.isa, mockIo, 69]]);
                    // @ts-ignore
                    expect(mockSim.run.mock.calls).toEqual([[]]);
                });
            });

            it('assembles and simulates assembly file', () => {
                return main(['sim', 'marley.s'],
                            mockStdin, stdout, stderr).then(exitCode => {
                    expect(stdoutActual).toEqual('');
                    expect(stderrActual).toEqual('');
                    expect(exitCode).toEqual(0);

                    // @ts-ignore
                    expect(getConfig.mock.calls).toEqual([['lc3']]);
                    // @ts-ignore
                    expect(getLoader.mock.calls).toEqual([]);
                    // @ts-ignore
                    expect(fs.createReadStream.mock.calls).toEqual([['marley.s']]);
                    // @ts-ignore
                    expect(StreamAssembler.mock.calls).toEqual([[mockCfg]]);
                    // @ts-ignore
                    expect(mockLoader.load.mock.calls).toEqual([]);
                    // @ts-ignore
                    expect(mockLoader.loadSymb.mock.calls).toEqual([]);
                    // @ts-ignore
                    expect(mockSim.loadSections.mock.calls).toEqual([[mockSections]]);
                    // @ts-ignore
                    expect(StreamIO.mock.calls).toEqual([[mockStdin, stdout]]);
                    // @ts-ignore
                    expect(Simulator.mock.calls).toEqual([[mockCfg.isa, mockIo, 8192]]);
                    // @ts-ignore
                    expect(mockSim.run.mock.calls).toEqual([[]]);
                });
            });

            it('handles nonexistent object file', () => {
                // @ts-ignore
                fs.createReadStream.mockReset();
                // @ts-ignore
                fs.createReadStream.mockReturnValue({
                    // @ts-ignore
                    on(ev, cb) {
                        if (ev === 'error') cb(new Error('oopsie daisy doodle'));
                    }
                });

                return main(['sim', 'margaret.obj'],
                            mockStdin, stdout, stderr).then(exitCode => {
                    // @ts-ignore
                    expect(fs.createReadStream.mock.calls).toEqual([['margaret.obj']]);
                    // @ts-ignore
                    expect(mockSim.run.mock.calls).toEqual([]);

                    expect(exitCode).toEqual(1);
                    expect(stdoutActual).toEqual('');
                    expect(stderrActual).toMatch('oopsie daisy doodle');
                });
            });
        });

        describe('dbg subcommand', () => {
            let mockDbg: CliDebugger;
            let mockSymbols: Symbols;

            beforeAll(() => {
                // @ts-ignore
                mockSymbols = {
                    setSymbols: jest.fn();
                };

                // @ts-ignore
                mockDbg = {
                    loadSections: jest.fn(),
                    getSymbols: jest.fn(),
                    start: jest.fn(),
                    close: jest.fn(),
                };
            });

            beforeEach(() => {
                // @ts-ignore
                CliDebugger.mockImplementation(() => mockDbg);
                // @ts-ignore
                mockDbg.getSymbols.mockReturnValue(mockSymbols);
            });

            afterEach(() => {
                // @ts-ignore
                CliDebugger.mockReset();
                // @ts-ignore
                mockDbg.loadSections.mockReset();
                // @ts-ignore
                mockDbg.getSymbols.mockReset();
                // @ts-ignore
                mockDbg.start.mockReset();
                // @ts-ignore
                mockDbg.close.mockReset();
                // @ts-ignore
                mockSymbols.setSymbols.mockReset();
            });

            it('assembles and launches debugger on assembly code', () => {
                return main(['dbg', '-c', 'kaboom', 'asdf.becker'],
                            stdin, stdout, stderr).then(exitCode => {
                    expect(stdoutActual).toEqual('');
                    expect(stderrActual).toEqual('');
                    expect(exitCode).toEqual(0);

                    // @ts-ignore
                    expect(getConfig.mock.calls).toEqual([['kaboom']]);
                    // @ts-ignore
                    expect(getLoader.mock.calls).toEqual([]);
                    // @ts-ignore
                    expect(fs.createReadStream.mock.calls).toEqual([['asdf.becker']]);
                    // @ts-ignore
                    expect(mockLoader.load.mock.calls).toEqual([]);
                    // @ts-ignore
                    expect(mockLoader.loadSymb.mock.calls).toEqual([]);
                    // @ts-ignore
                    expect(StreamAssembler.mock.calls).toEqual([[mockCfg]]);
                    // @ts-ignore
                    expect(mockDbg.loadSections.mock.calls).toEqual([[mockSections]]);
                    // @ts-ignore
                    expect(CliDebugger.mock.calls).toEqual([[mockCfg.isa, stdin, stdout]]);
                    // @ts-ignore
                    expect(mockDbg.getSymbols.mock.calls).toEqual([[]]);
                    // @ts-ignore
                    expect(mockSymbols.setSymbols.mock.calls).toEqual([[mockSymbTable]]);
                    // @ts-ignore
                    expect(mockDbg.start.mock.calls).toEqual([[]]);
                    // @ts-ignore
                    expect(mockDbg.close.mock.calls).toEqual([[]]);
                });
            });

            it('launches debugger with debug symbols', () => {
                return main(['dbg', '-l', 'bharat', 'brickell.obj'],
                            stdin, stdout, stderr).then(exitCode => {
                    expect(stdoutActual).toEqual('');
                    expect(stderrActual).toEqual('');
                    expect(exitCode).toEqual(0);

                    // @ts-ignore
                    expect(getConfig.mock.calls).toEqual([['lc3']]);
                    // @ts-ignore
                    expect(getLoader.mock.calls).toEqual([['bharat']]);
                    // @ts-ignore
                    expect(fs.createReadStream.mock.calls).toEqual([['brickell.obj'], ['brickell.lemonade']]);
                    // @ts-ignore
                    expect(mockDbg.getSymbols.mock.calls).toEqual([[]]);
                    // @ts-ignore
                    expect(mockLoader.load.mock.calls).toEqual([[mockCfg.isa, mockFp, mockDbg]]);
                    // @ts-ignore
                    expect(mockLoader.loadSymb.mock.calls).toEqual([[mockFp, mockSymbols]]);
                    // @ts-ignore
                    expect(StreamAssembler.mock.calls).toEqual([]);
                    // @ts-ignore
                    expect(mockDbg.loadSections.mock.calls).toEqual([]);
                    // @ts-ignore
                    expect(CliDebugger.mock.calls).toEqual([[mockCfg.isa, stdin, stdout]]);
                    // @ts-ignore
                    expect(mockDbg.start.mock.calls).toEqual([[]]);
                    // @ts-ignore
                    expect(mockDbg.close.mock.calls).toEqual([[]]);
                });
            });

            it('launches debugger without debug symbols', () => {
                // @ts-ignore
                fs.createReadStream.mockReset();
                // @ts-ignore
                fs.createReadStream.mockReturnValueOnce(mockFp);
                // @ts-ignore
                fs.createReadStream.mockReturnValueOnce({
                    // @ts-ignore
                    on(ev, cb) {
                        if (ev === 'error') cb(new Error('ENOENT'));
                    }
                });

                return main(['dbg', '-l', 'riazati', 'brickell.obj'],
                            stdin, stdout, stderr).then(exitCode => {
                    expect(stdoutActual).toEqual('');
                    expect(stderrActual).toMatch(/warning:.*ENOENT/);
                    expect(exitCode).toEqual(0);

                    // @ts-ignore
                    expect(getConfig.mock.calls).toEqual([['lc3']]);
                    // @ts-ignore
                    expect(getLoader.mock.calls).toEqual([['riazati']]);
                    // @ts-ignore
                    expect(fs.createReadStream.mock.calls).toEqual([['brickell.obj'], ['brickell.lemonade']]);
                    // @ts-ignore
                    expect(mockLoader.load.mock.calls).toEqual([[mockCfg.isa, mockFp, mockDbg]]);
                    // @ts-ignore
                    expect(mockLoader.loadSymb.mock.calls).toEqual([]);
                    // @ts-ignore
                    expect(StreamAssembler.mock.calls).toEqual([]);
                    // @ts-ignore
                    expect(mockDbg.loadSections.mock.calls).toEqual([]);
                    // @ts-ignore
                    expect(CliDebugger.mock.calls).toEqual([[mockCfg.isa, stdin, stdout]]);
                    // @ts-ignore
                    expect(mockDbg.start.mock.calls).toEqual([[]]);
                    // @ts-ignore
                    expect(mockDbg.close.mock.calls).toEqual([[]]);
                });
            });

            it('handles setup error', () => {
                // @ts-ignore
                fs.createReadStream.mockReset();
                // @ts-ignore
                fs.createReadStream.mockReturnValue({
                    // @ts-ignore
                    on(ev, cb) {
                        if (ev === 'error') cb(new Error('oops i did it again'));
                    }
                });

                return main(['dbg', 'brickell.obj'],
                            stdin, stdout, stderr).then(exitCode => {
                    expect(stdoutActual).toEqual('');
                    expect(stderrActual).toMatch(/setup error.+oops i did it again/);
                    expect(exitCode).toEqual(1);

                    // @ts-ignore
                    expect(fs.createReadStream.mock.calls).toEqual([['brickell.obj']]);
                    // @ts-ignore
                    expect(CliDebugger.mock.calls).toEqual([]);
                });
            });

            it('handles simulator error', () => {
                // @ts-ignore
                mockDbg.start.mockReset();
                // @ts-ignore
                mockDbg.start.mockImplementation(() => {
                    throw new Error('unexpected end-of-file');
                });

                return main(['dbg', 'daisy.genius'],
                            stdin, stdout, stderr).then(exitCode => {
                    expect(stdoutActual).toEqual('');
                    expect(stderrActual).toMatch('error: unexpected end-of-file');
                    expect(exitCode).toEqual(1);

                    // @ts-ignore
                    expect(getConfig.mock.calls).toEqual([['lc3']]);
                    // @ts-ignore
                    expect(getLoader.mock.calls).toEqual([]);
                    // @ts-ignore
                    expect(fs.createReadStream.mock.calls).toEqual([['daisy.genius']]);
                    // @ts-ignore
                    expect(mockLoader.load.mock.calls).toEqual([]);
                    // @ts-ignore
                    expect(mockLoader.loadSymb.mock.calls).toEqual([]);
                    // @ts-ignore
                    expect(StreamAssembler.mock.calls).toEqual([[mockCfg]]);
                    // @ts-ignore
                    expect(mockDbg.loadSections.mock.calls).toEqual([[mockSections]]);
                    // @ts-ignore
                    expect(CliDebugger.mock.calls).toEqual([[mockCfg.isa, stdin, stdout]]);
                    // @ts-ignore
                    expect(mockDbg.start.mock.calls).toEqual([[]]);
                    // @ts-ignore
                    expect(mockDbg.close.mock.calls).toEqual([[]]);
                });
            });
        });
    });

    describe('tablegen subcommand', () => {
        it('generates table', () => {
            const json = {massive: 'banana'};
            const mockGenTable = jest.fn(() => json);
            // @ts-ignore
            const mockParser: Parser = {genTable: mockGenTable};

            // @ts-ignore
            getParser.mockReturnValue(mockParser);

            return main(['tablegen', 'farzam'],
                        stdin, stdout, stderr).then(exitCode => {
                // @ts-ignore
                expect(getParser.mock.calls).toEqual([['farzam', getIsa('dummy')]]);
                expect(mockGenTable.mock.calls).toEqual([[]]);

                expect(exitCode).toEqual(0);
                expect(stdoutActual).toEqual(JSON.stringify(json));
                expect(stderrActual).toEqual('');
            });
        });

        it('handles invalid parsers', () => {
            // @ts-ignore
            getParser.mockImplementation(() => {throw new Error('excuse me son')});

            return main(['tablegen', 'gucci'],
                        stdin, stdout, stderr).then(exitCode => {
                // @ts-ignore
                expect(getParser.mock.calls).toEqual([['gucci', getIsa('dummy')]]);

                expect(exitCode).toEqual(1);
                expect(stdoutActual).toEqual('');
                expect(stderrActual).toContain('excuse me son');
            });
        });

        it('handles conflicts', () => {
            const mockGenTable = jest.fn(() => {throw new Error('big bad conflict!')});
            // @ts-ignore
            const mockParser: Parser = {genTable: mockGenTable};

            // @ts-ignore
            getParser.mockReturnValue(mockParser);

            return main(['tablegen', 'guwop'],
                        stdin, stdout, stderr).then(exitCode => {
                // @ts-ignore
                expect(getParser.mock.calls).toEqual([['guwop', getIsa('dummy')]]);

                expect(exitCode).toEqual(1);
                expect(stdoutActual).toEqual('');
                expect(stderrActual).toContain('big bad conflict!');
            });
        });
    });
});
