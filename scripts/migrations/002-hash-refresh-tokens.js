import crypto from 'crypto';

export const id = '002-hash-refresh-tokens';
export const description = 'Hash any plaintext refresh tokens stored in users.refreshTokens[].token.';

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function isSha256Hex(value) {
  return typeof value === 'string' && /^[a-f0-9]{64}$/i.test(value);
}

export async function up({ mongoose }) {
  const users = mongoose.connection.collection('users');
  const cursor = users.find(
    { 'refreshTokens.0': { $exists: true } },
    { projection: { refreshTokens: 1 } }
  );

  const ops = [];
  let scanned = 0;
  let changedUsers = 0;
  let changedTokens = 0;

  while (await cursor.hasNext()) {
    const user = await cursor.next();
    scanned += 1;

    const current = Array.isArray(user.refreshTokens) ? user.refreshTokens : [];
    let mutated = false;

    const nextTokens = current.map(entry => {
      if (!entry || typeof entry !== 'object') return entry;
      if (!entry.token || isSha256Hex(entry.token)) return entry;

      mutated = true;
      changedTokens += 1;
      return { ...entry, token: hashToken(String(entry.token)) };
    });

    if (mutated) {
      changedUsers += 1;
      ops.push({
        updateOne: {
          filter: { _id: user._id },
          update: { $set: { refreshTokens: nextTokens } },
        },
      });
    }
  }

  if (ops.length > 0) {
    await users.bulkWrite(ops, { ordered: false });
  }

  return { scanned, changedUsers, changedTokens };
}
