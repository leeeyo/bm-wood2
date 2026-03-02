import mongoose, { Schema, Model } from "mongoose";

interface IDevisCounter {
  yearMonth: string;
  seq: number;
}

const devisCounterSchema = new Schema<IDevisCounter>(
  {
    yearMonth: {
      type: String,
      required: true,
      unique: true,
    },
    seq: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {}
);

const DevisCounter: Model<IDevisCounter> =
  mongoose.models.DevisCounter || mongoose.model<IDevisCounter>("DevisCounter", devisCounterSchema);

export default DevisCounter;
