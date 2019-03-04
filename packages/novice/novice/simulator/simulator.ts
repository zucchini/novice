import { Fields, FullMachineState, InstructionSpec, IO, Isa,
         MachineCodeSection, MachineStateLogEntry, MachineStateUpdate, Reg,
         RegIdentifier } from '../isa';
import { forceUnsigned, maskTo, sextTo } from '../util';
import { Memory } from './mem';

class InstrLut {
    private isa: Isa;
    private lookupBits: number;
    // spec, mask, val, #bits
    private lut: [InstructionSpec, number, number, number][][];

    public constructor(isa: Isa, lookupBits: number) {
        this.isa = isa;
        this.lookupBits = Math.min(isa.spec.pc.instrBits, lookupBits);
        this.lut = this.genLut(lookupBits);
    }

    public lookup(ir: number): [InstructionSpec, number, number, number][] {
        const idx = maskTo(ir >> (this.isa.spec.pc.instrBits - this.lookupBits),
                           this.lookupBits);

        return this.lut[idx];
    }

    private genLut(lookupBits: number) {
        const lut: [InstructionSpec, number, number, number][][] = [];

        for (let i = 0; i < Math.pow(2, lookupBits); i++) {
            lut.push([]);
        }

        for (const instr of this.isa.spec.instructions) {
            let mask = 0;
            let val = 0;
            let totalBits = 0;
            let firstNBits = [0];

            // Sort them so fields are in the right order
            const fields = instr.fields.slice(0).sort(
                (left, right) => right.bits[0] - left.bits[0]);

            for (const field of fields) {
                const numBits = field.bits[0] - field.bits[1] + 1;
                const needBits = this.lookupBits -
                                 (this.isa.spec.pc.instrBits - field.bits[0] - 1);
                // Take the most significant X bits from this field
                const whichBits = Math.min(numBits, needBits);

                if (field.kind === 'const') {
                    if (whichBits > 0) {
                        // thinkin bout thos bits
                        const thosBits = field.val >> (numBits - whichBits);
                        firstNBits = firstNBits.map(bits => (bits << whichBits) | thosBits);
                    }

                    const babymask = maskTo(-1, numBits);
                    mask |= babymask << field.bits[1];
                    val |= (field.val & babymask) << field.bits[1];
                    totalBits += numBits;
                } else if (whichBits > 0) {
                    const newFirstNBits: number[] = [];

                    // In this case, we need to add all 2^whichBits
                    // combinations
                    for (let i = 0; i < Math.pow(2, whichBits); i++) {
                        for (const bits of firstNBits) {
                            newFirstNBits.push((bits << whichBits) | i);
                        }
                    }

                    firstNBits = newFirstNBits;
                }
            }

            const entry: [InstructionSpec, number, number, number] =
                [instr, mask, val, totalBits];
            for (const bits of firstNBits) {
                lut[bits].push(entry);
            }
        }

        return lut;
    }
}

class Simulator implements Memory {
    protected state: FullMachineState;
    protected isa: Isa;
    protected io: IO;
    protected maxExec: number;
    protected log: MachineStateLogEntry[];
    protected numExec: number;
    protected lut: InstrLut;

    public constructor(isa: Isa, io: IO, maxExec: number) {
        // 64 entries is a nice cozy size without being too gigantic
        const LUT_SIZE = 6;

        this.state = isa.initMachineState();
        this.isa = isa;
        this.io = io;
        this.maxExec = maxExec;
        this.log = [];
        this.numExec = 0;
        this.lut = new InstrLut(this.isa, LUT_SIZE);
    }

    public getPc(): number { return this.state.pc; }

    public isHalted(): boolean { return this.state.halted; }

    // TODO: make this immutable somehow
    public getRegs() { return this.state.regs; }

    public getNumExec() { return this.numExec; }

    public loadSections(sections: MachineCodeSection[]): void {
        const updates: MachineStateUpdate[] = [];

        for (const section of sections) {
            for (let i = 0; i < section.words.length; i++) {
                updates.push({kind: 'mem',
                              addr: section.startAddr + i,
                              val: section.words[i]});
            }
        }

        // Don't create a log entry because no need to ever undo this
        this.applyUpdates(updates);
    }

