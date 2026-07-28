import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICounter extends Document {
  name: string;
  sequence: number;
  prefix: string;
  description: string;
}

interface ICounterModel extends Model<ICounter> {
  getNextSequence(counterName: string): Promise<number>;
  generateId(counterName: string): Promise<string>;
}

const CounterSchema = new Schema<ICounter, ICounterModel>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    sequence: { type: Number, default: 0, min: 0 },
    prefix: { type: String, required: true, uppercase: true, trim: true },
    description: { type: String, default: "" },
  },
  { timestamps: true }
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
  const sequence = await (this as ICounterModel).getNextSequence(counterName);
  const paddedSeq = String(sequence).padStart(6, "0");
  return `${counter.prefix}-${paddedSeq}`;
});

const Counter = mongoose.model<ICounter, ICounterModel>("Counter", CounterSchema);
export default Counter;
