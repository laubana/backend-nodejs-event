import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    date: { type: String, required: true },
    imageUrl: { type: String, required: true },
    isFeatured: { type: Boolean, required: true, default: false },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models["Event"] || mongoose.model("Event", eventSchema);
