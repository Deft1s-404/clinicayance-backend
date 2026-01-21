import {
  AppointmentStatus,
  CalendarEntryType,
  CampaignStatus,
  ClientStatus,
  LeadStage,
  PaymentStatus,
  PrismaClient
} from '@prisma/client';
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
      country: 'Brasil',
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

  const today = new Date();
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  const travelStart = new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000);
  const travelEnd = new Date(today.getTime() + 8 * 24 * 60 * 60 * 1000);

  await prisma.calendarEntry.createMany({
    data: [
      {
        title: 'Atendimentos em Sao Paulo',
        description: 'Horario padrao de consultas presenciais',
        type: CalendarEntryType.AVAILABLE,
        start: new Date(today.setHours(9, 0, 0, 0)),
        end: new Date(today.setHours(17, 0, 0, 0)),
        timezone: 'America/Sao_Paulo',
        country: 'Brasil',
        city: 'Sao Paulo',
        location: 'Clinica Matriz',
        notes: 'Disponível para agendamentos presenciais'
      },
      {
        title: 'Atendimento remoto na Europa',
        type: CalendarEntryType.AVAILABLE,
        start: new Date(tomorrow.setHours(6, 0, 0, 0)),
        end: new Date(tomorrow.setHours(12, 0, 0, 0)),
        timezone: 'Europe/Madrid',
        country: 'Espanha',
        city: 'Madrid',
        location: 'Hotel Melia',
        notes: 'Telemedicina disponível neste período'
      },
      {
        title: 'Viagem para Colombia',
        type: CalendarEntryType.TRAVEL,
        start: travelStart,
        end: travelEnd,
        allDay: true,
        timezone: 'America/Bogota',
        country: 'Colombia',
        notes: 'Participacao em congresso medico'
      }
    ]
  });

  await prisma.serviceOffering.createMany({
    data: [
      {
        name: 'Aplicacao de Botox Premium',
        description: 'Protocolo facial completo com toxina importada.',
        category: 'Estetica',
        country: 'Brasil',
        currency: 'BRL',
        price: 1800,
        durationMinutes: 90,
        notes: 'Inclui revisao em 15 dias.'
      },
      {
        name: 'Masterclass Endolaser',
        description: 'Sessao intensiva para alunos internacionais.',
        category: 'Treinamento',
        country: 'Panama',
        currency: 'USD',
        price: 2500,
        durationMinutes: 240,
        notes: 'Material traduzido incluso.'
      },
      {
        name: 'Consultoria Online',
        description: 'Avaliação virtual personalizada para novos pacientes.',
        category: 'Telemedicina',
        country: 'Portugal',
        currency: 'EUR',
        price: 150,
        durationMinutes: 60
      }
    ]
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
