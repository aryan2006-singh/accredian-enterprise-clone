import { z } from 'zod';
import { domainOptions, deliveryModeOptions } from '@/lib/content/enquiryOptions';

export const enquirySchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().trim().email('Enter a valid email address'),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s-]{7,15}$/, 'Enter a valid phone number'),
  company: z.string().trim().min(2, 'Company name must be at least 2 characters').max(150),
  domain: z.enum(domainOptions, { errorMap: () => ({ message: 'Select a domain' }) }),
  candidatesCount: z
    .number({ invalid_type_error: 'Number of candidates must be a number' })
    .int('Number of candidates must be a whole number')
    .positive('Number of candidates must be greater than zero')
    .finite('Number of candidates must be a valid number')
    .optional(),
  deliveryMode: z.enum(deliveryModeOptions, {
    errorMap: () => ({ message: 'Select a delivery mode' }),
  }),
  location: z.string().trim().max(150).optional(),
});

export type EnquiryInput = z.infer<typeof enquirySchema>;
