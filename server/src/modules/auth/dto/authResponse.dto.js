export function toUserDTO(user) {
  const data = user.toJSON ? user.toJSON() : user;
  return {
    _id: data._id,
    name: data.name,
    email: data.email,
    role: data.role,
    avatar: data.avatar || null,
    bio: data.bio || null,
    emailVerified: data.emailVerified || false,
    isActive: data.isActive,
    createdAt: data.createdAt,
  };
}

export function toAuthResponseDTO(result) {
  return {
    user: toUserDTO(result.user),
    accessToken: result.accessToken,
  };
}
