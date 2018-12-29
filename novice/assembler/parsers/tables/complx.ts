/* tslint:disable */
// WARNING: GENERATED CODE by bootstrap-parse-table.sh
import { ParseTable } from '../../lr1';
import { T } from '../grammar';
import { NT } from '../grammars/complx';
const table: ParseTable<NT, T> = {"positions":{"(":0,")":1,",":2,":":3,"char":4,"eof":5,"int-decimal":6,"int-hex":7,"pseudoop":8,"reg":9,"string":10,"word":11,"instr":0,"instr-line":1,"instr-operands":2,"label":3,"line":4,"operand":5,"pseudoop-call":6,"pseudoop-line":7,"pseudoop-operand":8},"actionTable":[[null,null,null,null,null,null,null,null,{"action":"shift","newState":7},null,null,{"action":"shift","newState":4}],[null,null,null,null,null,{"action":"accept","production":{"lhs":"line","rhs":["label"]}},null,null,{"action":"shift","newState":7},null,null,{"action":"shift","newState":32}],[null,null,null,null,null,{"action":"accept","production":{"lhs":"line","rhs":["instr-line"]}},null,null,null,null,null,null],[null,null,null,null,null,{"action":"accept","production":{"lhs":"line","rhs":["pseudoop-line"]}},null,null,null,null,null,null],[null,null,null,{"action":"shift","newState":14},null,{"action":"reduce","production":{"lhs":"instr","rhs":["word"]}},{"action":"shift","newState":18},{"action":"shift","newState":19},null,{"action":"shift","newState":20},null,{"action":"shift","newState":17}],[null,null,null,null,null,{"action":"reduce","production":{"lhs":"instr-line","rhs":["instr"]}},null,null,null,null,null,null],[null,null,null,null,null,{"action":"reduce","production":{"lhs":"pseudoop-line","rhs":["pseudoop-call"]}},null,null,null,null,null,null],[null,null,null,null,{"action":"shift","newState":12},{"action":"reduce","production":{"lhs":"pseudoop-call","rhs":["pseudoop"]}},{"action":"shift","newState":10},{"action":"shift","newState":11},null,null,{"action":"shift","newState":13},{"action":"shift","newState":9}],[null,null,null,null,null,{"action":"reduce","production":{"lhs":"pseudoop-call","rhs":["pseudoop","pseudoop-operand"]}},null,null,null,null,null,null],[null,null,null,null,null,{"action":"reduce","production":{"lhs":"pseudoop-operand","rhs":["word"]}},null,null,null,null,null,null],[null,null,null,null,null,{"action":"reduce","production":{"lhs":"pseudoop-operand","rhs":["int-decimal"]}},null,null,null,null,null,null],[null,null,null,null,null,{"action":"reduce","production":{"lhs":"pseudoop-operand","rhs":["int-hex"]}},null,null,null,null,null,null],[null,null,null,null,null,{"action":"reduce","production":{"lhs":"pseudoop-operand","rhs":["char"]}},null,null,null,null,null,null],[null,null,null,null,null,{"action":"reduce","production":{"lhs":"pseudoop-operand","rhs":["string"]}},null,null,null,null,null,null],[null,null,null,null,null,{"action":"reduce","production":{"lhs":"label","rhs":["word",":"]}},null,null,{"action":"reduce","production":{"lhs":"label","rhs":["word",":"]}},null,null,{"action":"reduce","production":{"lhs":"label","rhs":["word",":"]}}],[{"action":"shift","newState":22},null,{"action":"shift","newState":21},null,null,{"action":"reduce","production":{"lhs":"instr","rhs":["word","instr-operands"]}},null,null,null,null,null,null],[{"action":"reduce","production":{"lhs":"instr-operands","rhs":["operand"]}},null,{"action":"reduce","production":{"lhs":"instr-operands","rhs":["operand"]}},null,null,{"action":"reduce","production":{"lhs":"instr-operands","rhs":["operand"]}},null,null,null,null,null,null],[{"action":"reduce","production":{"lhs":"operand","rhs":["word"]}},null,{"action":"reduce","production":{"lhs":"operand","rhs":["word"]}},null,null,{"action":"reduce","production":{"lhs":"operand","rhs":["word"]}},null,null,null,null,null,null],[{"action":"reduce","production":{"lhs":"operand","rhs":["int-decimal"]}},null,{"action":"reduce","production":{"lhs":"operand","rhs":["int-decimal"]}},null,null,{"action":"reduce","production":{"lhs":"operand","rhs":["int-decimal"]}},null,null,null,null,null,null],[{"action":"reduce","production":{"lhs":"operand","rhs":["int-hex"]}},null,{"action":"reduce","production":{"lhs":"operand","rhs":["int-hex"]}},null,null,{"action":"reduce","production":{"lhs":"operand","rhs":["int-hex"]}},null,null,null,null,null,null],[{"action":"reduce","production":{"lhs":"operand","rhs":["reg"]}},null,{"action":"reduce","production":{"lhs":"operand","rhs":["reg"]}},null,null,{"action":"reduce","production":{"lhs":"operand","rhs":["reg"]}},null,null,null,null,null,null],[null,null,null,null,null,null,{"action":"shift","newState":18},{"action":"shift","newState":19},null,{"action":"shift","newState":20},null,{"action":"shift","newState":17}],[null,null,null,null,null,null,{"action":"shift","newState":25},{"action":"shift","newState":26},null,{"action":"shift","newState":27},null,{"action":"shift","newState":24}],[null,{"action":"shift","newState":28},null,null,null,null,null,null,null,null,null,null],[null,{"action":"reduce","production":{"lhs":"operand","rhs":["word"]}},null,null,null,null,null,null,null,null,null,null],[null,{"action":"reduce","production":{"lhs":"operand","rhs":["int-decimal"]}},null,null,null,null,null,null,null,null,null,null],[null,{"action":"reduce","production":{"lhs":"operand","rhs":["int-hex"]}},null,null,null,null,null,null,null,null,null,null],[null,{"action":"reduce","production":{"lhs":"operand","rhs":["reg"]}},null,null,null,null,null,null,null,null,null,null],[{"action":"reduce","production":{"lhs":"instr-operands","rhs":["instr-operands","(","operand",")"]}},null,{"action":"reduce","production":{"lhs":"instr-operands","rhs":["instr-operands","(","operand",")"]}},null,null,{"action":"reduce","production":{"lhs":"instr-operands","rhs":["instr-operands","(","operand",")"]}},null,null,null,null,null,null],[{"action":"reduce","production":{"lhs":"instr-operands","rhs":["instr-operands",",","operand"]}},null,{"action":"reduce","production":{"lhs":"instr-operands","rhs":["instr-operands",",","operand"]}},null,null,{"action":"reduce","production":{"lhs":"instr-operands","rhs":["instr-operands",",","operand"]}},null,null,null,null,null,null],[null,null,null,null,null,{"action":"reduce","production":{"lhs":"instr-line","rhs":["label","instr"]}},null,null,null,null,null,null],[null,null,null,null,null,{"action":"reduce","production":{"lhs":"pseudoop-line","rhs":["label","pseudoop-call"]}},null,null,null,null,null,null],[null,null,null,null,null,{"action":"reduce","production":{"lhs":"instr","rhs":["word"]}},{"action":"shift","newState":18},{"action":"shift","newState":19},null,{"action":"shift","newState":20},null,{"action":"shift","newState":17}]],"gotoTable":[[5,2,null,1,null,null,6,3,null],[30,null,null,null,null,null,31,null,null],[null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null],[null,null,15,null,null,16,null,null,null],[null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,8],[null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null],[null,null,null,null,null,29,null,null,null],[null,null,null,null,null,23,null,null,null],[null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null],[null,null,15,null,null,16,null,null,null]]};
export default table;