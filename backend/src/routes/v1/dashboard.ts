import { Router } from "express";
import {
  getDashboardStats,
  getApplicationStatusDistribution,
  getApplicationTrends,
  getServicePopularity,
  getOfficerWorkload,
  getProcessingTimeAnalytics,
  getKebeleDistribution,
  getGenderDistribution,
  getAgeDistribution,
  getMonthlyComparison,
  getUpcomingDeadlines,
  getRecentApplications,
} from "../../controllers/dashboardController";
import { authenticate } from "../../middleware/auth";
import { officerAndAbove } from "../../middleware/roleCheck";

const router = Router();

router.use(authenticate);
router.use(officerAndAbove);

// Overview
router.get("/overview", getDashboardStats);
router.get("/status-distribution", getApplicationStatusDistribution);
router.get("/trends", getApplicationTrends);
router.get("/monthly-comparison", getMonthlyComparison);

// Service & Officer Analytics
router.get("/service-popularity", getServicePopularity);
router.get("/officer-workload", getOfficerWorkload);
router.get("/processing-times", getProcessingTimeAnalytics);

// Demographics
router.get("/kebele-distribution", getKebeleDistribution);
router.get("/gender-distribution", getGenderDistribution);
router.get("/age-distribution", getAgeDistribution);

// Deadlines & Recent
router.get("/upcoming-deadlines", getUpcomingDeadlines);
router.get("/recent-applications", getRecentApplications);

export default router;
