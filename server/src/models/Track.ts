import { Schema, model, Types, Document } from "mongoose";

export interface ITrack extends Document {
  programmeId: Types.ObjectId;
  name: string;
  description?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<ITrack>(
  {
    programmeId: { type: Schema.Types.ObjectId, ref: "Programme", required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// A track name only needs to be unique within its own programme — a second programme
// can reuse category names like "Students & Fresh Graduates" without colliding.
schema.index({ programmeId: 1, name: 1 }, { unique: true });

export const Track = model<ITrack>("Track", schema);
