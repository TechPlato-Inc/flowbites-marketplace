export const id = '001-add-user-ban-fields';
export const description = 'Backfill user moderation fields (isBanned/bannedAt/bannedBy/banReason).';

export async function up({ mongoose }) {
  const users = mongoose.connection.collection('users');

  const results = await Promise.all([
    users.updateMany(
      { isBanned: { $exists: false } },
      { $set: { isBanned: false } }
    ),
    users.updateMany(
      { bannedAt: { $exists: false } },
      { $set: { bannedAt: null } }
    ),
    users.updateMany(
      { bannedBy: { $exists: false } },
      { $set: { bannedBy: null } }
    ),
    users.updateMany(
      { banReason: { $exists: false } },
      { $set: { banReason: null } }
    ),
  ]);

  return {
    isBannedBackfilled: results[0].modifiedCount,
    bannedAtBackfilled: results[1].modifiedCount,
    bannedByBackfilled: results[2].modifiedCount,
    banReasonBackfilled: results[3].modifiedCount,
  };
}
