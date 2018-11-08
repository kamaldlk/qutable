var hyphenPattern = /-(.)/g;
export function camelize(string) {
  return string.replace(hyphenPattern, function(_, character) {
    return character.toUpperCase();
  });
}
