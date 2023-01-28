import mongoose from "mongoose";

const reservationSchema = mongoose.Schema(
  {
    reservationBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    contactNumber: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^(00212|\+212|0)[67]\d{8}$/.test(v);
        },
        message: "{VALUE} is not a valid phone number",
      },
    },
    occasion: {
      type: String,
      required: true,
      enum: ["Normal", "Birthday", "Anniversary", "Date", "Business"],
    },
    totalPersons: { type: Number, required: true },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    specialRequests: {
      type: String,
    },
    reservation_status: {
      type: String,
      required: true,
      default: "Pending",
      enum: ["Pending", "Approved", "Rejected", "Completed"],
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    validate: {
      validator: function (reservation) {
        return Restaurant.findById(reservation.restaurant).then(
          (restaurant) => {
            if (!restaurant) {
              return Promise.reject(new Error("Invalid restaurant id."));
            }
            let restaurantOpeningHours = restaurant.openingHours;
            let day = reservation.date.getDay();
            let isOpen =
              restaurantOpeningHours[day].open <= reservation.time &&
              restaurantOpeningHours[day].close >= reservation.time;
            if (!isOpen) {
              return Promise.reject(
                new Error("Restaurant is closed at this time.")
              );
            }
            return true;
          }
        );
      },
      message: "Restaurant is closed at this time.",
    },
  },
  {
    timestamps: true,
  }
);

const Reservation = mongoose.model("Reservation", reservationSchema);
export default Reservation;
