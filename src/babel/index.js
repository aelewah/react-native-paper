const mappings = require('../../dist/mappings.json');

module.exports = function rewire(babel) {
  const t = babel.types;

  return {
    visitor: {
      ImportDeclaration(path) {
        if (path.node.source.value !== 'react-native-paper' || path.node.skip) {
          return;
        }

        path.replaceWithMultiple(
          path.node.specifiers.reduce((declarations, specifier) => {
            const alias = `${path.node.source.value}/${
              mappings[specifier.imported.name]
            }`;

            if (alias) {
              declarations.push(
                t.importDeclaration(
                  [
                    t.importDefaultSpecifier(
                      t.identifier(specifier.local.name)
                    ),
                  ],
                  t.stringLiteral(alias)
                )
              );
            } else {
              const previous = declarations.find(
                d => d.source.value === path.node.source.value
              );

              if (previous) {
                previous.specifiers.push(specifier);
              } else {
                const node = t.importDeclaration([specifier], path.node.source);
                node.skip = true;
                declarations.push(node);
              }
            }

            return declarations;
          }, [])
        );

        path.requeue();
      },
    },
  };
};
