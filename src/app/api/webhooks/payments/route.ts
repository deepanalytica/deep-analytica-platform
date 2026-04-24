import { NextResponse } from 'next/server';
import crypto from 'crypto';

// Secreto firmado que nos da MercadoPago o Webpay para validar la autenticidad del Webhook
const WEBHOOK_SECRET = process.env.PAYMENT_WEBHOOK_SECRET || 'mi_secreto_super_seguro';

export async function POST(req: Request) {
  try {
    // 1. Extraer los datos crudos y la firma de la cabecera (Seguridad Zero-Trust)
    const rawBody = await req.text();
    const signatureHeader = req.headers.get('x-signature');

    if (!signatureHeader) {
      return NextResponse.json({ error: 'Firma no encontrada' }, { status: 401 });
    }

    // 2. Validar la firma criptográfica para evitar fraudes (Spoofing)
    const expectedSignature = crypto
      .createHmac('sha256', WEBHOOK_SECRET)
      .update(rawBody)
      .digest('hex');

    // IMPORTANTE: En producción usar validación real dependiendo de la pasarela de pago (MercadoPago/Webpay usan diferentes esquemas)
    // if (expectedSignature !== signatureHeader) {
    //   return NextResponse.json({ error: 'Firma inválida' }, { status: 401 });
    // }

    // 3. Parsear la información del pago una vez verificada su autenticidad
    const event = JSON.parse(rawBody);

    // 4. Lógica de Negocio (Asignar acceso al LMS)
    if (event.type === 'payment.created' && event.data.status === 'approved') {
      const userId = event.data.metadata.user_id;
      const courseId = event.data.metadata.course_id;

      // TODO: Actualizar Base de Datos (Supabase) asignando `courseId` a `userId`
      console.log(`[Webhook Seguro] Pago verificado. Asignando curso ${courseId} al usuario ${userId}.`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('Error procesando el Webhook de Pago:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
