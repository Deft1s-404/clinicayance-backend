import { AppointmentStatus, CampaignStatus, ClientStatus, LeadStage, PaymentStatus, PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const password = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@clinicayance.com' },
    update: {},
    create: {
      email: 'admin@clinicayance.com',
      password,
      name: 'Administrador',
      role: 'admin'
    }
  });

  const client = await prisma.client.create({
    data: {
      name: 'Maria Souza',
      email: 'maria.souza@example.com',
      phone: '+55 11 99999-0001',
      source: 'Instagram',
      tags: ['botox', 'vip'],
      status: ClientStatus.ACTIVE,
      score: 85,
      notes: 'Cliente interessada em procedimentos faciais.'
    }
  });

  const lead = await prisma.lead.create({
    data: {
      clientId: client.id,
      source: 'Instagram',
      notes: 'Lead capturado via campanha Outubro Rosa.',
      score: 70,
      stage: LeadStage.QUALIFIED
    }
  });

  const appointment = await prisma.appointment.create({
    data: {
      clientId: client.id,
      procedure: 'Aplicacao de botox',
      start: new Date(),
      end: new Date(Date.now() + 60 * 60 * 1000),
      status: AppointmentStatus.COMPLETED
    }
  });

  await prisma.payment.create({
    data: {
      appointmentId: appointment.id,
      clientId: client.id,
      value: 800.0,
      method: 'PIX',
      status: PaymentStatus.CONFIRMED,
      pixTxid: 'mock-txid-123'
    }
  });

  await prisma.funnelEvent.createMany({
    data: [
      {
        clientId: client.id,
        type: 'lead_created',
        meta: { leadId: lead.id, source: 'Instagram' }
      },
      {
        clientId: client.id,
        type: 'appointment_booked',
        meta: { appointmentId: appointment.id }
      },
      {
        clientId: client.id,
        type: 'payment_confirmed',
        meta: { value: 800.0 }
      }
    ]
  });

  const campaign = await prisma.campaign.create({
    data: {
      name: 'Campanha Bienestar',
      channel: 'WhatsApp',
      message: 'Oferta exclusiva de pacotes faciais para clientes recorrentes.',
      status: CampaignStatus.SCHEDULED,
      scheduledAt: new Date()
    }
  });

  await prisma.campaignLog.create({
    data: {
      campaignId: campaign.id,
      message: 'Campanha criada pelo seed inicial.'
    }
  });

  console.log(`Seed concluido. Usuario administrador: ${admin.email} / senha: admin123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
