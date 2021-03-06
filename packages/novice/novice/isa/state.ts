// Either just the name ('cc') or a prefix and a regno ['r', 3]
type RegIdentifier = string|[string, number];

interface FullMachineState {
    pc: number;
    mem: {[addr: number]: number};
    regs: {
        solo: {[name: string]: number};
        range: {[prefix: string]: number[]};
    };
    halted: boolean;
}

interface MachineState {
    // Address of current instruction. NOT incremented!
    pc: number;
    // Auto sign-extends and everything
    reg(reg: RegIdentifier): number;
    // memory accesses
    load(addr: number): number;
}

interface MachineStateRegUpdate {
    kind: 'reg';
    reg: RegIdentifier;
    val: number;
}

interface MachineStateMemUpdate {
    kind: 'mem';
    addr: number;
    val: number;
}

interface MachineStatePcUpdate {
    kind: 'pc';
    where: number;
}

interface MachineStateHaltUpdate {
    kind: 'halt';
    halted: boolean;
}

type MachineStateUpdate = MachineStateRegUpdate|
                          MachineStateMemUpdate|
                          MachineStatePcUpdate|
                          MachineStateHaltUpdate;

export { RegIdentifier, MachineState, MachineStateUpdate, FullMachineState };
