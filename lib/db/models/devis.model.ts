import mongoose, { Schema, Model } from "mongoose";
import { IDevis, DevisStatus } from "@/types/models.types";

const devisClientSchema = new Schema(
  {
    firstName: {
      type: String,
      required: [true, "Client first name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Client last name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Client email is required"],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    phone: {
      type: String,
      required: [true, "Client phone is required"],
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const devisItemSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
    },
    description: {
      type: String,
      required: [true, "Item description is required"],
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"],
    },
    dimensions: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const devisSchema = new Schema<IDevis>(
  {
    reference: {
      type: String,
      required: true,
      unique: true,
    },
    client: {
      type: devisClientSchema,
      required: [true, "Client information is required"],
    },
    items: {
      type: [devisItemSchema],
      required: [true, "At least one item is required"],
      validate: {
        validator: (items: unknown[]) => items.length > 0,
        message: "At least one item is required",
      },
    },
    status: {
      type: String,
      enum: Object.values(DevisStatus),
      default: DevisStatus.PENDING,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [2000, "Notes cannot exceed 2000 characters"],
    },
    adminNotes: {
      type: String,
      trim: true,
      maxlength: [2000, "Admin notes cannot exceed 2000 characters"],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    estimatedPrice: {
      type: Number,
      min: [0, "Price cannot be negative"],
    },
    estimatedDate: {
      type: Date,
    },
    attachments: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Create indexes (reference already has unique: true, so no duplicate index)
devisSchema.index({ status: 1 });
devisSchema.index({ "client.email": 1 });
devisSchema.index({ userId: 1 });
devisSchema.index({ assignedTo: 1 });
devisSchema.index({ createdAt: -1 });

const Devis: Model<IDevis> =
  mongoose.models.Devis || mongoose.model<IDevis>("Devis", devisSchema);

export default Devis;
