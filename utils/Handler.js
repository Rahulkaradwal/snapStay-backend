const catchAsync = require('./CatchAsync');
const AppError = require('./AppError');
const QueryFeatures = require('./QueryFeatures');

// get all Model
exports.getAll = (Model) => {
  return catchAsync(async (req, res, next) => {
    let filterVal = {};
    if (req.params.id) filterVal = { _id: req.params.id };

    const features = new QueryFeatures(Model.find(filterVal), req.query)
      .filter()
      .sort()
      .limit()
      .page();

    const data = await features.query;

    // Perform a separate count query without pagination
    const totalResult = await Model.countDocuments(filterVal);

    res.status(200).json({
      status: 'success',
      totalResult,
      data,
    });
  });
};
// get a Model

exports.getOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    try {
      const data = await Model.findById(req.params.id);
      if (!data) {
        res.status(400).json({
          status: 'success',
          data: null,
        });
      }
      res.status(200).json({
        status: 'success',
        data: data,
      });
    } catch (err) {
      next(new AppError('Something went wrong at get data', 400));
    }
  });
};

// create Model

exports.addOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    // console.log('in the add', req.body, req.file);
    try {
      const data = await Model.create(req.body);
      res.status(200).json({
        status: 'success',
        data: data,
      });
    } catch (err) {
      next(new AppError('Could not Add data', 400));
    }
  });
};

// Update Model

exports.updateOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    try {
      const data = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!data) {
        next(new AppError('No data found with that ID', 404));
      }
      res.status(200).json({
        status: 'success',
        data: data,
      });
    } catch (err) {
      next(new AppError('Server Error, Could not update the cabin ', 400));
    }
  });
};

// Delete Model

exports.deleteOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    try {
      const data = await Model.findByIdAndDelete(req.params.id);
      if (!data) {
        return next(new AppError('Sorry, no data found', 404));
      }

      res.status(204).json({
        status: 'success',
        data: null,
      });
    } catch (err) {
      next(
        new AppError('Internal server error, could not delete the cabin', 500)
      );
    }
  });
};
