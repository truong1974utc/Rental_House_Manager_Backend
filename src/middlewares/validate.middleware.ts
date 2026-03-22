import { ZodObject, ZodError } from "zod"
import { Request, Response, NextFunction } from "express"

export const validate =
    (schema: ZodObject<any>) =>
        (req: Request, res: Response, next: NextFunction) => {
            try {
                schema.parse({
                    body: req.body,
                    params: req.params,
                    query: req.query,
                })
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
            }
        }