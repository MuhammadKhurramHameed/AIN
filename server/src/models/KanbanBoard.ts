import { Schema, model, Types, Document } from "mongoose";

export interface IKanbanColumn {
  id: string;
  name: string;
  order: number;
}

export interface IKanbanBoard extends Document {
  name: string;
  scope: "content" | "consortium" | "track_rollout" | "general";
  ownerId: Types.ObjectId;
  columns: IKanbanColumn[];
  createdAt: Date;
  updatedAt: Date;
}

const columnSchema = new Schema<IKanbanColumn>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    order: { type: Number, required: true },
  },
  { _id: false }
);

const schema = new Schema<IKanbanBoard>(
  {
    name: { type: String, required: true, trim: true },
    scope: {
      type: String,
      enum: ["content", "consortium", "track_rollout", "general"],
      default: "general",
    },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    columns: {
      type: [columnSchema],
      default: [
        { id: "backlog", name: "Backlog", order: 0 },
        { id: "in_progress", name: "In Progress", order: 1 },
        { id: "review", name: "Review", order: 2 },
        { id: "done", name: "Done", order: 3 },
      ],
    },
  },
  { timestamps: true }
);

export const KanbanBoard = model<IKanbanBoard>("KanbanBoard", schema);
