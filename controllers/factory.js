const APIFeatures = require("../utils/apiFeatures.js");

exports.deleteOne = (Model) => async (req, res, next) => {
  try {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc)
      return res.status(404).send({
        status: "fail",
        message: "No Doc Found With That id",
      });
    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      data: err,
    });
  }
};

exports.updateOne = (Model) => async (req, res, next) => {
  try {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      data: err,
    });
  }
};

exports.createOne = (Model) => async (req, res, next) => {
  try {
    const newDoc = await Model.create(req.body);
    res.status(201).json({
      status: "success",
      data: {
        newDoc,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      data: err,
    });
  }
};
exports.findOne = (Model, popOption) => async (req, res, next) => {
  try {
    let query = Model.findById(req.params.id);
    if (popOption) query = query.populate(popOption);
    const doc = await query;
    if (!doc) {
      //   return next(new AppError("No Document with that id ", 404));
      return res.status(404).send({
        status: "fail",
        message: "No Doc Found With That id",
      });
    }
    res.status(200).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      data: err,
    });
  }
};

exports.findAll = (Model, popOption) => async (req, res, next) => {
  try {
    // for the filtring in the review controller
    let filter = {};
    if (req.params.idProject) filter = { project: req.params.idProject };
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .paginate()
      .sort()
      .limitFields();
    const doc = await features.query.populate(popOption);
    res.status(200).json({
      status: "success",
      result: doc.length,
      data: {
        data: doc,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      data: err,
    });
  }
};
