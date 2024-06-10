const catchAsync = require('./CatchAsync');
const AppError = require('./AppError');

// get all cabins
exports.getAll = (Model) => {
  return catchAsync(async (req, res, next) => {
    try {
      const data = await Model.find();
      if (!data)
        res.status(404).json({
          status: 'success',
          data: null,
        });

      res.status(200).json({
        status: 'success',
        data: data,
      });
    } catch (err) {
      next(
        new AppError('Something went wrong with Cabin Data in the server', 404)
      );
    }
  });
};

// get a cabin

exports.getOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    try {
      const data = await Model.findById(req.params);
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

// create cabin

exports.addOne = (Model) => {
  return catchAsync(async (req, res, next) => {
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

// Update Cabin

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

// Delete Cabin

exports.deleteOne = (Model) => {
  catchAsync(async (req, res, next) => {
    try {
      const data = await Model.findByIdAndDelete(req.params.id);
      if (!data) {
        next(new AppError('Sorry, No data found', 404));
      }

      res.status(200).json({
        status: 200,
        data: null,
      });
    } catch (err) {
      next(
        new AppError('Inernal server Error, Could not delete the cabin', 400)
      );
    }
  });
};
