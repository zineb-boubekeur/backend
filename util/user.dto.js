exports.toUserDTO = (user) => {
    const { password, ...safeUser } = user;
    return safeUser;
};