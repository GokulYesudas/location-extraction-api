var express = require('express');
var router = express.Router();
var path = require('path');
const { exec } = require('child_process');
const { Coordinates } = require('../models/coordinates');


/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Location Extraction' });
});


// sample script running endpoint
router.get('/sample-script-run', (req, res) => {
  const scriptPath = path.join(__dirname, 'salesman.py')

  const args = ["John", 45];

  exec(`python3 ${scriptPath} ${args.join(' ')}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing Python script: ${error.message}`);
      return res.status(500).send('An error occurred while executing the script.');
    }

    console.log('Python script output:', stdout);
    res.status(200).send('Script executed successfully.');
  });

})

/**
 * @swagger
 * components:
 *   schemas:
 *     Coordinate:
 *       type: object
 *       properties:
 *         orderId:
 *           type: string
 *           description: The ID of the order.
 *         latitude:
 *           type: number
 *           description: The latitude coordinate.
 *         longitude:
 *           type: number
 *           description: The longitude coordinate.
 *         phonenum:
 *           type: number
 *           description: The phone number associated with the order (optional).
 *       required:
 *         - orderId
 *         - latitude
 *         - longitude
 */

/**
 * @swagger
 * /getcoordinates/{id}:
 *   get:
 *     summary: Redirects to the URL for the specified order ID and longitude.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the order.*       
 *     responses:
 *       302:
 *         description: Redirect to the specified URL.
 *       500:
 *         description: Server error.
 */
router.get('/getcoordinates/:id', function (req, res, next) {
  res.redirect(`http://localhost:3000/` + req.params.id + req.params.lo);
  // res.render('index', { title: 'Location Extraction' });
});


/**
 * @swagger
 * /savecoordinates:
 *   post:
 *     summary: Save the coordinates for an order.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Coordinate'
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Coordinate'
 *       500:
 *         description: Server error.
 */
router.post('/savecoordinates', async (req, res, next) => {
  try {
    const filter = { orderId: req.body.orderId };
    const update = { ...req.body };
    const options = { new: true, upsert: true };

    const updatedCoordinate = await Coordinates.findOneAndUpdate(filter, update, options);
    console.log(updatedCoordinate)
    return res.status(200).send(updatedCoordinate);
  } catch (err) {
    console.error(err);
    return res.status(500).send({ error: 'Server error' });
  }
});


/**
 * @swagger
 * components:
 *   schemas:
 *     coordinateDetails:
 *       type: object
 *       properties:
 *         orderId:
 *           type: string
 *           description: The ID of the order.
 *         latitude:
 *           type: number
 *           description: The latitude coordinate.
 *         longitude:
 *           type: number
 *           description: The longitude coordinate.
 *         phonenum:
 *           type: number
 *           description: The phone number associated with the order (optional).
 *       required:
 *         - orderId
 *         - latitude
 *         - longitude
 *
 *   responses:
 *     coordinateDetailsResponse:
 *       description: The details of an order.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/coordinateDetails'
 */

/**
 * @swagger
 * /getdetails/{id}:
 *   get:
 *     summary: Retrieve the details for the specified order ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the order.
 *     responses:
 *       200:
 *         description: The details of the order.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/coordinateDetailsResponse'
 *       404:
 *         description: Order not found.
 *       500:
 *         description: Server error.
 */
router.get('/getdetails/:id', async (req, res, next) => {
  try {
    const filter = { orderId: req.params.id };
    const coordinate = await Coordinates.findOne(filter);
    console.log(coordinate)
    return res.status(200).send(coordinate);
  }
  catch (err) {
    console.error(err);
    return res.status(500).send({ error: 'Server error' });

  }
})


// Post method to upload a file to the server
// change the api endpoint to meaningfull
router.post('/upload', function (req, res, next) {

  if (!req.files || !req.files.photo) {
    return res.status(400).send('No file uploaded.');
  }

  const file = req.files.photo;
  file.mv(path.join(__dirname, 'uploads', file.name), function (err) {
    if (err) {
      console.error(err);
      return res.status(500).send('File upload failed.');
    }

    res.send({
      success: true,
      message: 'File uploaded!',
    });
  });
});

module.exports = router;
