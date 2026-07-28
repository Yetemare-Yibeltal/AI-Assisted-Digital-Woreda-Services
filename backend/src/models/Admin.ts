import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "../config/index";

export interface IAdminPermissions {
  canManageServices: boolean;
  canManageApplications: boolean;
  canManageAdmins: boolean;
  canViewReports: boolean;
  canExportData: boolean;
  canManageAI: boolean;
}

export interface IAdmin extends Document {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: "super_admin" | "admin" | "officer" | "viewer";
  permissions: IAdminPermissions;
  department: string;
  position: string;
  employeeId: string;
  isActive: boolean;
  isVerified: boolean;
  lastLogin: Date | null;
  loginAttempts: number;
  lockUntil: Date | null;
  refreshToken: string | null;
  passwordChangedAt: Date | null;
  passwordResetToken: string | null;
  passwordResetExpires: Date | null;
  createdBy: mongoose.Types.ObjectId | null;
  profileImage: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateAuthToken(): string;
  generateRefreshToken(): string;
  hasPermission(permission: keyof IAdminPermissions): boolean;
}

interface IAdminModel extends Model<IAdmin> {
  findByCredentials(email: string, password: string): Promise<IAdmin>;
}

const PermissionsSchema = new Schema<IAdminPermissions>({
  canManageServices: { type: Boolean, default: false },
  canManageApplications: { type: Boolean, default: true },
  canManageAdmins: { type: Boolean, default: false },
  canViewReports: { type: Boolean, default: true },
  canExportData: { type: Boolean, default: false },
  canManageAI: { type: Boolean, default: false },
});

const AdminSchema = new Schema<IAdmin, IAdminModel>(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [3, "Full name must be at least 3 characters"],
      maxlength: [100, "Full name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      match: [/^(\+251|0)[9][0-9]{8}$/, "Please provide a valid Ethiopian phone number"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: {
        values: ["super_admin", "admin", "officer", "viewer"],
        message: "Role must be one of: super_admin, admin, officer, viewer",
      },
      default: "officer",
    },
    permissions: {
      type: PermissionsSchema,
      default: () => ({
        canManageServices: false,
        canManageApplications: true,
        canManageAdmins: false,
        canViewReports: true,
        canExportData: false,
        canManageAI: false,
      }),
    },
    department: {
      type: String,
      trim: true,
      default: "General Administration",
    },
    position: {
      type: String,
      trim: true,
      default: "Service Officer",
    },
    employeeId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
      default: null,
    },
    refreshToken: {
      type: String,
      default: null,
      select: false,
    },
    passwordChangedAt: {
      type: Date,
      default: null,
    },
    passwordResetToken: {
      type: String,
      default: null,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      default: null,
      select: false,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
    profileImage: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
AdminSchema.index({ email: 1 });
AdminSchema.index({ role: 1 });
AdminSchema.index({ department: 1, isActive: 1 });

// Virtual: check if account is locked
AdminSchema.virtual("isLocked").get(function () {
  if (!this.lockUntil) return false;
  return this.lockUntil > new Date();
});

// Hash password before saving
AdminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  if (this.isModified("password") && !this.isNew) {
    this.passwordChangedAt = new Date();
  }
  next();
});

// Compare password method
AdminSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Generate access token
AdminSchema.methods.generateAuthToken = function (): string {
  return jwt.sign(
    {
      id: this._id,
      email: this.email,
      role: this.role,
      fullName: this.fullName,
    },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
};

// Generate refresh token
AdminSchema.methods.generateRefreshToken = function (): string {
  return jwt.sign({ id: this._id }, config.jwt.secret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });
};

// Check specific permission
AdminSchema.methods.hasPermission = function (permission: keyof IAdminPermissions): boolean {
  if (this.role === "super_admin") return true;
  return this.permissions[permission] === true;
};

// Static: Find admin by credentials
AdminSchema.statics.findByCredentials = async function (
  email: string,
  password: string
): Promise<IAdmin> {
  const admin = await this.findOne({ email, isActive: true }).select("+password");
  if (!admin) throw new Error("Invalid email or password");
  if (admin.isLocked) throw new Error("Account is temporarily locked. Try again later.");
  const isMatch = await admin.comparePassword(password);
  if (!isMatch) {
    admin.loginAttempts += 1;
    if (admin.loginAttempts >= 5) {
      admin.lockUntil = new Date(Date.now() + 30 * 60 * 1000);
    }
    await admin.save({ validateBeforeSave: false });
    throw new Error("Invalid email or password");
  }
  admin.loginAttempts = 0;
  admin.lockUntil = null;
  admin.lastLogin = new Date();
  await admin.save({ validateBeforeSave: false });
  return admin;
};

const Admin = mongoose.model<IAdmin, IAdminModel>("Admin", AdminSchema);

export default Admin;
export { IAdminPermissions };
