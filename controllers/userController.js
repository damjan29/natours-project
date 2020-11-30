const multer = require('multer');
const sharp = require('sharp');
const AppError = require('../utils/appError');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');

// const multerStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'public/img/users')
//     },
//     filename: (req, file, cb) => {
//         const ext = file.mimetype.split('/')[1];
//         cb(null, `user-${req.user.id}-${Date.now()}.${ext}`)
//     }
// });

const multerStorage = multer.memoryStorage();


const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new AppError('Not an image! Please upload only images.', 400), false);
    }
}


const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

exports.uploadUserPhoto = upload.single('photo');


exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
    if (!req.file) return next();

    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

    await sharp(req.file.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/users/${req.file.filename}`);

    next();
});


// Function for filtering fields, that are not allowed to update
const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) {
            newObj[el] = obj[el];
        }
    });
    return newObj;
};

exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
}


// exports.getAllUsers = catchAsync(async (req, res, next) => {
//     const users = await User.find();

//     res.status(200).json({
//         status: 'success',
//         result: users.length,
//         data: {
//             users: users
//         }
//     });
// });

exports.createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not defined! Please use /signup instead'
    });
};

exports.updateMe = catchAsync(async (req, res, next) => {
    // 1) Create Error if userPOSTs password data
    if (req.body.password || req.body.passwordConfirm) {
        return next(
            new AppError(
                'This route is not for password updates. Please use /updatePassword',
                400
            ));
    }

    // 2) Filter out unallowed fields that are now allowed to be updated
    const filteredBody = filterObj(req.body, 'name', 'email');
    if (req.file) filteredBody.photo = req.file.filename;


    // 3) Update user document
    const updateUser = await User.findByIdAndUpdate(req.user.id, filteredBody, { new: true, runValidators: true });

    res.status(200).json({
        status: 'success',
        data: {
            user: updateUser
        }
    });
});


exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false });

    res.status(204).json({
        status: 'success',
        data: null
    });
});


// exports.getUser = (req, res) => {
//     res.status(500).json({
//         status: 'error',
//         message: 'This route is not yet defined'
//     });
// };

// exports.updateUser = (req, res) => {
//     res.status(500).json({
//         status: 'error',
//         message: 'This route is not yet defined'
//     });
// };

// exports.deleteUser = (req, res) => {
//     res.status(500).json({
//         status: 'error',
//         message: 'This route is not yet defined'
//     });
// };



// FACTORY FUNCTIONS API'S
exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User); // Do NOT update passwords with this!!
exports.deleteUser = factory.deleteOne(User);


