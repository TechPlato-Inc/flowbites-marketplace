/**
 * Shape a follower document into a DTO suitable for "list followers of a creator".
 * Expects `followerId` to be populated with { name, avatar }.
 */
export function toFollowerDTO(doc) {
  return {
    _id: doc._id,
    followerId: doc.followerId
      ? {
          _id: doc.followerId._id || doc.followerId,
          name: doc.followerId.name || null,
          avatar: doc.followerId.avatar || null,
        }
      : doc.followerId,
    creatorId: doc.creatorId,
    createdAt: doc.createdAt,
  };
}

/**
 * Shape a follower document into a DTO suitable for "list who I follow".
 * Expects `creatorId` to be populated with { name, avatar } from User,
 * and an optional `creatorProfile` enrichment attached by the service.
 */
export function toFollowingDTO(doc) {
  return {
    _id: doc._id,
    creatorId: doc.creatorId
      ? {
          _id: doc.creatorId._id || doc.creatorId,
          displayName: doc.creatorProfile?.displayName || doc.creatorId.name || null,
          username: doc.creatorProfile?.username || null,
          avatar: doc.creatorProfile?.avatar || doc.creatorId.avatar || null,
        }
      : doc.creatorId,
    createdAt: doc.createdAt,
  };
}
