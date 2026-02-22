import mongoose from "mongoose";

const dealSchema = new mongoose.Schema(
  {
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    stage: {
      type: String,
      enum: ["Prospect", "Negotiation", "Won", "Lost"],
      default: "Prospect",
    },
    closeDate: {
      type: Date,
    },
  },
  { timestamps: true },
);

const Deal = mongoose.model("Deal", dealSchema);

export default Deal;
