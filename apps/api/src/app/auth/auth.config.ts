export const jwtConstants = {
  secret: process.env.JWT_SECRET,
  jwtTimeoutSeconds: parseInt(process.env.JWT_TIMEOUT_SECONDS || '600'),
  unlockTimeoutSeconds: parseInt(process.env.UNLOCK_TIMEOUT_SECONDS || '600'),
};
