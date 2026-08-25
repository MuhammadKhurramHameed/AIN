import { Schema, model, Types, Document } from "mongoose";

export interface IConsortiumPartner extends Document {
  name: string;
  contactEmail?: string;
  contactPhone?: string;
  status: "active" | "inactive";
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<IConsortiumPartner>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    contactEmail: { type: String },
    contactPhone: { type: String },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const ConsortiumPartner = model<IConsortiumPartner>("ConsortiumPartner", schema);
