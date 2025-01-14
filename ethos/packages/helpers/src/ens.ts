export function isValidEnsName(name: string | undefined): boolean {
  if (!name) return false;

  return name.endsWith('.eth');
}
