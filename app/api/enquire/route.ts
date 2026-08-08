import { NextResponse } from 'next/server';
import { enquirySchema } from '@/lib/validation/enquiry';
import { getSupabaseServerClient } from '@/lib/supabase/serverClient';

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 });
  }

  const parsed = enquirySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed.', fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from('enquiries')
      .insert({
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone,
        company: parsed.data.company,
        domain: parsed.data.domain,
        candidates_count: parsed.data.candidatesCount ?? null,
        delivery_mode: parsed.data.deliveryMode,
        location: parsed.data.location ?? null,
      })
      .select('id')
      .single();

    if (error) throw error;

    return NextResponse.json({ id: data.id }, { status: 201 });
  } catch (err) {
    console.error('Failed to save enquiry:', err);
    return NextResponse.json(
      { error: 'Something went wrong while saving your enquiry. Please try again shortly.' },
      { status: 500 }
    );
  }
}
