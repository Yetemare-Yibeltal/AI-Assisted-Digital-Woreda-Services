import mongoose, { Schema, Document } from "mongoose";

export interface ICounter extends Document {
  name: string;
  sequence: number;
  prefix: string;
  description: string;
}

const CounterSchema = new Schema<ICounter>(
  {
    name: {
      type: String,
      required: [true, "Counter name is required"],
      unique: true,
      trim: true,
    },
    sequence: {
      type: Number,
      default: 0,
      min: 0,
    },
    prefix: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

CounterSchema.static("getNextSequence", async function (counterName: string): Promise<number> {
  const counter = await this.findOneAndUpdate(
    { name: counterName },
    { $inc: { sequence: 1 } },
    { new: true, upsert: true, returnDocument: "after" }
  );
  return counter.sequence;
});

CounterSchema.static("generateId", async function (counterName: string): Promise<string> {
  const counter = await this.findOne({ name: counterName });
  if (!counter) {
    const newCounter = await this.create({
      name: counterName,
      prefix: counterName.substring(0, 3).toUpperCase(),
      sequence: 1,
      description: `Auto-created counter for ${counterName}`,
    });
    const paddedSeq = String(newCounter.sequence).padStart(6, "0");
    return `${newCounter.prefix}-${paddedSeq}`;
  }
  const sequence = await this.getNextSequence(counterName);
  const paddedSeq = String(sequence).padStart(6, "0");
  return `${counter.prefix}-${paddedSeq}`;
});

const Counter = mongoose.model<ICounter>("Counter", CounterSchema);

export default Counter;
