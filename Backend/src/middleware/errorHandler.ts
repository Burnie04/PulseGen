import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean = true;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export const errorHandler = (
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal server error';

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  }
  else if (error instanceof Error) {
    message = error.message || message;
  }

  console.error(`[${statusCode}] ${message}`, error);

  res.status(statusCode).json({
    status: statusCode,
    error: message,
    ...(process.env.NODE_ENV === 'development' &&
      error instanceof Error && { stack: error.stack }),
  });
};

export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  next(
    new AppError(
      `Route not found: ${req.method} ${req.originalUrl}`,
      404
    )
  );
};
