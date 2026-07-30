import { Router } from "express";
import {
  getDashboardOverview,
  getStatusDistribution,
  getApplicationTrends,
  getServicePerformance,
  getOfficerWorkload,
  getProcessingTimeAnalytics,
  getCitizenDemographics,
  getRevenueSummary,
  getDeadlines,
  getRecentActivity,
  getPeakAnalysis,
  getExportSummary,
} from "../../controllers/dashboardController";
import { authenticate } from "../../middleware/auth";
import { officerAndAbove } from "../../middleware/roleCheck";

const router = Router();
router.use(authenticate);
router.use(officerAndAbove);

router.get("/overview", getDashboardOverview);
router.get("/status-distribution", getStatusDistribution);
router.get("/trends", getApplicationTrends);
router.get("/service-performance", getServicePerformance);
router.get("/officer-workload", getOfficerWorkload);
router.get("/processing-times", getProcessingTimeAnalytics);
router.get("/citizen-demographics", getCitizenDemographics);
router.get("/revenue", getRevenueSummary);
router.get("/deadlines", getDeadlines);
router.get("/recent-activity", getRecentActivity);
router.get("/peak-analysis", getPeakAnalysis);
router.get("/export", getExportSummary);

export default router;
