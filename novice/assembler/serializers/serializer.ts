import { Writable } from 'stream';
import { Isa, MachineCodeSection, SymbTable } from '../../isa';

interface Serializer {
    serialize(isa: Isa, code: MachineCodeSection[], fp: Writable): void;
    // default file extension for this format. No leading dot please
    fileExt(): string;

    serializeSymb(symbtable: SymbTable, fp: Writable): void;
    // default file extension for this format. No leading dot please
    symbFileExt(): string;
}

export { Serializer };
