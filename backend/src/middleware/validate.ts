import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { ValidationError } from "../errors/ValidationError";

interface ValidationSchemas {
  body?: Joi.ObjectSchema;
  query?: Joi.ObjectSchema;
  params?: Joi.ObjectSchema;
}

const validate = (schemas: ValidationSchemas) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const errors: Array<{ field: string; message: string; value: unknown; constraint?: string }> =
        [];

      // Validate body
      if (schemas.body) {
        const { error, value } = schemas.body.validate(req.body, {
          abortEarly: false,
          stripUnknown: true,
          allowUnknown: false,
        });
        if (error) {
          error.details.forEach((detail) => {
            errors.push({
              field: `body.${detail.path.join(".")}`,
              message: detail.message,
              value: detail.context?.value || null,
              constraint: detail.type,
            });
          });
        } else {
          req.body = value;
        }
      }

      // Validate query parameters
      if (schemas.query) {
        const { error, value } = schemas.query.validate(req.query, {
          abortEarly: false,
          stripUnknown: true,
          allowUnknown: false,
        });
        if (error) {
          error.details.forEach((detail) => {
            errors.push({
              field: `query.${detail.path.join(".")}`,
              message: detail.message,
              value: detail.context?.value || null,
              constraint: detail.type,
            });
          });
        } else {
          req.query = value;
        }
      }

      // Validate URL params
      if (schemas.params) {
        const { error, value } = schemas.params.validate(req.params, {
          abortEarly: false,
          stripUnknown: true,
          allowUnknown: false,
        });
        if (error) {
          error.details.forEach((detail) => {
            errors.push({
              field: `params.${detail.path.join(".")}`,
              message: detail.message,
              value: detail.context?.value || null,
              constraint: detail.type,
            });
          });
        } else {
          req.params = value;
        }
      }

      if (errors.length > 0) {
        throw new ValidationError("Validation failed. Please check your input.", errors);
      }

      next();
    } catch (error) {
      if (error instanceof ValidationError) {
        next(error);
      } else {
        next(new ValidationError("Validation processing failed"));
      }
    }
  };
};

const validateBody = (schema: Joi.ObjectSchema) => validate({ body: schema });
const validateQuery = (schema: Joi.ObjectSchema) => validate({ query: schema });
const validateParams = (schema: Joi.ObjectSchema) => validate({ params: schema });

export { validate, validateBody, validateQuery, validateParams };
export default validate;
