export const jwtConstants = {
  secret: process.env.JWT_SECRET,
  sessionTimeoutSeconds: parseInt(process.env.SESSION_TIMEOUT_SECONDS || '600'),
};
