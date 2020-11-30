const AppError = require("./../utils/appError");

const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400);
};

const handleDuplicateFields = err => {
    // const value = err.message.match(/((?=(\\?))\2.)/)[0];
    const value = err.message.match(/{(.*?)}/);
    const message = `Duplicate field value: ${value}. Please use another value`;
    return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
    // console.log(err);
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400);
};

const handleJWTError = () => new AppError('Invalid token. Please login again!', 401);

const handleJWTExpiredError = () => new AppError('Your token has expired! Please login again', 401)

const sendErrorDev = (err, req, res) => {
    console.log(req.originalUrl);
    if (req.originalUrl.startsWith('/api')) {
        res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        });
    } else {
        // RENDERED WEBSITE
        console.error('ERROR !!!', err);
        res.status(err.statusCode).render('error', {
            title: 'Something went wrong!',
            msg: err.message
        });
    }
};

const sendErrorProd = (err, req, res) => {
    // A) API
    if (req.originalUrl.startsWith('/api')) {
        // 1) Operational, trusted error: send message to client
        if (err.isOperational) {
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message
            });
            // Programing or other unknown error: dont leak error details
        }
        // 2) Log error
        console.error('ERROR !!!!!!!', err);
        // Send generic message
        return res.status(500).json({
            status: 'error',
            message: 'Something went wrong!'
        });
    }

    // B) RENDERED WEBSITE
    // 1) Operational, trusted error: send message to client
    if (err.isOperational) {
        return res.status(err.statusCode).render('error', {
            title: 'Something went wrong!',
            msg: err.message
        });
    }

    // 2) Programing or other unknown error: dont leak error details
    console.error('ERROR !!!', err);
    return res.status(err.statusCode).render('error', {
        title: 'Something went wrong!',
        msg: 'Please try again later.'
    });

};


module.exports = (err, req, res, next) => {  // 4 argumena znaci da je error handling middleware
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    if (process.env.NODE_ENV === 'development') {
        // console.log(req.originalUrl);
        sendErrorDev(err, req, res);
    } else if (process.env.NODE_ENV === 'production') {
        let error = { ...err };
        error.message = err.message;
        if (error.name === 'CastError') error = handleCastErrorDB(error);
        // if (err.name === 'CastError') error = handleCastErrorDB(err);
        if (error.code === 11000) error = handleDuplicateFields(err);
        if (err.name === 'ValidationError') error = handleValidationErrorDB(error);
        if (err.name === 'JsonWebTokenError') error = handleJWTError();
        if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

        // console.log(err.message);
        sendErrorProd(error, req, res);
    }
};