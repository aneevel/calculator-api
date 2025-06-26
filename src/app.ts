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

app.listen(port, () => {
  console.log(`Calculator API running on port ${port}`);
})
