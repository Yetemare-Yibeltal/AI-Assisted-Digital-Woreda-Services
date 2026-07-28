import { Router } from "express";
import {
  generateReceipt,
  generateCertificate,
  generateDocumentRequest,
} from "../../controllers/pdfController";
import { authenticate } from "../../middleware/auth";
import { officerAndAbove } from "../../middleware/roleCheck";
import { validateParams, validateBody } from "../../middleware/validate";
import { applicationIdParamSchema } from "../../validators/applicationValidator";
import Joi from "joi";

const router = Router();

router.use(authenticate);

// Generate receipt for any application
router.get(
  "/receipt/:id",
  officerAndAbove,
  validateParams(applicationIdParamSchema),
  generateReceipt
);

// Generate approval certificate (only for approved/completed)
router.get(
  "/certificate/:id",
  officerAndAbove,
  validateParams(applicationIdParamSchema),
  generateCertificate
);

// Generate document request letter
const documentRequestSchema = Joi.object({
  documents: Joi.array().items(Joi.string().trim().min(1).max(200)).min(1).required().messages({
    "array.min": "At least one document name is required",
    "any.required": "Documents array is required",
  }),
});

router.post(
  "/document-request/:id",
  officerAndAbove,
  validateParams(applicationIdParamSchema),
  validateBody(documentRequestSchema),
  generateDocumentRequest
);

export default router;
