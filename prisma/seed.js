import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // ── Users (≥ 3) ──────────────────────────────────────────────────────
  const users = await Promise.all([
    prisma.userOption.upsert({
      where: { name: 'Aisha Rahman' },
      update: {},
      create: { name: 'Aisha Rahman', roleLabel: 'Editor' },
    }),
    prisma.userOption.upsert({
      where: { name: 'Ben Torres' },
      update: {},
      create: { name: 'Ben Torres', roleLabel: 'Editor' },
    }),
    prisma.userOption.upsert({
      where: { name: 'Carmen Liu' },
      update: {},
      create: { name: 'Carmen Liu', roleLabel: 'Viewer' },
    }),
    prisma.userOption.upsert({
      where: { name: 'David Osei' },
      update: {},
      create: { name: 'David Osei', roleLabel: 'Editor' },
    }),
  ]);

  console.log(`Seeded ${users.length} user options`);

  // ── Support Requests (≥ 10) ──────────────────────────────────────────
  const requests = [
    {
      requestNumber: 'SR-001',
      requesterName: 'Alice Tan',
      email: 'alice.tan@example.com',
      category: 'Billing',
      priority: 'High',
      status: 'Open',
      assignedTo: 'Aisha Rahman',
      message: 'I was charged twice for my subscription renewal last month. Please review and refund the duplicate charge.',
      internalNote: null,
    },
    {
      requestNumber: 'SR-002',
      requesterName: 'Bob Martinez',
      email: 'bob.martinez@example.com',
      category: 'Technical',
      priority: 'Medium',
      status: 'In Progress',
      assignedTo: 'Ben Torres',
      message: 'The export function throws a 500 error when I try to download my monthly report as CSV.',
      internalNote: 'Reproduced on staging. Backend team notified.',
    },
    {
      requestNumber: 'SR-003',
      requesterName: 'Chloe Nguyen',
      email: 'chloe.nguyen@example.com',
      category: 'Account',
      priority: 'Low',
      status: 'Resolved',
      assignedTo: 'Aisha Rahman',
      message: 'I need to update the email address associated with my account from my old university email to my work email.',
      internalNote: 'Email updated per user request.',
    },
    {
      requestNumber: 'SR-004',
      requesterName: 'Daniel Kim',
      email: 'daniel.kim@example.com',
      category: 'General Inquiry',
      priority: 'Low',
      status: 'Closed',
      assignedTo: null,
      message: 'What are your support hours during public holidays?',
      internalNote: 'Answered via email with the holiday schedule link.',
    },
    {
      requestNumber: 'SR-005',
      requesterName: 'Emma Johnson',
      email: 'emma.johnson@example.com',
      category: 'Technical',
      priority: 'High',
      status: 'Open',
      assignedTo: 'David Osei',
      message: 'Dashboard charts are not loading at all since the latest update. I see a blank white area where the graphs should be.',
      internalNote: null,
    },
    {
      requestNumber: 'SR-006',
      requesterName: 'Farid Hassan',
      email: 'farid.hassan@example.com',
      category: 'Billing',
      priority: 'Medium',
      status: 'In Progress',
      assignedTo: 'Carmen Liu',
      message: 'I cancelled my plan two weeks ago but I am still being billed. Please stop the recurring payment.',
      internalNote: 'Forwarded to billing department for cancellation verification.',
    },
    {
      requestNumber: 'SR-007',
      requesterName: 'Grace Park',
      email: 'grace.park@example.com',
      category: 'Account',
      priority: 'Medium',
      status: 'Resolved',
      assignedTo: 'Ben Torres',
      message: 'I cannot log in after resetting my password. The reset link seems to have expired before I could use it.',
      internalNote: 'Password manually reset. User confirmed login works.',
    },
    {
      requestNumber: 'SR-008',
      requesterName: 'Henry Wright',
      email: 'henry.wright@example.com',
      category: 'Feature Request',
      priority: 'Low',
      status: 'Open',
      assignedTo: null,
      message: 'It would be helpful to have a dark mode option in the settings page for easier reading at night.',
      internalNote: null,
    },
    {
      requestNumber: 'SR-009',
      requesterName: 'Isabella Chen',
      email: 'isabella.chen@example.com',
      category: 'Technical',
      priority: 'High',
      status: 'In Progress',
      assignedTo: 'Aisha Rahman',
      message: 'File uploads fail silently when the file is larger than 5 MB. No error message is shown to the user.',
      internalNote: 'Confirmed size limit issue. Fix in progress for next release.',
    },
    {
      requestNumber: 'SR-010',
      requesterName: 'James Lee',
      email: 'james.lee@example.com',
      category: 'General Inquiry',
      priority: 'Medium',
      status: 'Closed',
      assignedTo: 'David Osei',
      message: 'Can you provide documentation on how to integrate your API with a third-party CRM system?',
      internalNote: 'Sent API integration guide PDF via email.',
    },
    {
      requestNumber: 'SR-011',
      requesterName: 'Karen Smith',
      email: 'karen.smith@example.com',
      category: 'Billing',
      priority: 'High',
      status: 'Open',
      assignedTo: 'Ben Torres',
      message: 'My invoice for June shows a charge for a premium plan but I am on the basic plan. Please correct this.',
      internalNote: null,
    },
    {
      requestNumber: 'SR-012',
      requesterName: 'Liam O\'Connor',
      email: 'liam.oconnor@example.com',
      category: 'Feature Request',
      priority: 'Medium',
      status: 'Resolved',
      assignedTo: 'Carmen Liu',
      message: 'Please add the ability to export support request history as a PDF from the dashboard.',
      internalNote: 'Feature added in v2.4 release. User notified.',
    },
  ];

  for (const req of requests) {
    await prisma.supportRequest.upsert({
      where: { requestNumber: req.requestNumber },
      update: {},
      create: req,
    });
  }

  console.log(`Seeded ${requests.length} support requests`);

  // ── Request Events (≥ 5) ─────────────────────────────────────────────
  const events = [
    {
      requestId: 1,
      action: 'Created',
      note: 'Request submitted by Alice Tan via the support portal.',
    },
    {
      requestId: 2,
      action: 'Status changed to In Progress',
      note: 'Ben Torres picked up the request and began investigation.',
    },
    {
      requestId: 3,
      action: 'Status changed to Resolved',
      note: 'Email address updated successfully.',
    },
    {
      requestId: 3,
      action: 'Created',
      note: 'Request submitted by Chloe Nguyen.',
    },
    {
      requestId: 5,
      action: 'Assigned to David Osei',
      note: 'Escalated to frontend team lead for dashboard charting issue.',
    },
    {
      requestId: 7,
      action: 'Status changed to Resolved',
      note: 'Password reset manually. User confirmed access restored.',
    },
    {
      requestId: 9,
      action: 'Priority changed to High',
      note: 'Multiple users reporting the same 5 MB upload limit issue.',
    },
    {
      requestId: 9,
      action: 'Status changed to In Progress',
      note: 'Backend team confirmed the bug and started working on a fix.',
    },
  ];

  // Delete existing events first (no unique field to upsert on)
  await prisma.requestEvent.deleteMany();

  for (const event of events) {
    await prisma.requestEvent.create({ data: event });
  }

  console.log(`Seeded ${events.length} request events`);
}

main()
  .then(() => {
    console.log('Seed completed successfully');
  })
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
