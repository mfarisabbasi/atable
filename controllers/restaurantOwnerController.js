// Packages Import
import asyncHandler from "express-async-handler";

// Models Import
import ResOwner from "../models/restaurant/resOwnerModel.js";
import Restaurant from "../models/restaurant/restaurantModel.js";
import Menu from "../models/restaurant/menuModel.js";
import MenuItem from "../models/restaurant/menuItemModel.js";

// Functions Import
import { generateToken } from "../functions/tokenFunctions.js";

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
// @route ANY /api/v1/restaurant/owner/show/todayreservations
// @access Private/RestaurantOwners
const getTodayBookings = asyncHandler(async (req, res) => {
  try {

    const Bookings = await Reservation.aggregate([
      {
        $match: {
          '$details.date': { $gte: new Date().setHours(0, 0, 0, 0), $lt: new Date().setHours(23, 59, 59, 999) }
        }
      }
    ])
    if (Bookings.length === 0) {
      return res.status(200).json({ message: "No Bookings found today." })
    } else {
      const filterBookings = Bookings.filter(x => x.restaurant === req.user.restaurants)
      return res.status(200).json({ filterBookings });
    }
  }
  catch (error) {
    return res.status(400).json(error)
  }
})
const checkMonthlyReservation = asyncHandler(async (req, res) => {
  try {
    let monthBookings = []

    const date = new Date();
    const getMonth = date.getMonth() + 1;
    const getYear = date.getFullYear();

    monthBookings = await Reservation.find({
      '$details.date': {

        $get: new Date(`${getYear}-${getMonth}-01`),
        lte: new Date(`${getYear}-${getMonth}-01`)
      }
    })

    if (!monthBookings || monthBookings.length === 0) {
      return res.status(200).json({ message: "No Reservations for this months..." })
    } else {
      const monthFilter = monthBookings.filter(x => x.restaurant === req.user.restaurants)
      return res.status(200).json({ BookingsFound: monthFilter })
    }
  }
  catch (error) {
    return res.status(400).json(error)
  }

})

// @route ANY /api/v1/restaurant/owner/show/allreservations
// @access Private/RestaurantOwners
const disaplyReservationsRequest = asyncHandler(async (req, res) => {

  let allRes = [];
  try {
    const id = req.user.restaurants;
    allRes = await Reservation.find({
      $and: [
        { reservation_status: true },
        { restaurant: id }
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
})
//@route ANY /api/v1/restaurantowner/reservation/approve
const approveReservationById = asyncHandler(async (req, res) => {

  try {
    const { id } = req.body;
    const res_id = req.user.restaurants;
    const reservation = await Reservation.findOneAndUpdate(
      {
        $and:
          [
            { _id: id }, { restaurant: res_id }
          ]
      },
      { reservation_status: "Approved" },
      { new: true }
    );

    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    const restaurant = await Restaurant.findOneAndUpdate(
      { _id: res_id },
      { $push: { reservations: reservation._id } },
      { new: true }
    );

    if (restaurant) {
      return res.status(200).json({ reservation, message: "reservation approved successfully" })
    }
    else {
      return res.status(400).json({ message: "something bad occurred." })
    }
  }

  catch (error) {
    return res.status(400).json({ error })
  }
})

//@route ANY /api/v1/restaurant/owner/reservation/approve
const cancelReservationById = asyncHandler(async (req, res) => {
  try {
    // Extract reservation ID from request body
    const { id } = req.body;
    // Extract restaurant ID from authenticated user's object
    const res_id = req.user.restaurants;
    // Find the reservation in the database and update its status to "Rejected"
    const reservation = Reservation.findOneAndUpdate(
      {
        $and:
          [
            { _id: id }, { restaurant: res_id }
          ]
      },
      { reservation_status: "Rejected" },
      { new: true }).then(() => {
        // Return JSON response with updated reservation object and success message
        return res.status(200).json({ reservation, message: "reservation cancelled" })
      }).catch((error) => {
        // Return JSON response with error message
        return res.status(400).json({ error })
      })

  }
  catch (error) {
    // Return JSON response with error message
    return res.status(400).json({ error })
  }
})
//@route ANY /api/v1/restaurant/owner/openslots/add
const addRestaurantOpeningSlots = asyncHandler(async (req, res) => {
  try {
    const owner_id = req.user._id;
    // Find the restaurant object owned by the authenticated user
    const findRestaurant = await Restaurant.find({ owner: owner_id })

    if (findRestaurant) {
      // Check if opening hours already exist for the day specified in the request
      const findhours = findRestaurant.openingHours.find(x => x.day === resHours.day);
      if (findhours) {

        findhours.time = resHours.time;
      }
      else {
        // Add the new opening hours for the day to the restaurant object's openingHours array
        findRestaurant.openingHours.push(resHours);
      }

      // Save the updated restaurant object in the database and return a success message in a JSON response
      findRestaurant.save().then(() => {
        return res.status(201).json({ message: "opening slot updated Successfully.." })
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
})

//@route ANY /api/v1/restaurant/owner/closeslots/add
const addRestaurantClosingSlots = asyncHandler(async (req, res) => {
  try {
    const { resHours } = req.body.resHours;
    const owner_id = req.user._id;
    const findRestaurant = await Restaurant.findOne({ owner: owner_id })

    if (findRestaurant) {
      const findhours = findRestaurant.closingHours.find(x => x.day === resHours.day);
      if (findhours) {
        findhours.time = resHours.time;
      }
      else {
        findRestaurant.closingHours.push(resHours);
      }

      findRestaurant.save().then(() => {
        return res.status(201).json({ message: "closing slot updated Successfully.." })
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
})


export {
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
