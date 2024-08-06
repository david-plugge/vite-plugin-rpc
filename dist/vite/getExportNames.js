import { Parser } from 'acorn';
import { tsPlugin } from 'acorn-typescript';
const parser = Parser.extend(tsPlugin());
export function getExports(code) {
    const program = parser.parse(code, { ecmaVersion: 'latest', sourceType: 'module' });
    const names = new Set();
    for (const node of program.body) {
        if (node.type === 'ExportDefaultDeclaration') {
            names.add('default');
        }
        else if (node.type === 'ExportNamedDeclaration') {
            if (node.declaration) {
                switch (node.declaration.type) {
                    case 'FunctionDeclaration':
                        names.add(node.declaration.id.name);
                        break;
                    case 'VariableDeclaration':
                        for (const decl of node.declaration.declarations) {
                            if (decl.id.type === 'Identifier') {
                                names.add(decl.id.name);
                            }
                        }
                        break;
                }
            }
            for (const spec of node.specifiers) {
                if (spec.exported.type === 'Identifier') {
                    names.add(spec.exported.name);
                }
            }
        }
        else if (node.type === 'ExportAllDeclaration') {
            throw new Error('Export all is not supported');
        }
    }
    return [...names];
}
