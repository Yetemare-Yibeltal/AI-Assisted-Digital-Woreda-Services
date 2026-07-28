import Service from "./Service";
import Application from "./Application";
import Admin from "./Admin";
import Counter from "./Counter";

export { Service, Application, Admin, Counter };

export type { IService, IServiceStep, IRequiredDocument, IFee } from "./Service";
export type {
  IApplication,
  IApplicantInfo,
  IAddress,
  IUploadedDocument,
  IStatusHistory,
} from "./Application";
export type { IAdmin, IAdminPermissions } from "./Admin";
export type { ICounter } from "./Counter";
