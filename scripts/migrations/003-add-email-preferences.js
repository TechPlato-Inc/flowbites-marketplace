export const id = '003-add-email-preferences';
export const description = 'Backfill users.emailPreferences defaults for existing users.';

const defaults = {
  orderConfirmations: true,
  reviewNotifications: true,
  promotionalEmails: false,
  weeklyDigest: false,
  newFollowerAlert: true,
};

export async function up({ mongoose }) {
  const users = mongoose.connection.collection('users');

  const results = await Promise.all([
    users.updateMany(
      { emailPreferences: { $exists: false } },
      { $set: { emailPreferences: defaults } }
    ),
    users.updateMany(
      { 'emailPreferences.orderConfirmations': { $exists: false } },
      { $set: { 'emailPreferences.orderConfirmations': defaults.orderConfirmations } }
    ),
    users.updateMany(
      { 'emailPreferences.reviewNotifications': { $exists: false } },
      { $set: { 'emailPreferences.reviewNotifications': defaults.reviewNotifications } }
    ),
    users.updateMany(
      { 'emailPreferences.promotionalEmails': { $exists: false } },
      { $set: { 'emailPreferences.promotionalEmails': defaults.promotionalEmails } }
    ),
    users.updateMany(
      { 'emailPreferences.weeklyDigest': { $exists: false } },
      { $set: { 'emailPreferences.weeklyDigest': defaults.weeklyDigest } }
    ),
    users.updateMany(
      { 'emailPreferences.newFollowerAlert': { $exists: false } },
      { $set: { 'emailPreferences.newFollowerAlert': defaults.newFollowerAlert } }
    ),
  ]);

  return {
    createdPreferenceObject: results[0].modifiedCount,
    orderConfirmationsBackfilled: results[1].modifiedCount,
    reviewNotificationsBackfilled: results[2].modifiedCount,
    promotionalEmailsBackfilled: results[3].modifiedCount,
    weeklyDigestBackfilled: results[4].modifiedCount,
    newFollowerAlertBackfilled: results[5].modifiedCount,
  };
}
