const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./userModel');
// const validator = require('validator');

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name'],
        unique: true,
        trim: true,
        maxlength: [40, 'A tour name must have less or equal then 40 characters'],
        minlength: [10, 'Tour name must have more or equal then 10 characters!'],
        // validate: [validator.isAlpha, 'Tour name must only contain characters!']
    },
    slug: String,
    duration: {
        type: Number,
        required: [true, 'A tour must have a duration!']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have a group size']
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have a difficulty'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'Diffculty is either: easy, medium, difficult'
        }
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating must be above, 1.0'],
        max: [5, 'Rating must be bellow, 5.0'],
        set: val => Math.round(val * 10) / 10
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a price']
    },
    priceDiscount: {
        type: Number,
        validate: {
            validator: function (val) {
                // this only points to current doucment on NEW document creation
                return val < this.price; // 100 < 200
            },
            message: 'Discount price should be bellow the regular price'
        }
    },
    summary: {
        type: String,
        trim: true,
        required: [true, "A tour must have a desription"]
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, 'A tour must have a cover image']
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    startDates: [Date],
    secretTour: {
        type: Boolean,
        default: false
    },
    startLocation: {
        // GeoJSON
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String
    },
    locations: [
        {
            type: {
                type: String,
                default: 'Point',
                enum: ['Point']
            },
            coordinates: [Number],
            address: String,
            description: String,
            day: Number
        }
    ],
    guides: [  // pomocu ovogo stavljamo id kao referencu na guides(vodiche)
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }
    ]
},
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);


// tourSchema.index({ price: 1 });
tourSchema.index({ price: 1, ratingsAverage: -1 });

tourSchema.index({ startLocation: '2dsphere' });

tourSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7;
});

// Virtual populate
tourSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'tour', // Ovo je ime polja u drugom modelu(Review modelu) gdje se nalazi reference trenutnog modela
    localField: '_id', // id je polje kako se zove u trenutnom(lokalnom) modelu 
    // a u drugom modelu(Revi) se zove tour polje

});

// DOCUMENT MIDDLEWARE: runs before .save() and create()
tourSchema.pre('save', function (next) {
    this.slug = slugify(this.name, { lower: true });
    next();
});

// tourSchema.pre('save', function (next) {
//     console.log('Will save document..');  // this je referenca na doukumnat! 
//     next();
// });

// QUERY MIDDLEWARE
tourSchema.pre(/^find/, function (next) {
    this.find({ secretTour: { $ne: true } });
    next();
});

tourSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'guides',
        selecet: '-__v -passwordChangedAt'
    })
    next();
});

// tourSchema.pre('aggregate', function (next) {
//     this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//     next();
// });

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
