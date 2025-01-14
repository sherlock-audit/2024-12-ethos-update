export function removeMentionFromUsername(username: string) {
  if (username.startsWith('@')) {
    return username.substring(1);
  }

  return username;
}
