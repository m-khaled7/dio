export interface JwtPayload {
  sub: string;   // user id
  email: string;
  iat?: number;  // issued at
  exp?: number;  // expiry
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}