    public async step(): Promise<void> {
        // If already halted, do nothing
        if (this.state.halted) {
            return;
        }

        this.numExec++;

        const ir = this.load(this.state.pc);
        const [instr, fields] = this.decode(ir);
        // Don't pass the incremented PC
        const state = {pc: this.state.pc,
                       reg: this.reg.bind(this),
                       load: this.load.bind(this)};
        const ret = instr.sim(state, this.io, fields);
        const updates: MachineStateUpdate[] =
            (Promise.resolve(ret) === ret)
            ? await (ret as Promise<MachineStateUpdate[]>)
            : ret as MachineStateUpdate[];

        // Increment PC
        updates.unshift({ kind: 'pc', where: this.state.pc + this.isa.spec.pc.increment });
        this.pushLogEntry(instr, fields, updates);
    }

    public async run(): Promise<void> {
        while (!this.state.halted) {
            if (this.maxExec >= 0 && this.numExec >= this.maxExec) {
                throw new Error(`hit maximum executed instruction count ` +
                                `${this.maxExec}. this may indicate an ` +
                                `infinite loop in code`);
            }

            await this.step();
        }
    }

    public pushLogEntry(instr: InstructionSpec, fields: Fields,
                        updates: MachineStateUpdate[]): void {
        const undo = this.applyUpdates(updates);
        const logEntry: MachineStateLogEntry = {instr, fields, updates,
                                                undo};
        this.log.push(logEntry);
    }

    public rewind(): void {
        while (this.log.length) {
            this.unstep();
        }
    }

    public unstep(): void {
        this.popLogEntry();
    }

    public popLogEntry(): MachineStateLogEntry {
        const logEntry = this.log.pop();

        if (!logEntry) {
            throw new Error('already at the beginning of time');
        }

        this.applyUpdates(logEntry.undo);
        return logEntry;
    }

    public load(addr: number): number {
        return this.isa.stateLoad(this.state, addr);
    }

    public store(addr: number, val: number): void {
        this.isa.stateStore(this.state, addr, val);
    }

    public reg(id: RegIdentifier): number {
        return this.isa.stateReg(this.state, id);
    }

    public regSet(id: RegIdentifier, val: number) {
        this.isa.stateRegSet(this.state, id, val);
    }

    public decode(ir: number): [InstructionSpec, Fields] {
        const matches = [];
        const candidates = this.lut.lookup(ir);

        for (const instrTuple of candidates) {
            const [instr, mask, val, bits] = instrTuple;
            if ((ir & mask) === val) {
                matches.push({bits, instr});
            }
        }

        if (!matches.length) {
            const unsigned = forceUnsigned(ir, this.isa.spec.pc.instrBits);
            throw new Error(`cannot decode instruction ` +
                            `0x${unsigned.toString(16)}`);
        }

        matches.sort((left, right) => right.bits - left.bits);

        const instruction = matches[0].instr;
        return [instruction, this.genFields(ir, instruction)];
    }

    // Return a list of corresponding undoing updates
    protected applyUpdates(updates: MachineStateUpdate[]):
            MachineStateUpdate[] {
        const [newState, undos] =
            this.isa.stateApplyUpdates(this.state, updates);
        this.state = newState;
        return undos;
    }

    private genFields(ir: number, instr: InstructionSpec): Fields {
        const fields: Fields = {regs: {}, imms: {}};

        for (const field of instr.fields) {
            if (field.kind === 'const') {
                continue;
            }

            const numBits = field.bits[0] - field.bits[1] + 1;
            let val = maskTo(ir >> field.bits[1], numBits);

            if (field.kind === 'reg') {
                fields.regs[field.name] = [field.prefix, val];
            } else if (field.kind === 'imm') {
                if (field.sext) {
                    val = sextTo(val, numBits);
                }
                fields.imms[field.name] = val;
            }
        }

        return fields;
    }
}

export { Simulator };
