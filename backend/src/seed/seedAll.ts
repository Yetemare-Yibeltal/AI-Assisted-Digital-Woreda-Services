import mongoose from "mongoose";
import connectDB from "../config/database";
import Service from "../models/Service";
import Admin from "../models/Admin";
import Counter from "../models/Counter";
import { initializeDefaultCounters } from "../services/counterService";

const services = [
  {
    name: "Birth Certificate Registration",
    nameAmharic: "የልደት ሰርተፍኬት ምዝገባ",
    slug: "birth-certificate-registration",
    category: "civil_registration",
    description:
      "Register a new birth and obtain an official birth certificate for children born in Dangila Woreda. Required for school enrollment, passport applications, and other legal purposes.",
    descriptionAmharic: "በዳንግላ ወረዳ ውስጥ የተወለዱ ህጻናትን ማስመዝገብ እና ኦፊሴላዊ የልደት ሰርተፍኬት ማግኘት።",
    shortDescription: "Register newborn children and get official birth certificates",
    shortDescriptionAmharic: "አራስ ህጻናትን ያስመዝግቡ እና ኦፊሴላዊ የልደት ሰርተፍኬት ያግኙ",
    icon: "Baby",
    steps: [
      {
        stepNumber: 1,
        title: "Visit Kebele Office",
        titleAmharic: "የቀበሌ ጽህፈት ቤት ይጎብኙ",
        description:
          "Go to your local Kebele administration office to obtain a birth notification letter",
        descriptionAmharic: "የልደት ማሳወቂያ ደብዳቤ ለማግኘት ወደ አካባቢዎ ቀበሌ አስተዳደር ቢሮ ይሂዱ",
        estimatedTime: "1 day",
        officeLocation: "Your Kebele Office",
      },
      {
        stepNumber: 2,
        title: "Complete Application Form",
        titleAmharic: "የማመልከቻ ቅጽ ይሙሉ",
        description:
          "Fill out the birth registration form with parent details and child information",
        descriptionAmharic: "የልደት ምዝገባ ቅጹን በወላጆች እና በህጻኑ መረጃ ይሙሉ",
        estimatedTime: "30 minutes",
        officeLocation: "Woreda Civil Registration Office",
      },
      {
        stepNumber: 3,
        title: "Submit Documents",
        titleAmharic: "ሰነዶችን ያቅርቡ",
        description:
          "Submit the completed form along with required documents to the verification officer",
        descriptionAmharic: "የተሞላውን ቅጽ ከሚያስፈልጉ ሰነዶች ጋር ለማጣሪያ ባለስልጣን ያቅርቡ",
        estimatedTime: "15 minutes",
        officeLocation: "Woreda Civil Registration Office",
      },
      {
        stepNumber: 4,
        title: "Pay Fee",
        titleAmharic: "ክፍያ ይክፈሉ",
        description: "Pay the required registration fee at the designated cashier",
        descriptionAmharic: "የሚፈለገውን የምዝገባ ክፍያ በተመደበው ገንዘብ ተቀባይ ይክፈሉ",
        estimatedTime: "10 minutes",
        officeLocation: "Woreda Finance Office",
      },
      {
        stepNumber: 5,
        title: "Receive Certificate",
        titleAmharic: "ሰርተፍኬት ይቀበሉ",
        description: "Collect the birth certificate after processing (typically 2-3 business days)",
        descriptionAmharic: "ከ2-3 የስራ ቀናት በኋላ የልደት ሰርተፍኬቱን ይቀበሉ",
        estimatedTime: "2-3 days",
        officeLocation: "Woreda Civil Registration Office",
      },
    ],
    requiredDocuments: [
      {
        name: "Birth Notification Letter from Kebele",
        nameAmharic: "ከቀበሌ የተሰጠ የልደት ማሳወቂያ ደብዳቤ",
        description: "Official letter from your Kebele confirming the birth",
        descriptionAmharic: "ልደቱን የሚያረጋግጥ ከቀበሌዎ የተሰጠ ኦፊሴላዊ ደብዳቤ",
        isMandatory: true,
        format: "Original Document",
        maxSize: 5242880,
      },
      {
        name: "Parents ID Cards",
        nameAmharic: "የወላጆች መታወቂያ ካርድ",
        description: "Valid identification cards of both parents",
        descriptionAmharic: "የሁለቱም ወላጆች ትክክለኛ የመታወቂያ ካርድ",
        isMandatory: true,
        format: "Original + Copy",
        maxSize: 5242880,
      },
    ],
    fees: [
      {
        name: "Registration Fee",
        nameAmharic: "የምዝገባ ክፍያ",
        amount: 50,
        currency: "ETB",
        description: "Standard birth registration fee",
      },
      {
        name: "Certificate Fee",
        nameAmharic: "የሰርተፍኬት ክፍያ",
        amount: 30,
        currency: "ETB",
        description: "Fee for the physical certificate",
      },
    ],
    processingTime: "2-3 business days",
    processingTimeAmharic: "ከ2-3 የስራ ቀናት",
    eligibility: "Parents or legal guardians of children born in Dangila Woreda",
    eligibilityAmharic: "በዳንግላ ወረዳ የተወለዱ ህጻናት ወላጆች ወይም ህጋዊ አሳዳጊዎች",
    isActive: true,
    isPopular: true,
    order: 1,
    tags: ["birth", "certificate", "children", "registration"],
  },
  {
    name: "Marriage Certificate Registration",
    nameAmharic: "የጋብቻ ሰርተፍኬት ምዝገባ",
    slug: "marriage-certificate-registration",
    category: "civil_registration",
    description:
      "Register a marriage and obtain an official marriage certificate recognized by the government.",
    descriptionAmharic: "ጋብቻን ያስመዝግቡ እና በመንግስት እውቅና ያለው ኦፊሴላዊ የጋብቻ ሰርተፍኬት ያግኙ።",
    shortDescription: "Register marriages and obtain official marriage certificates",
    shortDescriptionAmharic: "ጋብቻን ያስመዝግቡ እና ኦፊሴላዊ የጋብቻ ሰርተፍኬት ያግኙ",
    icon: "Heart",
    steps: [
      {
        stepNumber: 1,
        title: "Visit Kebele Office",
        titleAmharic: "የቀበሌ ጽህፈት ቤት ይጎብኙ",
        description: "Obtain marriage approval letter from your Kebele administration",
        descriptionAmharic: "ከቀበሌ አስተዳደርዎ የጋብቻ ማጽደቂያ ደብዳቤ ያግኙ",
        estimatedTime: "1 day",
        officeLocation: "Your Kebele Office",
      },
      {
        stepNumber: 2,
        title: "Complete Application",
        titleAmharic: "ማመልከቻ ይሙሉ",
        description: "Fill out the marriage registration form with both spouses details",
        descriptionAmharic: "የጋብቻ ምዝገባ ቅጹን በሁለቱም ተጋቢዎች መረጃ ይሙሉ",
        estimatedTime: "30 minutes",
        officeLocation: "Woreda Civil Registration Office",
      },
      {
        stepNumber: 3,
        title: "Submit with Witnesses",
        titleAmharic: "ከምስክሮች ጋር ያቅርቡ",
        description: "Submit the application with two witnesses present",
        descriptionAmharic: "ማመልከቻውን ከሁለት ምስክሮች ጋር ያቅርቡ",
        estimatedTime: "1 hour",
        officeLocation: "Woreda Civil Registration Office",
      },
      {
        stepNumber: 4,
        title: "Pay Fee and Receive Certificate",
        titleAmharic: "ክፍያ ይክፈሉና ሰርተፍኬት ይቀበሉ",
        description: "Pay the fee and collect your marriage certificate after processing",
        descriptionAmharic: "ክፍያ ይክፈሉና ከተሰራ በኋላ የጋብቻ ሰርተፍኬትዎን ይቀበሉ",
        estimatedTime: "3-5 days",
        officeLocation: "Woreda Civil Registration Office",
      },
    ],
    requiredDocuments: [
      {
        name: "Kebele Marriage Approval Letter",
        nameAmharic: "የቀበሌ የጋብቻ ማጽደቂያ ደብዳቤ",
        description: "Official approval from Kebele administration",
        descriptionAmharic: "ከቀበሌ አስተዳደር የተሰጠ ኦፊሴላዊ ማጽደቂያ",
        isMandatory: true,
        format: "Original Document",
        maxSize: 5242880,
      },
      {
        name: "ID Cards of Both Spouses",
        nameAmharic: "የሁለቱም ተጋቢዎች መታወቂያ ካርድ",
        description: "Valid ID cards for both bride and groom",
        descriptionAmharic: "የሙሽራ እና ሙሽሪት ትክክለኛ መታወቂያ ካርድ",
        isMandatory: true,
        format: "Original + Copy",
        maxSize: 5242880,
      },
    ],
    fees: [
      {
        name: "Marriage Registration",
        nameAmharic: "የጋብቻ ምዝገባ",
        amount: 100,
        currency: "ETB",
        description: "Standard marriage registration fee",
      },
      {
        name: "Certificate Issuance",
        nameAmharic: "የሰርተፍኬት አሰጣጥ",
        amount: 50,
        currency: "ETB",
        description: "Fee for marriage certificate",
      },
    ],
    processingTime: "3-5 business days",
    processingTimeAmharic: "ከ3-5 የስራ ቀናት",
    eligibility: "Couples aged 18 and above residing in Dangila Woreda",
    eligibilityAmharic: "እድሜያቸው 18 እና ከዚያ በላይ የሆኑ በዳንግላ ወረዳ የሚኖሩ ጥንዶች",
    isActive: true,
    isPopular: true,
    order: 2,
    tags: ["marriage", "certificate", "wedding", "registration"],
  },
  {
    name: "Land Title Deed Registration",
    nameAmharic: "የመሬት ይዞታ ማረጋገጫ ምዝገባ",
    slug: "land-title-deed-registration",
    category: "land_administration",
    description:
      "Register your land holding and obtain an official land title deed certificate for rural and urban land in Dangila Woreda.",
    descriptionAmharic: "የመሬት ይዞታዎን ያስመዝግቡ እና ኦፊሴላዊ የመሬት ይዞታ ማረጋገጫ ሰርተፍኬት ያግኙ።",
    shortDescription: "Register land ownership and get title deed certificates",
    shortDescriptionAmharic: "የመሬት ባለቤትነትን ያስመዝግቡ እና የይዞታ ማረጋገጫ ያግኙ",
    icon: "MapPin",
    steps: [
      {
        stepNumber: 1,
        title: "Kebele Verification",
        titleAmharic: "የቀበሌ ማረጋገጫ",
        description: "Get land holding verification from Kebele land administration committee",
        descriptionAmharic: "ከቀበሌ የመሬት አስተዳደር ኮሚቴ የመሬት ይዞታ ማረጋገጫ ያግኙ",
        estimatedTime: "3-5 days",
        officeLocation: "Your Kebele Office",
      },
      {
        stepNumber: 2,
        title: "Land Survey",
        titleAmharic: "የመሬት ቅኝት",
        description: "Request land measurement and boundary survey by woreda land experts",
        descriptionAmharic: "በወረዳ የመሬት ባለሙያዎች የመሬት ልኬት እና የድንበር ቅኝት ይጠይቁ",
        estimatedTime: "1-2 weeks",
        officeLocation: "Woreda Land Administration Office",
      },
      {
        stepNumber: 3,
        title: "Submit Application with Documents",
        titleAmharic: "ማመልከቻ ከሰነዶች ጋር ያቅርቡ",
        description: "Submit completed application with survey report and supporting documents",
        descriptionAmharic: "የተሞላ ማመልከቻ ከቅኝት ሪፖርት እና ደጋፊ ሰነዶች ጋር ያቅርቡ",
        estimatedTime: "1 day",
        officeLocation: "Woreda Land Administration Office",
      },
      {
        stepNumber: 4,
        title: "Pay Fee and Receive Title Deed",
        titleAmharic: "ክፍያ ይክፈሉና የይዞታ ማረጋገጫ ይቀበሉ",
        description: "Pay the registration fee and collect your title deed after processing",
        descriptionAmharic: "የምዝገባ ክፍያ ይክፈሉና ከሂደት በኋላ የይዞታ ማረጋገጫዎን ይቀበሉ",
        estimatedTime: "2-4 weeks",
        officeLocation: "Woreda Land Administration Office",
      },
    ],
    requiredDocuments: [
      {
        name: "Kebele Land Verification Letter",
        nameAmharic: "የቀበሌ የመሬት ማረጋገጫ ደብዳቤ",
        description: "Official verification from Kebele land committee",
        descriptionAmharic: "ከቀበሌ የመሬት ኮሚቴ የተሰጠ ኦፊሴላዊ ማረጋገጫ",
        isMandatory: true,
        format: "Original Document",
        maxSize: 5242880,
      },
      {
        name: "Applicant ID Card",
        nameAmharic: "የአመልካች መታወቂያ ካርድ",
        description: "Valid Kebele ID or National ID",
        descriptionAmharic: "ትክክለኛ የቀበሌ መታወቂያ ወይም ብሄራዊ መታወቂያ",
        isMandatory: true,
        format: "Original + Copy",
        maxSize: 5242880,
      },
    ],
    fees: [
      {
        name: "Land Registration Fee",
        nameAmharic: "የመሬት ምዝገባ ክፍያ",
        amount: 200,
        currency: "ETB",
        description: "Base land registration fee",
      },
      {
        name: "Survey Fee",
        nameAmharic: "የቅኝት ክፍያ",
        amount: 300,
        currency: "ETB",
        description: "Land measurement and boundary survey",
      },
    ],
    processingTime: "2-4 weeks",
    processingTimeAmharic: "ከ2-4 ሳምንታት",
    eligibility: "Land owners and legal heirs in Dangila Woreda",
    eligibilityAmharic: "በዳንግላ ወረዳ ውስጥ ያሉ የመሬት ባለቤቶች እና ህጋዊ ወራሾች",
    isActive: true,
    isPopular: false,
    order: 3,
    tags: ["land", "title", "deed", "property", "ownership"],
  },
  {
    name: "Business License Registration",
    nameAmharic: "የንግድ ፈቃድ ምዝገባ",
    slug: "business-license-registration",
    category: "business_licensing",
    description:
      "Register a new business and obtain an official business license to operate legally in Dangila Woreda.",
    descriptionAmharic: "አዲስ ንግድ ያስመዝግቡ እና በዳንግላ ወረዳ ውስጥ በህጋዊ መንገድ ለመንቀሳቀስ ኦፊሴላዊ የንግድ ፈቃድ ያግኙ።",
    shortDescription: "Register businesses and obtain operating licenses",
    shortDescriptionAmharic: "ንግዶችን ያስመዝግቡ እና የስራ ፈቃድ ያግኙ",
    icon: "Store",
    steps: [
      {
        stepNumber: 1,
        title: "Register Business Name",
        titleAmharic: "የንግድ ስም ያስመዝግቡ",
        description: "Register your business name at the Woreda Trade Office",
        descriptionAmharic: "በወረዳ ንግድ ቢሮ የንግድ ስምዎን ያስመዝግቡ",
        estimatedTime: "1 day",
        officeLocation: "Woreda Trade Office",
      },
      {
        stepNumber: 2,
        title: "Complete Application Form",
        titleAmharic: "የማመልከቻ ቅጽ ይሙሉ",
        description:
          "Fill business license application with business type, location, and owner details",
        descriptionAmharic: "የንግድ ፈቃድ ማመልከቻን በንግድ አይነት፣ አድራሻ እና የባለቤት መረጃ ይሙሉ",
        estimatedTime: "1 hour",
        officeLocation: "Woreda Trade Office",
      },
      {
        stepNumber: 3,
        title: "Site Inspection",
        titleAmharic: "ቦታ ምርመራ",
        description: "Woreda inspector visits your business location for verification",
        descriptionAmharic: "የወረዳ ተቆጣጣሪ ለማጣራት የንግድ ቦታዎን ይጎበኛል",
        estimatedTime: "3-7 days",
        officeLocation: "Your Business Location",
      },
      {
        stepNumber: 4,
        title: "Pay Fee and Receive License",
        titleAmharic: "ክፍያ ይክፈሉና ፈቃድ ይቀበሉ",
        description: "Pay the license fee and collect your business license",
        descriptionAmharic: "የፈቃድ ክፍያ ይክፈሉና የንግድ ፈቃድዎን ይቀበሉ",
        estimatedTime: "1-2 weeks",
        officeLocation: "Woreda Trade Office",
      },
    ],
    requiredDocuments: [
      {
        name: "Owner ID Card",
        nameAmharic: "የባለቤት መታወቂያ ካርድ",
        description: "Valid ID of business owner",
        descriptionAmharic: "የንግድ ባለቤት ትክክለኛ መታወቂያ",
        isMandatory: true,
        format: "Original + Copy",
        maxSize: 5242880,
      },
      {
        name: "Lease Agreement or Title Deed",
        nameAmharic: "የኪራይ ውል ወይም የይዞታ ማረጋገጫ",
        description: "Proof of business premises",
        descriptionAmharic: "የንግድ ቦታ ማረጋገጫ",
        isMandatory: true,
        format: "Original + Copy",
        maxSize: 5242880,
      },
    ],
    fees: [
      {
        name: "Business License Fee",
        nameAmharic: "የንግድ ፈቃድ ክፍያ",
        amount: 500,
        currency: "ETB",
        description: "Annual business license fee",
      },
      {
        name: "Inspection Fee",
        nameAmharic: "የምርመራ ክፍያ",
        amount: 150,
        currency: "ETB",
        description: "Site inspection fee",
      },
    ],
    processingTime: "1-2 weeks",
    processingTimeAmharic: "ከ1-2 ሳምንታት",
    eligibility: "Ethiopian citizens aged 18+ residing in Dangila Woreda",
    eligibilityAmharic: "እድሜያቸው 18+ የሆኑ በዳንግላ ወረዳ የሚኖሩ የኢትዮጵያ ዜጎች",
    isActive: true,
    isPopular: true,
    order: 4,
    tags: ["business", "license", "trade", "commercial"],
  },
  {
    name: "Tax Clearance Certificate",
    nameAmharic: "የግብር ክሊራንስ ሰርተፍኬት",
    slug: "tax-clearance-certificate",
    category: "tax_services",
    description: "Obtain a tax clearance certificate confirming all taxes have been paid.",
    descriptionAmharic: "ሁሉም ግብሮች መከፈላቸውን የሚያረጋግጥ የግብር ክሊራንስ ሰርተፍኬት ያግኙ።",
    shortDescription: "Get tax clearance certificates for business and legal needs",
    shortDescriptionAmharic: "ለንግድ እና ህጋዊ ፍላጎቶች የግብር ክሊራንስ ሰርተፍኬት ያግኙ",
    icon: "Receipt",
    steps: [
      {
        stepNumber: 1,
        title: "Visit Tax Office",
        titleAmharic: "የግብር ቢሮ ይጎብኙ",
        description: "Go to Woreda Revenue Office with your tax identification number",
        descriptionAmharic: "የግብር መለያ ቁጥርዎን ይዘው ወደ ወረዳ ገቢዎች ቢሮ ይሂዱ",
        estimatedTime: "1 day",
        officeLocation: "Woreda Revenue Office",
      },
      {
        stepNumber: 2,
        title: "Verify and Pay Outstanding",
        titleAmharic: "ያረጋግጡና ቀሪዎችን ይክፈሉ",
        description: "Tax officer checks your status and you pay any outstanding taxes",
        descriptionAmharic: "የግብር ባለስልጣን ሁኔታዎን ያረጋግጣል፤ ማንኛውም ቀሪ ግብር ካለ ይከፍላሉ",
        estimatedTime: "1-2 days",
        officeLocation: "Woreda Revenue Office",
      },
      {
        stepNumber: 3,
        title: "Pay Fee and Receive Certificate",
        titleAmharic: "ክፍያ ይክፈሉና ሰርተፍኬት ይቀበሉ",
        description: "Pay the certificate fee and collect your clearance certificate",
        descriptionAmharic: "የሰርተፍኬት ክፍያ ይክፈሉና የክሊራንስ ሰርተፍኬትዎን ይቀበሉ",
        estimatedTime: "1-3 days",
        officeLocation: "Woreda Revenue Office",
      },
    ],
    requiredDocuments: [
      {
        name: "Tax Identification Number (TIN)",
        nameAmharic: "የግብር መለያ ቁጥር (TIN)",
        description: "Valid Tax Identification Number certificate",
        descriptionAmharic: "ትክክለኛ የግብር መለያ ቁጥር ሰርተፍኬት",
        isMandatory: true,
        format: "Original + Copy",
        maxSize: 5242880,
      },
      {
        name: "Previous Tax Receipts",
        nameAmharic: "የቀድሞ ግብር ደረሰኞች",
        description: "Copies of recent tax payment receipts",
        descriptionAmharic: "የቅርብ ጊዜ የግብር ክፍያ ደረሰኞች ቅጂ",
        isMandatory: true,
        format: "Copies",
        maxSize: 5242880,
      },
    ],
    fees: [
      {
        name: "Certificate Processing Fee",
        nameAmharic: "የሰርተፍኬት ማስኬጃ ክፍያ",
        amount: 50,
        currency: "ETB",
        description: "Standard processing fee",
      },
    ],
    processingTime: "1-3 business days",
    processingTimeAmharic: "ከ1-3 የስራ ቀናት",
    eligibility: "Registered taxpayers in Dangila Woreda",
    eligibilityAmharic: "በዳንግላ ወረዳ የተመዘገቡ ግብር ከፋዮች",
    isActive: true,
    isPopular: false,
    order: 5,
    tags: ["tax", "clearance", "revenue", "certificate"],
  },
];

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

