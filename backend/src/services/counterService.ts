import Counter, { ICounter } from "../models/Counter";
import { NotFoundError } from "../errors/NotFoundError";
import { AppError } from "../errors/AppError";

const getNextSequence = async (counterName: string): Promise<number> => {
  const counter = await Counter.findOneAndUpdate(
    { name: counterName },
    { $inc: { sequence: 1 } },
    { new: true, upsert: true, returnDocument: "after" }
  );
  return counter.sequence;
};

const getCurrentSequence = async (counterName: string): Promise<number> => {
  const counter = await Counter.findOne({ name: counterName });
  if (!counter) {
    return 0;
  }
  return counter.sequence;
};

const createCounter = async (
  name: string,
  prefix: string,
  description: string = "",
  initialSequence: number = 0
): Promise<ICounter> => {
  const existingCounter = await Counter.findOne({ name });
  if (existingCounter) {
    throw AppError.conflict(`Counter '${name}' already exists`, "DUPLICATE_COUNTER");
  }

  const counter = await Counter.create({
    name,
    prefix: prefix.toUpperCase(),
    description,
    sequence: initialSequence,
  });

  return counter;
};

const resetCounter = async (counterName: string, value: number = 0): Promise<ICounter> => {
  const counter = await Counter.findOneAndUpdate(
    { name: counterName },
    { sequence: value },
    { new: true }
  );

  if (!counter) {
    throw new NotFoundError("Counter", counterName);
  }

  return counter;
};

const generateFormattedId = async (counterName: string, padLength: number = 6): Promise<string> => {
  const counter = await Counter.findOne({ name: counterName });
  if (!counter) {
    throw new NotFoundError("Counter", counterName);
  }

  const sequence = await getNextSequence(counterName);
  const paddedSeq = String(sequence).padStart(padLength, "0");
  return `${counter.prefix}-${paddedSeq}`;
};

const bulkCreateCounters = async (
  counters: Array<{ name: string; prefix: string; description?: string; initialSequence?: number }>
): Promise<ICounter[]> => {
  const operations = counters.map((counter) => ({
    updateOne: {
      filter: { name: counter.name },
      update: {
        $setOnInsert: {
          name: counter.name,
          prefix: counter.prefix.toUpperCase(),
          description: counter.description || "",
          sequence: counter.initialSequence || 0,
        },
      },
      upsert: true,
    },
  }));

  await Counter.bulkWrite(operations);

  const createdCounters = await Counter.find({
    name: { $in: counters.map((c) => c.name) },
  });

  return createdCounters;
};

const getAllCounters = async (): Promise<ICounter[]> => {
  const counters = await Counter.find().sort({ name: 1 }).lean();
  return counters as unknown as ICounter[];
};

const deleteCounter = async (counterName: string): Promise<void> => {
  const counter = await Counter.findOneAndDelete({ name: counterName });
  if (!counter) {
    throw new NotFoundError("Counter", counterName);
  }
};

const getCounterStats = async (): Promise<{
  totalCounters: number;
  counters: Array<{ name: string; prefix: string; sequence: number }>;
}> => {
  const counters = await Counter.find()
    .select("name prefix sequence description")
    .sort({ name: 1 })
    .lean();

  return {
    totalCounters: counters.length,
    counters: counters.map((c) => ({
      name: c.name,
      prefix: c.prefix,
      sequence: c.sequence,
    })),
  };
};

const initializeDefaultCounters = async (): Promise<void> => {
  const defaultCounters = [
    { name: "application", prefix: "APP", description: "Application ID counter" },
    { name: "tracking", prefix: "DNG", description: "Citizen tracking number counter" },
    { name: "employee", prefix: "EMP", description: "Employee ID counter" },
    { name: "document", prefix: "DOC", description: "Document reference counter" },
    { name: "invoice", prefix: "INV", description: "Invoice number counter" },
    { name: "case", prefix: "CASE", description: "Case file number counter" },
  ];

  await bulkCreateCounters(defaultCounters);
};

export {
  getNextSequence,
  getCurrentSequence,
  createCounter,
  resetCounter,
  generateFormattedId,
  bulkCreateCounters,
  getAllCounters,
  deleteCounter,
  getCounterStats,
  initializeDefaultCounters,
};

export default {
  getNextSequence,
  getCurrentSequence,
  createCounter,
  resetCounter,
  generateFormattedId,
  bulkCreateCounters,
  getAllCounters,
  deleteCounter,
  getCounterStats,
  initializeDefaultCounters,
};
