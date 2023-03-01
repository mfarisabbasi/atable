import mongoose from "mongoose";

const restaurantSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    cuisine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cuisine",
    },
    address: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      match: [
        /^(00212|\+212)(5|6|7)[0-9]{8}$/,
        "Please enter a valid Morocco phone number",
      ],
    },
    openingHours: [
      {
        day: { type: String },
        time: { type: String }
      }
    ],
    closingHours: [
      {
        day: { type: String },
        time: { type: String }
      }
    ],
    images: [{ type: String }],
    reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        rating: {
          type: Number,
          required: true,
        },
      },
    ],
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
    menu: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Menu",
      },
    ],
    reservations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Reservation",
      },
    ],
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ResOwner",
    },
    auto_approve: {
      type: Boolean,
      default: false,
    },
    subscription: {
      type: String,
      enum: ["Premium", "Advanced", "Basic"],
      default: "Basic",
    },
    totalTables: {
      type: Number
    },
    tablesDetails:
      [
        {
          capacity: {
            type: Number,
          },
          quantity: {
            type: Number
          }
        }
      ],
  },
  {
    timestamps: true,
  }
);

restaurantSchema.pre('save', function (next) {
  const totalTables = this.tablesDetails.reduce((acc, table) => acc + table.quantity, 0);
  this.totalTables = totalTables;
  next();
});
const Restaurant = mongoose.model("Restaurant", restaurantSchema);
export default Restaurant;
