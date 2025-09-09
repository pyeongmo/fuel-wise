'use server';
/**
 * @fileOverview Extracts information from a fuel receipt image.
 *
 * - extractReceiptInfo - A function that handles the receipt information extraction.
 * - ExtractReceiptInfoInput - The input type for the extractReceiptInfo function.
 * - ExtractReceiptInfoOutput - The return type for the extractReceiptInfo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractReceiptInfoInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a fuel receipt, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractReceiptInfoInput = z.infer<typeof ExtractReceiptInfoInputSchema>;

const ExtractReceiptInfoOutputSchema = z.object({
    liters: z.number().optional().describe('The total volume of fuel in liters. e.g., 45.5'),
    price: z.number().optional().describe('The total price of the fuel. e.g., 60000'),
    date: z.string().optional().describe("The date of the transaction in 'yyyy-MM-dd' format."),
});
export type ExtractReceiptInfoOutput = z.infer<typeof ExtractReceiptInfoOutputSchema>;

export async function extractReceiptInfo(input: ExtractReceiptInfoInput): Promise<ExtractReceiptInfoOutput> {
  return extractReceiptInfoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractReceiptInfoPrompt',
  input: {schema: ExtractReceiptInfoInputSchema},
  output: {schema: ExtractReceiptInfoOutputSchema},
  prompt: `You are an expert at reading and parsing fuel receipts. Extract the total liters, total price, and the date from the provided receipt image. Provide the date in 'yyyy-MM-dd' format.

If you cannot find a value for a field, leave it empty.

Receipt Photo: {{media url=photoDataUri}}`,
});

const extractReceiptInfoFlow = ai.defineFlow(
  {
    name: 'extractReceiptInfoFlow',
    inputSchema: ExtractReceiptInfoInputSchema,
    outputSchema: ExtractReceiptInfoOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
