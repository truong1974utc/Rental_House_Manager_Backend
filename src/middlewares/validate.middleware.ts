import { ZodObject, ZodError } from "zod"
import { Request, Response, NextFunction } from "express"

export const validate =
    (schema: ZodObject<any>) =>
        (req: Request, res: Response, next: NextFunction) => {
            try {
                const parsed = schema.parse({
                    body: req.body,
                    params: req.params,
                    query: req.query,
                })

                if (parsed.body !== undefined) {
                    req.body = parsed.body;
                }

                next()
            } catch (error: any) {
                if (error instanceof ZodError) {
                    const formattedErrors = error.issues.map((issue) => ({
                        field: issue.path[1],
                        message: issue.message
                    }));

                    return res.status(400).json({
                        success: false,
                        message: "Validation error",
                        errors: formattedErrors
                    });
                }

                next(error);
            }
        }
