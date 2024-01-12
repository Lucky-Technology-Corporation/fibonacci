// THIS IS IN THIS REPO BECAUSE GOLANG DOESN'T HAVE A GOOD WAY TO DO THIS
// This uses the typescript AST to add imports to a file.

import generate from '@babel/generator';
import * as parser from '@babel/parser';
import * as t from '@babel/types';

interface Import {
    import: string;
    from: string;
    named: boolean;
}

export function addImports(code: string, imports: Import[]): string {
    try{
        const ast = parser.parse(code, { sourceType: 'module', plugins: ["jsx"] });
        const importDeclarations = ast.program.body.filter(node => node.type === 'ImportDeclaration') as t.ImportDeclaration[];

        imports.forEach(imp => {
            const existingDeclaration = importDeclarations.find(node => node.source.value === imp.from);

            if (existingDeclaration) {
                if (imp.named) {
                    const specifierExists = existingDeclaration.specifiers.some(specifier =>
                        t.isImportSpecifier(specifier) && t.isIdentifier(specifier.imported) && specifier.imported.name === imp.import
                    );
                    if (!specifierExists) {
                        existingDeclaration.specifiers.push(t.importSpecifier(t.identifier(imp.import), t.identifier(imp.import)));
                    }
                } else {
                    const defaultSpecifierExists = existingDeclaration.specifiers.some(specifier =>
                        t.isImportDefaultSpecifier(specifier)
                    );
                    if (!defaultSpecifierExists) {
                        existingDeclaration.specifiers.unshift(t.importDefaultSpecifier(t.identifier(imp.import)));
                    }
                }
            } else {
                const newImportDeclaration = imp.named ?
                    t.importDeclaration([t.importSpecifier(t.identifier(imp.import), t.identifier(imp.import))], t.stringLiteral(imp.from)) :
                    t.importDeclaration([t.importDefaultSpecifier(t.identifier(imp.import))], t.stringLiteral(imp.from));
                ast.program.body.unshift(newImportDeclaration);
            }
        });

        return generate(ast, { retainLines: true }).code;
    } catch(e) {
        var newCode = code;
        for(let i = 0; i < imports.length; i++) {
            const regex = new RegExp(`^import.*?(['"]${imports[i].from}['"]);?\\s*(.*?)$`);
            const importStatement = code.split("\n").find(line => regex.test(line)) || "";
            console.log(importStatement)
            if (importStatement == "") {
                if(imports[i].named) {
                    newCode = `import { ${imports[i].import} } from '${imports[i].from}';\n` + code;
                } else {
                    newCode = `import ${imports[i].import} from '${imports[i].from}';\n` + code;
                }
            } else {
                var newImportStatement = importStatement;
                if(!importStatement.includes(imports[i].import)) {
                    if(imports[i].named) {
                        if(importStatement.includes("}")) {
                            newImportStatement = importStatement.replace("}", ", " + imports[i].import + " }")
                        } else{
                            var importStatementParts = importStatement.split(" from ")
                            newImportStatement = importStatementParts[0] + ", { " + imports[i].import + " } from " + importStatementParts[1]
                        }
                        newCode = newCode.replace(importStatement, newImportStatement);
                    } else{
                        newCode = `import ${imports[i].import} from '${imports[i].from}';\n` + code;   
                    }
                }
            }
        }
        return newCode;
    }
}