const seedAll = async () => {
  try {
    await connectDB();
    console.log("Connected to MongoDB\n");

    // Seed services
    const existingServices = await Service.countDocuments();
    if (existingServices > 0) {
      console.log(`Services already exist (${existingServices}). Skipping service seed.`);
    } else {
      const createdServices = await Service.insertMany(services);
      console.log(`Seeded ${createdServices.length} services`);
    }

    // Seed admins
    const existingAdmins = await Admin.countDocuments();
    if (existingAdmins > 0) {
      console.log(`Admins already exist (${existingAdmins}). Skipping admin seed.`);
    } else {
      const createdAdmins = await Admin.create(admins);
      console.log(`Seeded ${createdAdmins.length} admin accounts`);
    }

    // Initialize counters
    await initializeDefaultCounters();
    console.log("Counters initialized");

    console.log("\n--- Seed Complete ---");
    console.log("Super Admin: admin@dangila.gov.et / Admin@123456");
    console.log("Admin: tesfaye.alemu@dangila.gov.et / Officer@123456");
    console.log("Admin: mekdes.tadesse@dangila.gov.et / Officer@123456");
    console.log("Officer: abebe.kebede@dangila.gov.et / Officer@123456");
    console.log("Officer: tigist.worku@dangila.gov.et / Officer@123456");
    console.log("Viewer: dawit.hailu@dangila.gov.et / Officer@123456");
    console.log("---------------------\n");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
};

seedAll();
