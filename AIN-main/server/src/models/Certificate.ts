import { Schema, model, Types, Document } from "mongoose";
import crypto from "crypto";

export interface ICertificate extends Document {
  userId: Types.ObjectId;
  courseId: Types.ObjectId;
  verificationCode: string;
  issuedAt: Date;
}

const schema = new Schema<ICertificate>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true, index: true },
  verificationCode: {
    type: String,
    required: true,
    unique: true,
    default: () => crypto.randomBytes(8).toString("hex"),
  },
  issuedAt: { type: Date, default: Date.now },
});

schema.index({ userId: 1, courseId: 1 }, { unique: true });

export const Certificate = model<ICertificate>("Certificate", schema);
