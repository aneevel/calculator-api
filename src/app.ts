import express, { Request, Response } from "express";
import { rateLimit } from 'express-rate-limit';
import fs from 'fs';
import path from 'path';

const morgan = require('morgan');

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

interface CalculationHistory {
  id: number;
  operation: string;
  a: number;
  b: number;
  result: number;
  timestamp: Date
}

interface ErrorResponse {
  error: string;
  message: string
}

const app = express();
const port = process.env.PORT || 3000;

const calculationHistory: CalculationHistory[] = [];

const accessLogStream = fs.createWriteStream(path.join(__dirname, '../logs/', 'access.log'), { flags: 'a' });

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes 
  limit: 100, // Limit each IP to 100 requests per 'window'
  message: {
    error: 'RATE_LIMIT_EXCEED',
    message: 'Too many requests from IP in window'
  }
})

app.use(limiter);

app.use(morgan('combined', { stream: accessLogStream }));

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to the Calculator API!');
});

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use((err: Error, req: Request, res: Response, next: Function) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred'
  } as ErrorResponse);
});

app.get('/history', (req: Request, res: Response) => {
  res.json({
    calculations: calculationHistory,
    total: calculationHistory.length
  });
});

app.post('/calculate', (req: Request, res: Response) => {
  try {
    const { operation, a, b }: CalculationRequest = req.body;

    // Input validation
    // Validate numbers
    if (typeof a !== 'number' || typeof b !== 'number') {
      res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Invalid types provided for operands'
      } as ErrorResponse);
      return;
    }

    // Check that operation is supported
    if (!['add', 'subtract', 'multiply', 'divide'].includes(operation)) {
      res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Unsupported calculation type provided'
      } as ErrorResponse);
      return;
    }

    // Actual calculation
    let result: number = 0;
    switch (operation) {
      case 'add':
        result = a + b;
        break;
      case 'subtract':
        result = a - b;
        break;
      case 'multiply':
        result = a * b;
        break;
      case 'divide':
        if (b <= 0) {
          res.status(400).json({
            error: 'ILLEGAL_CALCULATION',
            message: 'Cannot divide by zero'
          } as ErrorResponse);
          return;
        }
        result = a / b;
        break;
      default:
        res.status(400).json({
          error: 'UNSUPPORTED_CALCULATION',
          message: 'Calculation not supported by API'
        } as ErrorResponse);

    }

    const response: CalculationResponse = {
      result,
      operation,
      a,
      b
    };

    const historyRecord: CalculationHistory = {
      id: calculationHistory.length,
      operation: operation,
      a: a,
      b: b,
      result: result,
      timestamp: new Date()
    }

    calculationHistory.push(historyRecord);

    res.json(response);

  } catch (error) {
    console.error('Calculation error:', error);
    res.status(500).json({
      error: 'CALCULATION_ERROR',
      message: 'An error occurred with the calculation endpoint'
    } as ErrorResponse);
  }
});

// Fallback catch-all handler 
app.get('*name', (req: Request, res: Response) => {
  res.status(404).json({
    error: 'NOT_FOUND',
    message: 'Endpoint not found'
  } as ErrorResponse);
});

app.listen(port, () => {
  console.log(`Calculator API running on port ${port}`);
  console.log(`Health check: GET http://localhost:${port}/health`);
  console.log(`Calculator: POST http://localhost:${port}/calculate`);
  console.log(`History: GET http://localhost:${port}/history`);
});
