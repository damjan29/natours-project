const multer = require('multer');
const sharp = require('sharp');
const AppError = require('../utils/appError');
const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');


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

exports.uploadTourImages = upload.fields([
    { name: 'imageCover', maxCount: 1 },
    { name: 'images', maxCount: 3 }
]);

// upload.single('image') // upload samo jedne slike
// upload.array('images', 5);  // za uploadovanje vise slike sa istim imenom

exports.resizeTourImages = catchAsync(async (req, res, next) => {
    console.log(req.files)
    if (!req.files.imageCover || !req.files.images) return next();

    // 1) Cover image 
    req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
    await sharp(req.files.imageCover[0].buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${req.body.imageCover}`);

    // 2) Images
    req.body.images = [];
    await Promise.all(req.files.images.map(async (file, i) => {
        const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
        await sharp(file.buffer)
            .resize(2000, 1333)
            .toFormat('jpeg')
            .jpeg({ quality: 90 })
            .toFile(`public/img/tours/${filename}`);

        req.body.images.push(filename)
    })
    );

    console.log(req.body);
    next();
});


exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary, difficulty';
    next();
};

exports.getAllTours = factory.getAll(Tour);

// exports.getAllTours = async (req, res) => {
//     try {
//         // EXECUTE QUERY
//         const features = new APIFeatures(Tour.find(), req.query)
//             .filter()
//             .sort()
//             .limitFields()
//             .paginate();
//         const tours = await features.query;

//         res.status(200).json({
//             status: 'success',
//             result: tours.length,
//             data: {
//                 tours: tours
//             }
//         });
//     } catch (err) {
//         res.status(404).json({
//             status: 'fail',
//             message: err
//         });
//     }
// };


exports.getTour = factory.getOne(Tour, { path: 'reviews' })
// exports.getTour = catchAsync(async (req, res, next) => {
//     const tour = await Tour.findById(req.params.id).populate('reviews');

//     if (!tour) {
//         return next(new AppError(`Nou tour found with that ID`, 404))
//     }

//     res.status(200).json({
//         status: 'success',
//         data: {
//             tour
//         }
//     });
//     // try {
//     //     const tour = await Tour.findById(req.params.id);
//     //     // Tour.findOne({_id: req.params.id})

//     //     res.status(200).json({
//     //         status: 'success',
//     //         data: {
//     //             tour
//     //         }
//     //     });
//     // } catch (err) {
//     //     res.status(404).json({
//     //         status: 'fail',
//     //         message: err
//     //     });
//     // }
// });


exports.createTour = factory.createOne(Tour);
// exports.createTour = catchAsync(async (req, res, next) => {
//     const newTour = await Tour.create(req.body);
//     res.status(201).json({
//         status: 'succes',
//         data: {
//             tour: newTour
//         }
//     });
//     // try {
//     //      const newTour = new Tour({})
//     //      newTour.save();      Old way of creating
//     // res.status(201).json({
//     //     status: 'succes',
//     //     data: {
//     //         tour: newTour
//     //     }
//     //});
//     // } catch (err) {
//     //     res.status(400).json({
//     //         status: 'fail',
//     //         message: err
//     //     })
//     // }
// });

exports.updateTour = factory.updateOne(Tour);

// exports.updateTour = catchAsync(async (req, res) => {
//     const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//         new: true,
//         runValidators: true
//     });

//     if (!tour) {
//         return next(new AppError(`Nou tour found with that ID`, 404))
//     }

//     res.status(200).json({
//         status: 'success',
//         data: {
//             tour
//         }
//     });
//     // try {
//     //     const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//     //         new: true,
//     //         runValidators: true
//     //     });

//     //     if (!tour) {
//     //         return next(new AppError(`Nou tour found with that ID`, 404))
//     //     }
//     //     res.status(200).json({
//     //         status: 'success',
//     //         data: {
//     //             tour
//     //         }
//     //     });
//     // } catch (err) {
//     //     res.status(404).json({
//     //         status: 'fail',
//     //         message: err
//     //     });
//     // }
// });


exports.deleteTour = factory.deleteOne(Tour);



// exports.deleteTour = catchAsync(async (req, res) => {
//     const tour = await Tour.findByIdAndDelete(req.params.id);

//     if (!tour) {
//         return next(new AppError(`Nou tour found with that ID`, 404))
//     }

//     res.status(204).json({
//         status: 'success',
//         data: null
//     });
//     // try {
//     //     const tour = await Tour.findByIdAndDelete(req.params.id);
//     //     res.status(204).json({
//     //         status: 'success',
//     //         data: null
//     //     });
//     // } catch (err) {
//     //     res.status(404).json({
//     //         status: 'fail',
//     //         message: err
//     //     });
// });

exports.getTourStats = async (req, res) => {
    try {
        const stats = await Tour.aggregate([
            {
                $match: { ratingsAverage: { $gte: 4.5 } }
            },
            {
                $group: {
                    _id: { $toUpper: '$difficulty' },
                    numTours: { $sum: 1 },
                    numOfRatings: { $sum: '$ratingsQuantity' },
                    avgRating: { $avg: '$ratingsAverage' },
                    avgPrice: { $avg: '$price' },
                    minPrice: { $min: '$price' },
                    maxPrice: { $max: '$price' }
                }
            },
            {
                $sort: { avgPrice: 1 }
            }
        ]);

        res.status(200).json({
            status: 'success',
            data: {
                stats
            }
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
}


exports.getMonthlyPlan = async (req, res) => {
    try {
        const year = req.params.year * 1;

        const plan = await Tour.aggregate([
            {
                $unwind: '$startDates'
            },
            {
                $match: {
                    startDates: {
                        $gte: new Date(`${year} -01 - 01`),
                        $lte: new Date(`${year} -12 - 31`),
                    }
                }
            },
            {
                $group: {
                    _id: { $month: '$startDates' },
                    numOfToursStarts: { $sum: 1 },
                    tours: { $push: '$name' }

                }
            },
            {
                $addFields: { month: '$_id' }
            },
            {
                $project: {
                    _id: 0
                }
            },
            {
                $sort: { numOfToursStarts: -1 }
            },
            {
                $limit: 12
            }
        ]);

        res.status(200).json({
            stats: 'success',
            data: {
                plan
            }
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        })
    }
};

// /tours-distance/233/center/42.441728, 19.252706/unit/mi
exports.getToursWithin = catchAsync(async (req, res, next) => {
    const { distance, latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');

    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

    if (!lat || !lng) {
        next(new AppError('Please provide latitude and longtitude in format lat, lng.', 400))
    }

    const tours = await Tour.find({
        startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
    })

    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            data: tours
        }
    })
});


exports.getDistances = catchAsync(async (req, res, next) => {
    const { distance, latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');

    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

    if (!lat || !lng) {
        next(new AppError('Please provide latitude and longtitude in format lat, lng.', 400))
    }

    const distances = await Tour.aggregate([
        {
            $geoNear: {
                near: {
                    type: 'Point',
                    coordinates: [lng * 1, lat * 1]
                },
                distanceField: 'distance',
                distanceMultiplier: multiplier
            }
        },
        {
            $project: {
                distance: 1,
                name: 1
            }
        }
    ])


    res.status(200).json({
        status: 'success',
        data: {
            data: distances
        }
    });

});