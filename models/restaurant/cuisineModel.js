import mongoose from "mongoose";

const cuisineSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Cuisine = mongoose.model("Cuisine", cuisineSchema);
export default Cuisine;
