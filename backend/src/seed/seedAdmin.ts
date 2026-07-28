import mongoose from "mongoose";
import Admin from "../models/Admin";
import connectDB from "../config/database";

const admins = [
  {
    fullName: "Woreda Administrator",
    email: "admin@dangila.gov.et",
    phoneNumber: "0911111111",
    password: "Admin@123456",
    role: "super_admin" as const,
    permissions: {
      canManageServices: true,
      canManageApplications: true,
      canManageAdmins: true,
      canViewReports: true,
      canExportData: true,
      canManageAI: true,
    },
    department: "Woreda Administration",
    position: "Chief Administrator",
    employeeId: "EMP-ADM-0001",
    isActive: true,
    isVerified: true,
  },
  {
    fullName: "Tesfaye Alemu",
    email: "tesfaye.alemu@dangila.gov.et",
    phoneNumber: "0911222222",
    password: "Officer@123456",
    role: "admin" as const,
    permissions: {
      canManageServices: true,
      canManageApplications: true,
      canManageAdmins: false,
      canViewReports: true,
      canExportData: true,
      canManageAI: false,
    },
    department: "Civil Registration",
    position: "Head of Civil Registration",
    employeeId: "EMP-CIV-0001",
    isActive: true,
    isVerified: true,
  },
  {
    fullName: "Mekdes Tadesse",
    email: "mekdes.tadesse@dangila.gov.et",
    phoneNumber: "0911333333",
    password: "Officer@123456",
    role: "admin" as const,
    permissions: {
      canManageServices: true,
      canManageApplications: true,
      canManageAdmins: false,
      canViewReports: true,
      canExportData: true,
      canManageAI: false,
    },
    department: "Land Administration",
    position: "Head of Land Administration",
    employeeId: "EMP-LND-0001",
    isActive: true,
    isVerified: true,
  },
  {
    fullName: "Abebe Kebede",
    email: "abebe.kebede@dangila.gov.et",
    phoneNumber: "0911444444",
    password: "Officer@123456",
    role: "officer" as const,
    permissions: {
      canManageServices: false,
      canManageApplications: true,
      canManageAdmins: false,
      canViewReports: true,
      canExportData: false,
      canManageAI: false,
    },
    department: "Civil Registration",
    position: "Registration Officer",
    employeeId: "EMP-CIV-0002",
    isActive: true,
    isVerified: true,
  },
  {
    fullName: "Tigist Worku",
    email: "tigist.worku@dangila.gov.et",
    phoneNumber: "0911555555",
    password: "Officer@123456",
    role: "officer" as const,
    permissions: {
      canManageServices: false,
      canManageApplications: true,
      canManageAdmins: false,
      canViewReports: true,
      canExportData: false,
      canManageAI: false,
    },
    department: "Business Licensing",
    position: "Licensing Officer",
    employeeId: "EMP-BSN-0001",
    isActive: true,
    isVerified: true,
  },
  {
    fullName: "Dawit Hailu",
    email: "dawit.hailu@dangila.gov.et",
    phoneNumber: "0911666666",
    password: "Officer@123456",
    role: "viewer" as const,
    permissions: {
      canManageServices: false,
      canManageApplications: false,
      canManageAdmins: false,
      canViewReports: true,
      canExportData: false,
      canManageAI: false,
    },
    department: "Woreda Administration",
    position: "Reports Viewer",
    employeeId: "EMP-ADM-0002",
    isActive: true,
    isVerified: true,
  },
];

const seedAdmins = async () => {
  try {
    await connectDB();
    console.log("Connected to MongoDB");

    const existingAdmin = await Admin.findOne({ email: "admin@dangila.gov.et" });

    if (existingAdmin) {
      console.log("Admin accounts already exist. Skipping admin seed.");
      console.log("Use force reseed by deleting existing admins first.");
      process.exit(0);
    }

    await Admin.deleteMany({});
    console.log("Cleared existing admins");

    const createdAdmins = await Admin.create(admins);
    console.log(`Successfully seeded ${createdAdmins.length} admin accounts`);
    console.log("\n--- Admin Login Credentials ---");
    console.log("Super Admin: admin@dangila.gov.et / Admin@123456");
    console.log("Admin: tesfaye.alemu@dangila.gov.et / Officer@123456");
    console.log("Admin: mekdes.tadesse@dangila.gov.et / Officer@123456");
    console.log("Officer: abebe.kebede@dangila.gov.et / Officer@123456");
    console.log("Officer: tigist.worku@dangila.gov.et / Officer@123456");
    console.log("Viewer: dawit.hailu@dangila.gov.et / Officer@123456");
    console.log("------------------------------\n");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding admins:", error);
    process.exit(1);
  }
};

seedAdmins();
