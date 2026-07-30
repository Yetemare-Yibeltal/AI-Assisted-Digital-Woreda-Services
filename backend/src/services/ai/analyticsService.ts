import AIUsage from "../../models/ai/AIUsage";
import AIAnalytics from "../../models/ai/AIAnalytics";

export const logUsage = async (
  userId: string,
  feature: string,
  model: string,
  responseTime: number,
  status: "success" | "error",
  errorMessage?: string
) => {
  await AIUsage.create({
    userId,
    feature,
    model,
    responseTime,
    status,
    errorMessage,
    timestamp: new Date(),
  });
};

export const getAnalytics = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [totalRequests, requestsToday, byFeature, recentUsage] = await Promise.all([
    AIUsage.countDocuments(),
    AIUsage.countDocuments({ timestamp: { $gte: today } }),
    AIUsage.aggregate([{ $group: { _id: "$feature", count: { $sum: 1 } } }]),
    AIUsage.find()
      .sort({ timestamp: -1 })
      .limit(10)
      .select("userId feature model responseTime status timestamp")
      .lean(),
  ]);

  const featureCounts: Record<string, number> = {};
  byFeature.forEach((f: any) => {
    featureCounts[f._id] = f.count;
  });

  const successCount = await AIUsage.countDocuments({ status: "success" });
  const totalCount = await AIUsage.countDocuments();
  const successRate = totalCount > 0 ? Math.round((successCount / totalCount) * 100) : 100;

  const avgResponseTimeResult = await AIUsage.aggregate([
    { $match: { status: "success" } },
    { $group: { _id: null, avg: { $avg: "$responseTime" } } },
  ]);
  const averageResponseTime = avgResponseTimeResult[0]?.avg || 0;

  return {
    totalRequests,
    requestsToday,
    byFeature: featureCounts,
    averageResponseTime: Math.round(averageResponseTime),
    successRate,
    recentUsage,
  };
};

export default { logUsage, getAnalytics };
