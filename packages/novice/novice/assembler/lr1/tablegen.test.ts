import { ObjSet } from './objset';
import { Production } from './production';
import { TableGenerator, S, ParseItem, ParseState, ParseTransition, ParseAction } from './tablegen';

describe('LR(1) table generator', () => {
    describe('calcFirst()', () => {
        it('a^nb^n grammar', () => {
            type T = 'a' | 'b';
            let Ts = new Set(<T[]>['a', 'b']);
            type NT = 'goal';
            let NTs = new Set(<NT[]>['goal']);
            let productions: Production<NT, T>[] = [
                {lhs: 'goal', rhs: ['a', 'b']},
                {lhs: 'goal', rhs: ['a', 'goal', 'b']},
            ];

            let tablegen = new TableGenerator<NT, T>('goal', productions, NTs, Ts);
            expect(tablegen.first).toEqual(new Map<NT|S|T, Set<S|T>>([
                ['',     new Set<S|T>([''])],
                ['eof',  new Set<S|T>(['eof'])],
                ['goal', new Set<S|T>(['a'])],
                ['a',    new Set<S|T>(['a'])],
                ['b',    new Set<S|T>(['b'])],
            ]));
        });

        it('compilers homework 2 grammar', () => {
            const _NTs = {
                'imp'     : '',
                'vars'    : '',
                'nevars'  : '',
                'nevars2' : '',
                'decl'    : '',
                'assign'  : '',
                'expr'    : '',
                'expr2'   : '',
                'op'      : '',
                'type'    : '',
            };
            type NT = keyof typeof _NTs;
            const NTs = new Set(<NT[]> Object.keys(_NTs));

            const _Ts = {
                'main'  : '',
                '('     : '',
                ')'     : '',
                '{'     : '',
                '}'     : '',
                '='     : '',
                '+'     : '',
                '*'     : '',
                ';'     : '',
                ','     : '',
                'int'   : '',
                'float' : '',
                'var'   : '',
            };
            type T = keyof typeof _Ts;
            const Ts = new Set(<T[]> Object.keys(_Ts));

            let productions: Production<NT, T>[] = [
                {lhs: 'imp',     rhs: ['main', '(', 'vars', ')', '{', 'decl', 'assign', ')']},
                {lhs: 'vars',    rhs: []},
                {lhs: 'vars',    rhs: ['nevars']},
                {lhs: 'nevars',  rhs: ['var', 'nevars2']},
                {lhs: 'nevars2', rhs: []},
                {lhs: 'nevars2', rhs: [',', 'nevars']},
                {lhs: 'decl',    rhs: ['type', 'nevars', ';']},
                {lhs: 'assign',  rhs: ['var', '=', 'expr', ';']},
                {lhs: 'expr',    rhs: ['var', 'expr2']},
                {lhs: 'expr2',   rhs: []},
                {lhs: 'expr2',   rhs: ['op', 'expr']},
                {lhs: 'op',      rhs: ['+']},
                {lhs: 'op',      rhs: ['*']},
                {lhs: 'type',    rhs: ['int']},
                {lhs: 'type',    rhs: ['float']},
            ];

            let tablegen = new TableGenerator<NT, T>('imp', productions, NTs, Ts);
            expect(tablegen.first).toEqual(new Map<NT|S|T, Set<S|T>>([
                ['',        new Set<S|T>([''])],
                ['eof',     new Set<S|T>(['eof'])],
                ['main',    new Set<S|T>(['main'])],
                ['(',       new Set<S|T>(['('])],
                [')',       new Set<S|T>([')'])],
                ['{',       new Set<S|T>(['{'])],
                ['}',       new Set<S|T>(['}'])],
                ['=',       new Set<S|T>(['='])],
                ['+',       new Set<S|T>(['+'])],
                ['*',       new Set<S|T>(['*'])],
                [';',       new Set<S|T>([';'])],
                [',',       new Set<S|T>([','])],
                ['int',     new Set<S|T>(['int'])],
                ['float',   new Set<S|T>(['float'])],
                ['var',     new Set<S|T>(['var'])],
                ['imp',     new Set<S|T>(['main'])],
                ['vars',    new Set<S|T>(['', 'var'])],
                ['nevars',  new Set<S|T>(['var'])],
                ['nevars2', new Set<S|T>(['', ','])],
                ['decl',    new Set<S|T>(['int', 'float'])],
                ['assign',  new Set<S|T>(['var'])],
                ['expr',    new Set<S|T>(['var'])],
                ['expr2',   new Set<S|T>(['', '+', '*'])],
                ['op',      new Set<S|T>(['+', '*'])],
                ['type',    new Set<S|T>(['int', 'float'])],
            ]));
        });

        it('deep epsilon grammar', () => {
            const _NTs = {
                'A'  :  '',
                'A2' : '',
                'A3' : '',
                'A4' : '',
                'B'  : '',
                'C'  : '',
            };
            type NT = keyof typeof _NTs;
            const NTs = new Set(<NT[]> Object.keys(_NTs));

            const _Ts = {
                'a' : '',
                'b' : '',
                'c' : '',
                'd' : '',
                'e' : '',
            };
            type T = keyof typeof _Ts;
            const Ts = new Set(<T[]> Object.keys(_Ts));

            let productions: Production<NT, T>[] = [
                {lhs: 'A',  rhs: ['A2', 'A3', 'A4']},
                {lhs: 'A2', rhs: []},
                {lhs: 'A2', rhs: ['b', 'B']},
                {lhs: 'A3', rhs: []},
                {lhs: 'A3', rhs: ['e', 'd']},
                {lhs: 'A4', rhs: []},
                {lhs: 'A4', rhs: ['B']},
                {lhs: 'B',  rhs: ['c', 'a', 'B']},
                {lhs: 'C',  rhs: ['A3', 'A2', 'B']},
            ];

            let tablegen = new TableGenerator<NT, T>('A', productions, NTs, Ts);
            expect(tablegen.first).toEqual(new Map<NT|S|T, Set<S|T>>([
                ['',    new Set<S|T>([''])],
                ['eof', new Set<S|T>(['eof'])],
                ['a',   new Set<S|T>(['a'])],
                ['b',   new Set<S|T>(['b'])],
                ['c',   new Set<S|T>(['c'])],
                ['d',   new Set<S|T>(['d'])],
                ['e',   new Set<S|T>(['e'])],
                ['A',   new Set<S|T>(['', 'b', 'e', 'c'])],
                ['A2',  new Set<S|T>(['', 'b'])],
                ['A3',  new Set<S|T>(['', 'e'])],
                ['A4',  new Set<S|T>(['', 'c'])],
                ['B',   new Set<S|T>(['c'])],
                ['C',   new Set<S|T>(['e', 'b', 'c'])],
            ]));
        });
    });

    describe('closure()', () => {
        it('closure from compilers worksheet 7', () => {
            const _NTs = {
                'goal'   : '',
                'expr'   : '',
                'term'   : '',
                'factor' : '',
            };
            type NT = keyof typeof _NTs;
            const NTs = new Set(<NT[]> Object.keys(_NTs));

            const _Ts = {
                'ident' : '',
                '*'     : '',
                '-'     : '',
            };
            type T = keyof typeof _Ts;
            const Ts = new Set(<T[]> Object.keys(_Ts));

            let productions: Production<NT, T>[] = [
                {lhs: 'goal',   rhs: ['expr']},
                {lhs: 'expr',   rhs: ['term', '-', 'expr']},
                {lhs: 'expr',   rhs: ['term']},
                {lhs: 'term',   rhs: ['factor', '*', 'term']},
                {lhs: 'term',   rhs: ['factor']},
                {lhs: 'factor', rhs: ['ident']},
            ];

            let tablegen = new TableGenerator<NT, T>('goal', productions, NTs, Ts);
            let items = new ObjSet<ParseItem<NT, T>>([
                new ParseItem<NT, T>(productions[0], 0, 'eof'),
            ]);
            expect(tablegen.closure(items)).toBe(true);
            expect(items).toEqual(new ObjSet<ParseItem<NT, T>>([
                new ParseItem<NT, T>(productions[0], 0, 'eof'),
                new ParseItem<NT, T>(productions[1], 0, 'eof'),
                new ParseItem<NT, T>(productions[2], 0, 'eof'),
                new ParseItem<NT, T>(productions[3], 0, 'eof'),
                new ParseItem<NT, T>(productions[3], 0, '-'),
                new ParseItem<NT, T>(productions[4], 0, 'eof'),
                new ParseItem<NT, T>(productions[4], 0, '-'),
                new ParseItem<NT, T>(productions[5], 0, 'eof'),
                new ParseItem<NT, T>(productions[5], 0, '-'),
                new ParseItem<NT, T>(productions[5], 0, '*'),
            ]));
        });
    });

    describe('goto()', () => {
        it('goto from compilers worksheet 7', () => {
            const _NTs = {
                'goal'   : '',
                'expr'   : '',
                'term'   : '',
                'factor' : '',
            };
            type NT = keyof typeof _NTs;
            const NTs = new Set(<NT[]> Object.keys(_NTs));

            const _Ts = {
                'ident' : '',
                '*'     : '',
                '-'     : '',
            };
            type T = keyof typeof _Ts;
            const Ts = new Set(<T[]> Object.keys(_Ts));

            let productions: Production<NT, T>[] = [
                {lhs: 'goal',   rhs: ['expr']},
                {lhs: 'expr',   rhs: ['term', '-', 'expr']},
                {lhs: 'expr',   rhs: ['term']},
                {lhs: 'term',   rhs: ['factor', '*', 'term']},
                {lhs: 'term',   rhs: ['factor']},
                {lhs: 'factor', rhs: ['ident']},
            ];

            let tablegen = new TableGenerator<NT, T>('goal', productions, NTs, Ts);
            let cc0 = new ObjSet<ParseItem<NT, T>>([
                new ParseItem<NT, T>(productions[0], 0, 'eof'),
                new ParseItem<NT, T>(productions[1], 0, 'eof'),
                new ParseItem<NT, T>(productions[2], 0, 'eof'),
                new ParseItem<NT, T>(productions[3], 0, 'eof'),
                new ParseItem<NT, T>(productions[3], 0, '-'),
                new ParseItem<NT, T>(productions[4], 0, 'eof'),
                new ParseItem<NT, T>(productions[4], 0, '-'),
                new ParseItem<NT, T>(productions[5], 0, 'eof'),
                new ParseItem<NT, T>(productions[5], 0, '-'),
                new ParseItem<NT, T>(productions[5], 0, '*'),
            ]);

            expect(tablegen.goto(cc0, 'term')).toEqual(new ObjSet<ParseItem<NT, T>>([
                new ParseItem<NT, T>(productions[1], 1, 'eof'),
                new ParseItem<NT, T>(productions[2], 1, 'eof'),
            ]));
        });
    });

    describe('calcStates()', () => {
        it('states example from textbook', () => {
            const _NTs = {
                'goal' : '',
                'list' : '',
                'pair' : '',
            };
            type NT = keyof typeof _NTs;
            const NTs = new Set(<NT[]> Object.keys(_NTs));

            const _Ts = {
                '(' : '',
                ')' : '',
            };
            type T = keyof typeof _Ts;
            const Ts = new Set(<T[]> Object.keys(_Ts));

            const productions: Production<NT, T>[] = [
                {lhs: 'goal', rhs: ['list']},
                {lhs: 'list', rhs: ['list', 'pair']},
                {lhs: 'list', rhs: ['pair']},
                {lhs: 'pair', rhs: ['(', 'pair', ')']},
                {lhs: 'pair', rhs: ['(', ')']},
            ];

            let tablegen = new TableGenerator<NT, T>('goal', productions, NTs, Ts);

            let states = [
                new ParseState<NT, T>(0, new ObjSet<ParseItem<NT, T>>([
                    new ParseItem<NT, T>(productions[0], 0, 'eof'),
                    new ParseItem<NT, T>(productions[1], 0, 'eof'),
                    new ParseItem<NT, T>(productions[1], 0, '('),
                    new ParseItem<NT, T>(productions[2], 0, 'eof'),
                    new ParseItem<NT, T>(productions[2], 0, '('),
                    new ParseItem<NT, T>(productions[3], 0, 'eof'),
                    new ParseItem<NT, T>(productions[3], 0, '('),
                    new ParseItem<NT, T>(productions[4], 0, 'eof'),
                    new ParseItem<NT, T>(productions[4], 0, '('),
                ])),
                new ParseState<NT, T>(1, new ObjSet<ParseItem<NT, T>>([
                    new ParseItem<NT, T>(productions[0], 1, 'eof'),
                    new ParseItem<NT, T>(productions[1], 1, 'eof'),
                    new ParseItem<NT, T>(productions[1], 1, '('),
                    new ParseItem<NT, T>(productions[3], 0, 'eof'),
                    new ParseItem<NT, T>(productions[3], 0, '('),
                    new ParseItem<NT, T>(productions[4], 0, 'eof'),
                    new ParseItem<NT, T>(productions[4], 0, '('),
                ])),
                new ParseState<NT, T>(2, new ObjSet<ParseItem<NT, T>>([
                    new ParseItem<NT, T>(productions[2], 1, 'eof'),
                    new ParseItem<NT, T>(productions[2], 1, '('),
                ])),
                new ParseState<NT, T>(3, new ObjSet<ParseItem<NT, T>>([
                    new ParseItem<NT, T>(productions[3], 0, ')'),
                    new ParseItem<NT, T>(productions[3], 1, 'eof'),
                    new ParseItem<NT, T>(productions[3], 1, '('),
                    new ParseItem<NT, T>(productions[4], 0, ')'),
                    new ParseItem<NT, T>(productions[4], 1, 'eof'),
                    new ParseItem<NT, T>(productions[4], 1, '('),
                ])),
                new ParseState<NT, T>(4, new ObjSet<ParseItem<NT, T>>([
                    new ParseItem<NT, T>(productions[1], 2, 'eof'),
                    new ParseItem<NT, T>(productions[1], 2, '('),
                ])),
                new ParseState<NT, T>(5, new ObjSet<ParseItem<NT, T>>([
                    new ParseItem<NT, T>(productions[3], 2, 'eof'),
                    new ParseItem<NT, T>(productions[3], 2, '('),
                ])),
                new ParseState<NT, T>(6, new ObjSet<ParseItem<NT, T>>([
                    new ParseItem<NT, T>(productions[3], 0, ')'),
                    new ParseItem<NT, T>(productions[3], 1, ')'),
                    new ParseItem<NT, T>(productions[4], 0, ')'),
                    new ParseItem<NT, T>(productions[4], 1, ')'),
                ])),
                new ParseState<NT, T>(7, new ObjSet<ParseItem<NT, T>>([
                    new ParseItem<NT, T>(productions[4], 2, 'eof'),
                    new ParseItem<NT, T>(productions[4], 2, '('),
                ])),
                new ParseState<NT, T>(8, new ObjSet<ParseItem<NT, T>>([
                    new ParseItem<NT, T>(productions[3], 3, 'eof'),
                    new ParseItem<NT, T>(productions[3], 3, '('),
                ])),
                new ParseState<NT, T>(9, new ObjSet<ParseItem<NT, T>>([
                    new ParseItem<NT, T>(productions[3], 2, ')'),
                ])),
                new ParseState<NT, T>(10, new ObjSet<ParseItem<NT, T>>([
                    new ParseItem<NT, T>(productions[4], 2, ')'),
                ])),
                new ParseState<NT, T>(11, new ObjSet<ParseItem<NT, T>>([
                    new ParseItem<NT, T>(productions[3], 3, ')'),
                ])),
            ];
            states[0].transition('list', 1);
            states[0].transition('pair', 2);
            states[0].transition('(',    3);
            states[1].transition('pair', 4);
            states[1].transition('(',    3);
            states[3].transition('pair', 5);
            states[3].transition('(',    6);
            states[3].transition(')',    7);
            states[5].transition(')',    8);
            states[6].transition('pair', 9);
            states[6].transition('(',    6);
            states[6].transition(')',    10);
            states[9].transition(')',    11);

            const statesSet = new ObjSet<ParseState<NT, T>>(states);

            // SO HARD to figure this out
            for (let i = 0; i < states.length; i++) {
                let actualState = tablegen.states[i];
                let wantExpectedState = statesSet.get(actualState);
                expect(wantExpectedState).toBeDefined();

                let expectedState = <ParseState<NT, T>> wantExpectedState;
                expect(actualState.transitions.size()).toBe(expectedState.transitions.size());

                actualState.transitions.forEach(transition => {
                    let wantExpectedNewState =
                        statesSet.get(tablegen.states[transition.newState]);
                    expect(wantExpectedNewState).toBeDefined();
                    let expectedNewState = <ParseState<NT, T>> wantExpectedNewState;
                    let expectedNewStateNum = expectedNewState.num;

                    let expectedThisTransition = expectedState.transitions.has(
                        new ParseTransition<NT, T>(transition.token, expectedNewStateNum));
                    expect(expectedThisTransition).toBe(true);
                });
            }
        });
    });

    describe('genTable()', () => {
        it('table example from textbook', () => {
            const _NTs = {
                'goal' : '',
                'list' : '',
                'pair' : '',
            };
            type NT = keyof typeof _NTs;
            const NTs = new Set(<NT[]> Object.keys(_NTs));

            const _Ts = {
                '(' : '',
                ')' : '',
            };
            type T = keyof typeof _Ts;
            const Ts = new Set(<T[]> Object.keys(_Ts));

            const productions: Production<NT, T>[] = [
                {lhs: 'goal', rhs: ['list']},
                {lhs: 'list', rhs: ['list', 'pair']},
                {lhs: 'list', rhs: ['pair']},
                {lhs: 'pair', rhs: ['(', 'pair', ')']},
                {lhs: 'pair', rhs: ['(', ')']},
            ];

            let tablegen = new TableGenerator<NT, T>('goal', productions, NTs, Ts);

            let states = [
                new ParseState<NT, T>(0, new ObjSet<ParseItem<NT, T>>([
                    new ParseItem<NT, T>(productions[0], 0, 'eof'),
                    new ParseItem<NT, T>(productions[1], 0, 'eof'),
                    new ParseItem<NT, T>(productions[1], 0, '('),
                    new ParseItem<NT, T>(productions[2], 0, 'eof'),
                    new ParseItem<NT, T>(productions[2], 0, '('),
                    new ParseItem<NT, T>(productions[3], 0, 'eof'),
                    new ParseItem<NT, T>(productions[3], 0, '('),
                    new ParseItem<NT, T>(productions[4], 0, 'eof'),
                    new ParseItem<NT, T>(productions[4], 0, '('),
                ])),
                new ParseState<NT, T>(1, new ObjSet<ParseItem<NT, T>>([
                    new ParseItem<NT, T>(productions[0], 1, 'eof'),
                    new ParseItem<NT, T>(productions[1], 1, 'eof'),
                    new ParseItem<NT, T>(productions[1], 1, '('),
                    new ParseItem<NT, T>(productions[3], 0, 'eof'),
                    new ParseItem<NT, T>(productions[3], 0, '('),
                    new ParseItem<NT, T>(productions[4], 0, 'eof'),
                    new ParseItem<NT, T>(productions[4], 0, '('),
                ])),
                new ParseState<NT, T>(2, new ObjSet<ParseItem<NT, T>>([
                    new ParseItem<NT, T>(productions[2], 1, 'eof'),
                    new ParseItem<NT, T>(productions[2], 1, '('),
                ])),
                new ParseState<NT, T>(3, new ObjSet<ParseItem<NT, T>>([
                    new ParseItem<NT, T>(productions[3], 0, ')'),
                    new ParseItem<NT, T>(productions[3], 1, 'eof'),
                    new ParseItem<NT, T>(productions[3], 1, '('),
                    new ParseItem<NT, T>(productions[4], 0, ')'),
                    new ParseItem<NT, T>(productions[4], 1, 'eof'),
                    new ParseItem<NT, T>(productions[4], 1, '('),
                ])),
                new ParseState<NT, T>(4, new ObjSet<ParseItem<NT, T>>([
                    new ParseItem<NT, T>(productions[1], 2, 'eof'),
                    new ParseItem<NT, T>(productions[1], 2, '('),
                ])),
                new ParseState<NT, T>(5, new ObjSet<ParseItem<NT, T>>([
                    new ParseItem<NT, T>(productions[3], 2, 'eof'),
                    new ParseItem<NT, T>(productions[3], 2, '('),
                ])),
                new ParseState<NT, T>(6, new ObjSet<ParseItem<NT, T>>([
                    new ParseItem<NT, T>(productions[3], 0, ')'),
                    new ParseItem<NT, T>(productions[3], 1, ')'),
                    new ParseItem<NT, T>(productions[4], 0, ')'),
                    new ParseItem<NT, T>(productions[4], 1, ')'),
                ])),
                new ParseState<NT, T>(7, new ObjSet<ParseItem<NT, T>>([
                    new ParseItem<NT, T>(productions[4], 2, 'eof'),
                    new ParseItem<NT, T>(productions[4], 2, '('),
                ])),
                new ParseState<NT, T>(8, new ObjSet<ParseItem<NT, T>>([
                    new ParseItem<NT, T>(productions[3], 3, 'eof'),
                    new ParseItem<NT, T>(productions[3], 3, '('),
                ])),
                new ParseState<NT, T>(9, new ObjSet<ParseItem<NT, T>>([
                    new ParseItem<NT, T>(productions[3], 2, ')'),
                ])),
                new ParseState<NT, T>(10, new ObjSet<ParseItem<NT, T>>([
                    new ParseItem<NT, T>(productions[4], 2, ')'),
                ])),
                new ParseState<NT, T>(11, new ObjSet<ParseItem<NT, T>>([
                    new ParseItem<NT, T>(productions[3], 3, ')'),
                ])),
            ];

            let expectedAction: [T|'eof', ParseAction<NT, T>][][] = [
                // state 0
                [
                    ['(',   {action: 'shift', newState: 3}],
                ],
                // state 1
                [
                    ['eof', {action: 'accept', production: productions[0]}],
                    ['(',   {action: 'shift',  newState: 3}],
                ],
                // state 2
                [
                    ['eof', {action: 'reduce', production: productions[2]}],
                    ['(',   {action: 'reduce', production: productions[2]}],
                ],
                // state 3
                [
                    ['(',   {action: 'shift',  newState: 6}],
                    [')',   {action: 'shift',  newState: 7}],
                ],
                // state 4
                [
                    ['eof', {action: 'reduce', production: productions[1]}],
                    ['(',   {action: 'reduce', production: productions[1]}],
                ],
                // state 5
                [
                    [')',   {action: 'shift',  newState: 8}],
                ],
                // state 6
                [
                    ['(',   {action: 'shift',  newState: 6}],
                    [')',   {action: 'shift',  newState: 10}],
                ],
                // state 7
                [
                    ['eof', {action: 'reduce', production: productions[4]}],
                    ['(',   {action: 'reduce', production: productions[4]}],
                ],
                // state 8
                [
                    ['eof', {action: 'reduce', production: productions[3]}],
                    ['(',   {action: 'reduce', production: productions[3]}],
                ],
                // state 9
                [
                    [')',   {action: 'shift',  newState: 11}],
                ],
                // state 10
                [
                    [')',   {action: 'reduce', production: productions[4]}],
                ],
                // state 11
                [
                    [')',   {action: 'reduce', production: productions[3]}],
                ],
            ];

            let expectedGoto: [NT, number][][] = [
                // state 0
                [
                    ['list', 1],
                    ['pair', 2],
                ],
                // state 1
                [
                    ['pair', 4],
                ],
                // state 2
                [],
                // state 3
                [
                    ['pair', 5],
                ],
                // state 4
                [],
                // state 5
                [],
                // state 6
                [
                    ['pair', 9],
                ],
                // state 7
                [],
                // state 8
                [],
                // state 9
                [],
                // state 10
                [],
                // state 11
                [],
            ];

            const statesSet = new ObjSet<ParseState<NT, T>>(states);
            const expectedToActual = new Map<number, number>();

            for (let i = 0; i < states.length; i++) {
                let actualState = tablegen.states[i];
                let wantExpectedState = statesSet.get(actualState);
                expect(wantExpectedState).toBeDefined();

                let expectedState = <ParseState<NT, T>> wantExpectedState;
                expectedToActual.set(expectedState.num, actualState.num);
            }

            let table = tablegen.genTable();

            expect(Object.keys(table.positions).length).toBe(NTs.size + Ts.size + 1);
            for (let state = 0; state < expectedAction.length; state++) {
                let actualState = <number> expectedToActual.get(state);
                let actualRow = table.actionTable[actualState];

                let expectedActions = expectedAction[state];
                let actualEntries =
                    actualRow.filter(action => action !== null).length;
                expect(actualEntries).toBe(expectedActions.length);

                for (let i = 0; i < expectedActions.length; i++) {
                    let [token, expectedAction] = expectedActions[i];
                    let actualAction = actualRow[table.positions[token]];

                    expect(actualAction).not.toBe(null);
                    if (expectedAction.action === 'shift') {
                        expectedAction.newState = <number> expectedToActual.get(<number> expectedAction.newState);
                    }
                    expect(actualAction).toEqual(expectedAction);
                }
            }

            for (let state = 0; state < expectedGoto.length; state++) {
                let actualState = <number> expectedToActual.get(state);
                let actualRow = table.gotoTable[actualState];

                let expectedGotos = expectedGoto[state];
                let actualEntries =
                    actualRow.filter(goto => goto !== null).length;
                expect(actualEntries).toBe(expectedGotos.length);

                for (let i = 0; i < expectedGotos.length; i++) {
                    let [token, expectedNewState] = expectedGotos[i];
                    let actualNewState = actualRow[table.positions[token]];

                    expect(actualNewState).not.toBe(null);
                    expectedNewState = <number> expectedToActual.get(expectedNewState);
                    expect(actualNewState).toEqual(expectedNewState);
                }
            }
        });
    });
});
