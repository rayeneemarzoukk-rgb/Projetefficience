import { NextResponse } from 'next/server';
import emailService from '@/lib/nodemailer-service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { cabinetName, score, period, pdfBuffer, email } = body;

    const result = await emailService.sendMonthlyReport(
      email,
      cabinetName,
      period,
      Buffer.from(pdfBuffer, 'base64'),
      score
    );

    if (result.success) {
      return NextResponse.json({ success: true, messageId: result.messageId });
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}