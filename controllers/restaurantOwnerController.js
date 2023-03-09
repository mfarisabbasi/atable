// Packages Import
import asyncHandler from "express-async-handler";

// Models Import
import ResOwner from "../models/restaurant/resOwnerModel.js";
import Restaurant from "../models/restaurant/restaurantModel.js";
import Menu from "../models/restaurant/menuModel.js";
import MenuItem from "../models/restaurant/menuItemModel.js";

// Functions Import
import { generateToken } from "../functions/tokenFunctions.js";
import { uploads, delPicture } from "../utils/cloudinary.js";

// @desc Authenticate restaurant owner
// @route POST /api/v1/restaurant/owner/auth
// @access Private/RestaurantOwners
const authResOwner = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const resOwner = await ResOwner.findOne({ email });

    if (resOwner && (await resOwner.matchPassword(password))) {
      return res.status(200).json({
        success: true,
        access_token: generateToken(resOwner._id),
        resOwner_details: {
          id: resOwner._id,
          fullName: resOwner.fullName,
          restaurants: resOwner.restaurants,
          email: resOwner.email,
        },
      });
    } else {
      return res.status(401).json({ error: "Invalid email or password" });
    }
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

// @desc Create a new menu
// @route POST /api/v1/restaurant/owner/menu/new
// @access Private/RestaurantOwners
const createNewMenu = asyncHandler(async (req, res) => {
  try {
    const { name, items, restaurant } = req.body;

    if (!name || !restaurant) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const checkIfRestaurantExist = await Restaurant.findOne({
      _id: restaurant,
    });

    if (!checkIfRestaurantExist) {
      return res.status(404).json({ error: "Restaurant not found" });
    }

    if (checkIfRestaurantExist.owner != req.user) {
      return res.status(401).json({ error: "Access denied" });
    }

    const newMenu = await Menu.create({
      name,
      items,
      restaurant,
    });

    if (!newMenu) {
      return res
        .status(400)
        .json({ error: "Something went wrong while creating new menu" });
    }

    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      restaurant,
      { $push: { menu: newMenu._id } },
      { new: true }
    )
      .populate({ path: "menu", model: "Menu" })
      .populate({ path: "owner", model: "ResOwner", select: "-password" });

    if (updatedRestaurant) {
      return res
        .status(201)
        .json({ success: true, restaurant_details: updatedRestaurant });
    } else {
      return res
        .status(201)
        .json({ error: "Something went wrong while creating new menu" });
    }
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

// @desc Create a new menu item
// @route POST /api/v1/restaurant/owner/menu/item/new
// @access Private/RestaurantOwners
const createNewMenuItem = asyncHandler(async (req, res) => {
  try {
    const { name, description, price, menu } = req.body;

    if (!name || !description || !price || !menu) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const checkIfMenuExist = await Menu.findOne({
      _id: menu,
    }).populate({ path: "restaurant", model: "Restaurant" });

    if (!checkIfMenuExist) {
      return res.status(404).json({ error: "Menu not found" });
    }

    if (checkIfMenuExist.restaurant.owner != req.user) {
      return res.status(401).json({ error: "Access denied" });
    }

    const newMenuItem = await MenuItem.create({
      name,
      description,
      price,
      menu,
    });

    if (!newMenuItem) {
      return res
        .status(400)
        .json({ error: "Something went wrong while creating new menu item" });
    }

    const updatedMenu = await Menu.findByIdAndUpdate(
      menu,
      { $push: { items: newMenuItem._id } },
      { new: true }
    ).populate("items");

    if (updatedMenu) {
      return res.status(200).json({ success: true, menu_details: updatedMenu });
    } else {
      return res
        .status(400)
        .json({ error: "Something went wrong while updating the menu" });
    }
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

// @desc Test Route
// @route ANY /api/v1/restaurant/test
// @access Private/RestaurantOwners
const testResOwner = asyncHandler(async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});


//@desc Show all reservations for current date
// @route GET /api/v1/restaurant/owner/show/todayreservations
// @access Private/RestaurantOwners
const getTodayBookings = asyncHandler(async (req, res) => {
  try {
    const owner_id = req.user._id;
    if (!owner_id) {
      return res.status(401).json({ message: "Session Expired Please login to Continue" })
    }
    const findRestaurant = await Restaurant.findOne({ owner: owner_id })
    if (!findRestaurant) {
      return res.status(403).json({ message: "UnAuthorized" })
    }
    const today = new Date(); // get the current date
    // find all reservations that match the query
    Reservation.find({
      'restaurant': findRestaurant._id,
      'reservation_status': "Approved",
      'details.date': {
        $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
        $lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
      }
    })
      .exec()
      .then((reservations) => {
        if (reservations.length === 0) {
          return res.status(200).json({ message: "No Bookings Found For Today." })
        } else {
          return res.status(200).json({ reservations })
        }
      })
      .catch((error) => {
        console.error(error); // handle any errors
      });
  }
  catch (error) {
    return res.status(400).json(error)
  }
});



//@desc Check Reservations for current month..
// @route GET /api/v1/restaurant/owner/show/monthlyreservations
// @access Private/RestaurantOwner
const checkMonthlyReservation = asyncHandler(async (req, res) => {
  try {
    const owner_id = req.user._id;
    console.log(owner_id)
    if (!owner_id) {
      return res.status(401).json({ message: "Session Expired Please login to Continue" })
    }
    const findRestaurant = await Restaurant.findOne({ owner: owner_id }) // Add 'await' keyword here
    if (!findRestaurant) {
      return res.status(403).json({ message: "UnAuthorized" })
    }
    console.log(findRestaurant)
    const today = new Date();
    Reservation.aggregate([
      {
        $match: {
          'restaurant': findRestaurant._id,
          'reservation_status': 'Approved',
          'details.date': {
            $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
            $lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
          }
        }
      },
      {
        $group: {
          _id: { $month: '$details.date' },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          month: {
            $switch: {
              branches: [
                { case: { $eq: ['$_id', 1] }, then: 'January' },
                { case: { $eq: ['$_id', 2] }, then: 'February' },
                { case: { $eq: ['$_id', 3] }, then: 'March' },
                { case: { $eq: ['$_id', 4] }, then: 'April' },
                { case: { $eq: ['$_id', 5] }, then: 'May' },
                { case: { $eq: ['$_id', 6] }, then: 'June' },
                { case: { $eq: ['$_id', 7] }, then: 'July' },
                { case: { $eq: ['$_id', 8] }, then: 'August' },
                { case: { $eq: ['$_id', 9] }, then: 'September' },
                { case: { $eq: ['$_id', 10] }, then: 'October' },
                { case: { $eq: ['$_id', 11] }, then: 'November' },
                { case: { $eq: ['$_id', 12] }, then: 'December' },
              ],
              default: 'Unknown'
            }
          },
          count: 1,
          _id: 0
        }
      }
    ]).then((result) => {
      if (result.length === 0) {
        return res.status(200).json({ message: "No Reservations Found for any month.." });
      } else {
        return res.status(200).json(result); // return the entire response object
      }
    }).catch((err) => { return res.status(400).json({ err: err }) });


  }
  catch (error) {
    console.log(error);
    return res.status(400).json({ error: "Something went wrong" });
  }
});


//@desc Display All Reservations Requests.
// @route GET /api/v1/restaurant/owner/show/allreservations
// @access Private/RestaurantOwner
const disaplyReservationsRequest = asyncHandler(async (req, res) => {
  try {

    const owner_id = req.user._id;
    if (!owner_id) {
      return res.status(401).json({ message: "Session Expired Please login to Continue" })
    }
    const findRestaurant = await Restaurant.findOne({ owner: owner_id })
    if (!findRestaurant) {
      return res.status(403).json({ message: "UnAuthorized" })
    }
    allRes = await Reservation.find({
      $and: [
        { reservation_status: true },
        { restaurant: findRestaurant._id }
      ]
    })

    if (allRes.length !== 0) {
      return res.status(200).json({ allRes })
    } else {
      return res.status(200).json({ message: "There are no reservations to be approved.." })
    }
  }
  catch (error) {
    return res.status(400).json({ error })
  }
});

//@desc Approve Reservation Request By Id.
// @route POST /api/v1/restaurant/owner/reservation/approve
// @access Private/RestaurantOwner
const approveReservationById = asyncHandler(async (req, res) => {

  try {
    const { id } = req.body;

    const owner_id = req.user._id;

    if (!id) {
      return res.status(400).json({ message: "something bad happened. Please try again." })
    }
    if (!owner_id) {
      return res.status(401).json({ message: "Session Expired Please login to Continue" })
    }
    const findRestaurant = await Restaurant.findOne({ owner: owner_id })

    if (!findRestaurant) {
      return res.status(403).json({ message: "UnAuthorized" })
    }

    const reservation = await Reservation.findOneAndUpdate(
      {
        $and:
          [
            { _id: id }, { restaurant: findRestaurant._id }, { reservation_status: "Pending" }
          ]
      },
      { reservation_status: "Approved" },
      { new: true }
    );
    console.log(reservation);
    if (reservation) {
      const restaurant = await Restaurant.findOneAndUpdate(
        { _id: findRestaurant._id },
        { $push: { reservations: reservation._id } },
        { new: true });

      if (restaurant) {
        return res.status(200).json({ reservation, message: "reservation approved successfully" })
      }
      else {
        return res.status(400).json({ message: "something bad occurred." })
      }
    }
    else {
      return res.status(400).json({ message: "Something bad occured. Try again" })
    }
  }

  catch (error) {
    return res.status(401).json({ error: error })
  }
});


//@desc Cancel Reservation Request By Id.
// @route POST /api/v1/restaurant/owner/reservation/cancel
// @access Private/RestaurantOwner
const cancelReservationById = asyncHandler(async (req, res) => {

  try {
    const { id } = req.body;

    const owner_id = req.user._id;

    if (!id) {
      return res.status(400).json({ message: "something bad happened. Please try again." })
    }
    if (!owner_id) {
      return res.status(401).json({ message: "Session Expired Please login to Continue" })
    }
    const findRestaurant = await Restaurant.findOne({ owner: owner_id })

    if (!findRestaurant) {
      return res.status(403).json({ message: "UnAuthorized" })
    }

    const reservation = await Reservation.findOneAndUpdate(
      {
        $and:
          [
            { _id: id }, { restaurant: findRestaurant._id }, { reservation_status: "Pending" }
          ]
      },
      { reservation_status: "Rejected" },
      { new: true }
    );
    console.log(reservation);
    if (reservation) {
      return res.status(200).json({ reservation, message: "reservation Cancelled" })
    }
    else {
      return res.status(400).json({ message: "Something bad occured. Try again" })
    }
  }
  catch (error) {
    return res.status(401).json({ error: error })
  }
});


//@desc Add Opening Slots For Restaurant for the Specific Day.
// @route POST /api/v1/restaurant/owner/openslots/add
// @access Private/RestaurantOwner
const addRestaurantOpeningSlots = asyncHandler(async (req, res) => {
  try {
    const { day, time } = req.body;
    const owner_id = req.user._id;
    if (!owner_id) {
      return res.status(401).json({ message: "Session Expired Please login to Continue" })
    }
    const findRestaurant = await Restaurant.findOne({ owner: owner_id })

    if (findRestaurant) {
      // Check if opening hours already exist for the day specified in the request
      const findhours = findRestaurant.openingHours.find(x => x.day === day);
      if (findhours) {

        findhours.time = time;
      }
      else {
        // Add the new opening hours for the day to the restaurant object's openingHours array
        findRestaurant.openingHours.push({ day, time });
      }

      // Save the updated restaurant object in the database and return a success message in a JSON response
      findRestaurant.save().then(() => {
        return res.status(201).json({ findRestaurant, message: "opening slot updated Successfully.." })
      }).
        catch(err => { return res.status(400).json({ message: err }) })
    }
    else {

      return res.status(403).json({ message: "unAuthorized..." })
    }
  }
  catch (error) {

    return res.status(400).json({ message: "something bad occured..." })
  }
});

//@desc Add Closing Slots For Restaurant for the Specific Day.
//@route POST /api/v1/restaurant/owner/closeslots/add
// @access Private/RestaurantOwner
const addRestaurantClosingSlots = asyncHandler(async (req, res) => {
  try {
    const { day, time } = req.body;
    const owner_id = req.user._id;
    if (!owner_id) {
      return res.status(401).json({ message: "Session Expired Please login to Continue" })
    }
    const findRestaurant = await Restaurant.findOne({ owner: owner_id })
    if (findRestaurant) {
      const findhours = findRestaurant.closingHours.find(x => x.day === day);
      if (findhours) {
        findhours.time = time;
      }
      else {
        findRestaurant.closingHours.push({ day, time });
      }

      findRestaurant.save().then(() => {
        return res.status(201).json({ findRestaurant, message: "closing slot updated Successfully.." })
      }).
        catch(err => { return res.status(400).json({ message: err }) })


    }
    else {
      return res.status(403).json({ message: "unAuthorized..." })
    }
  }
  catch (error) {
    return res.status(400).json({ message: "something bad occured..." })
  }
});


//@desc A toggle Button for on or of for auto approve.
//@route POST /api/v1/restaurant/owner/reservation/toggle/auto
// @access Private/RestaurantOwner
const toggleAutoApprove = asyncHandler(async (req, res) => {
  try {
    const owner_id = req.user._id;
    if (!owner_id) {
      return res.status(401).json({ message: "Session Expired Please login to Continue" })
    }
    const findRestaurant = await Restaurant.findOne({ owner: owner_id })
    if (!findRestaurant) {
      return res.status(403).json({ message: "UnAuthorized" })
    }
    const ToggleRestaurant = await Restaurant.findOneAndUpdate(
      { owner: owner_id },
      { $set: { auto_approve: !findRestaurant.auto_approve } },
      { new: true }
    );
    if (findRestaurant) {
      return res.status(201).json({ ToggleRestaurant, message: 'Auto Approved Toggled' })
    }
    else {
      return res.status(403).json({ message: 'Something bad occured..' })
    }
  }
  catch (err) {
    return res.status(400).json({ message: err })
  }
});


//@desc route for adding no of tables with capacity
//@route POST /api/v1/restaurant/owner/reservation/add/tables
// @access Private/RestaurantOwner
const addTables = asyncHandler(async (req, res) => {
  try {
    const { capacity, quantity } = req.body;
    console.log(capacity, quantity)
    const owner_id = req.user._id;
    const findRestaurant = await Restaurant.findOne({ owner: owner_id });

    if (findRestaurant) {
      // Check if opening hours already exist for the day specified in the request
      const findtable = findRestaurant.tablesDetails.find(table => table.capacity == capacity);
      console.log(findtable);
      if (findtable) {

        findtable.quantity = quantity + findtable.quantity;
      }
      else {
        // Add the new opening hours for the day to the restaurant object's openingHours array
        findRestaurant.tablesDetails.push({ capacity, quantity });
      }

      // Save the updated restaurant object in the database and return a success message in a JSON response
      findRestaurant.save().then(() => {
        return res.status(201).json({ findRestaurant, message: "table added successfully" })
      }).
        catch(err => { return res.status(400).json({ message: err }) })
    }
    else {

      return res.status(403).json({ message: "unAuthorized..." })
    }
  }
  catch (err) {
    console.log(err);
    return res.status(400).json({ err });
  }
});



//@desc route checking restaurant profile.
//@route GET /api/v1/restaurant/owner/show/profile
// @access Private/RestaurantOwner
const restaurantProfile = asyncHandler(async (req, res) => {
  try {
    const owner_id = req.user._id;
    const findRes = await Restaurant.findOne({ owner: owner_id })

    if (findRes) {
      return res.status(200).json({ findRes })
    } else {
      return res.status(400).json({ error: "UnAuthorized.." })
    }


  } catch (err) {
    return res.status(400).json({ error: err })
  }
})

//@desc route checking restaurant profile.
//@route POST /api/v1/restaurant/owner/add/pictures
// @access Private/RestaurantOwner
const addPictures = asyncHandler(async (req, res) => {
  try {
    const findRestaurant = await Restaurant.findOne({ owner: req.user._id })
    if (findRestaurant) {
      const pictures = await uploads(findRestaurant._id, req.files);
      console.log(pictures);
      findRestaurant.pictures.push(...pictures);
      findRestaurant.save().then(() => {
        return res.status(200).json(findRestaurant);
      }).catch((err) => { return res.status(400).json({ err: err }) });
    }
    else {
      return res.status(403).json({ message: "unAuthorized.." })
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send('Server error');
  }
});

//@desc route checking restaurant profile.
//@route POST /api/v1/restaurant/owner/del/picture
// @access Private/RestaurantOwner
const removePicture = asyncHandler(async (req, res) => {
  try {
    const { publicId } = req.body;
    const result = await delPicture(publicId, req.user._id);
    if (result) {
      // Picture deleted successfully, and MongoDB updated
      return res.status(200).json({ message: "Picture deleted successfully" });
    } else {
      // Picture not deleted successfully
      return res.status(403).json({ message: "Failed to delete picture" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send("Server error");
  }
});
export {
  addPictures,
  removePicture,
  toggleAutoApprove,
  restaurantProfile,
  addTables,
  cancelReservationById,
  addRestaurantOpeningSlots,
  addRestaurantClosingSlots,
  approveReservationById,
  disaplyReservationsRequest,
  checkMonthlyReservation,
  getTodayBookings,
  authResOwner,
  createNewMenu,
  createNewMenuItem,
  testResOwner
};
