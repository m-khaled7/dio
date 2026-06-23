export default {
    jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
    jwtAccessExpires: "30m",
    jwtRefreshExpires: "7d",
};

