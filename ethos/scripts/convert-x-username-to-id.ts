/* eslint-disable no-console */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { chunk } from 'lodash-es';
import { echoClient, setEchoConfig } from '@ethos/echo-client';
import { echoUrlMap } from '@ethos/env';

// Fetch data from testnet as it has most of the users there. Eventually we can
// switch to prod API when testnet will be shut down.
setEchoConfig({
  baseUrl: echoUrlMap.testnet,
});

const INPUT_PATH = './.cache/usernames.txt';
const OUTPUT_PATH = './.cache/username-to-id.csv';
const CHUNK_SIZE = 20;

async function run(): Promise<void> {
  if (!existsSync(INPUT_PATH)) {
    console.error(
      `❌ Input file "${INPUT_PATH}" not found. Create this file and put usernames, each on a separate line.\n`,
    );
    console.log('ℹ️ Example:\n\nusername1\nusername2\nusername3\n');
    process.exit(1);
  }

  const content = readFileSync(INPUT_PATH, 'utf-8');
  const usernames = content.split('\n').filter(Boolean);

  console.log(`\n⏳ Started processing ${usernames.length} usernames...\n`);

  const usernameToId = new Map<string, string>();

  for (const usernamesChunk of chunk(usernames, CHUNK_SIZE)) {
    await Promise.all(
      usernamesChunk.map(async (username) => {
        try {
          const twitterUser = await echoClient.twitter.user.get({ username });

          if (twitterUser) {
            usernameToId.set(username, twitterUser.id);
          } else {
            console.warn(`⚠️ User not found for "${username}"`);
          }
        } catch (err) {
          console.warn(`⚠️ User not found for "${username}"`);
        }
      }),
    );
  }

  const csvHeader = 'username,id';
  const csvContent = usernames.map((username) => `${username},${usernameToId.get(username) ?? ''}`);

  writeFileSync(OUTPUT_PATH, [csvHeader, ...csvContent].join('\n'));

  console.log(`\n✅ Successfully converted ${usernameToId.size}/${usernames.length} usernames.`);
  console.log(`📄 Output saved to "${OUTPUT_PATH}"`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
