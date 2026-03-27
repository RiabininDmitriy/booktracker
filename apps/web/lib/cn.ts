// Utility to compose className strings while safely skipping falsy values.
export function classNames(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}
