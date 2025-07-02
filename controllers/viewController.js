const Tour = require('../models/tourModels');
const catchAsync = require('../utils/catchAsync');

exports.getOverview = catchAsync(async (req, res) => {
  //1)GET TOUR DATA FROM COLLECTION
  const tours = await Tour.find();

  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res) => {
  //1) GET THE DATA, FOR THE REQUESTED TOUR(INCLUDING REVIEWS AND GUIDES)

  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  //2)BUILD THE TEMPLATE

  //3)RENDER TEMPLATE USING DATA FROM 1)
  res.status(200).render('tour', {
    tour,
  });
});
