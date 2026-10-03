import { Request, Response, NextFunction } from 'express';
import { ZodTypeAny, ZodError } from 'zod';
import { ApiError } from './errorHandler';

export function validate(schema: ZodTypeAny) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      let innerSchema: any = schema;
      while (innerSchema && '_def' in innerSchema && innerSchema._def.schema) {
        innerSchema = innerSchema._def.schema;
      }

      const hasTopLevelKey =
        innerSchema &&
        'shape' in innerSchema &&
        innerSchema.shape &&
        ('body' in innerSchema.shape || 'query' in innerSchema.shape || 'params' in innerSchema.shape);

      if (hasTopLevelKey) {
        const parsed = await schema.parseAsync({
          body: req.body,
          query: req.query,
          params: req.params,
        });

        req.body = parsed.body ?? req.body;
        req.query = parsed.query ?? req.query;
        req.params = parsed.params ?? req.params;
      } else {
        const parsed = await schema.parseAsync(req.body);
        req.body = parsed ?? req.body;
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.errors.map((e) => ({
          field: e.path.join('.').replace(/^(body|query|params)\./, ''),
          message: e.message,
        }));
        return next(ApiError.validation('Validation failed', details));
      }
      next(error);
    }
  };
}
