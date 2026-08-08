import { describe, expect, it } from 'vitest';
import { enquirySchema } from './enquiry';

const validPayload = {
  name: 'Jordan Lee',
  email: 'jordan.lee@example.com',
  phone: '+91 98765 43210',
  company: 'Sample Enterprise Co.',
  domain: 'Data Science',
  candidatesCount: 25,
  deliveryMode: 'Hybrid',
  location: 'Gurugram, India',
};

describe('enquirySchema', () => {
  it('accepts a fully valid payload', () => {
    const result = enquirySchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it('accepts a payload without optional fields', () => {
    const { candidatesCount, location, ...required } = validPayload;
    const result = enquirySchema.safeParse(required);
    expect(result.success).toBe(true);
  });

  it.each([
    ['name', ''],
    ['email', 'not-an-email'],
    ['phone', 'abc'],
    ['company', ''],
    ['domain', 'Not A Real Domain'],
    ['deliveryMode', 'By Carrier Pigeon'],
  ])('rejects an invalid %s', (field, value) => {
    const result = enquirySchema.safeParse({ ...validPayload, [field]: value });
    expect(result.success).toBe(false);
  });

  it('rejects a non-positive candidatesCount', () => {
    const result = enquirySchema.safeParse({ ...validPayload, candidatesCount: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects a non-integer candidatesCount', () => {
    const result = enquirySchema.safeParse({ ...validPayload, candidatesCount: 2.5 });
    expect(result.success).toBe(false);
  });
});
