import { Schema, model, Types, Document } from "mongoose";

export interface IKanbanCard extends Document {
  boardId: Types.ObjectId;
  columnId: string;
  title: string;
  description?: string;
  assigneeId?: Types.ObjectId;
  priority: "low" | "medium" | "high";
  dueDate?: Date;
  order: number;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<IKanbanCard>(
  {
    boardId: { type: Schema.Types.ObjectId, ref: "KanbanBoard", required: true, index: true },
    columnId: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String },
    assigneeId: { type: Schema.Types.ObjectId, ref: "User" },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    dueDate: { type: Date },
    order: { type: Number, default: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const KanbanCard = model<IKanbanCard>("KanbanCard", schema);
