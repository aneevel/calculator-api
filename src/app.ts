import express, { Request, Response } from 'express';

interface CalculationRequest {
  operation: 'add' | 'subtract' | 'multiply' | 'divide';
  a: number;
  b: number;
}

interface CalculationResponse {
  result: number;
  operation: string;
  a: number;
  b: number;
}

interface ErrorResponse {
  error: string;
  message: string
}

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use((err: Error, req: Request, res: Response, next: Function) => {
  console.error(`Unhandled error:`, err);
  res.status(500).json({
    error: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred'
  } as ErrorResponse);
});

// Catchall remaining requests
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    error: 'NOT_FOUND',
    message: 'Endpoint not found'
  } as ErrorResponse);
});

app.listen(port, () => {
  console.log(`Calculator API running on port ${port}`);
  console.log(`Health check: http://localhost:${port}/health`);
});
