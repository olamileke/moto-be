

module.exports = (req, res, next) => {
    if(!req.user.admin) {
        const error = new Error('you are unauthorized');
        error.statusCode = 403;
        throw error;
    }

    next();
}