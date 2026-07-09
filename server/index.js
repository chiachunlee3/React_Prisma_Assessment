import cors from 'cors';
import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();
const port = process.env.PORT ?? 4000;

app.use(
  cors({
    origin: ['http://127.0.0.1:5173', 'http://localhost:5173'],
  }),
);
app.use(express.json());

// ── Health ──────────────────────────────────────────────────────────────
app.get('/api/health', (_request, response) => {
  response.json({
    ok: true,
    service: 'Support Request Tracker API',
  });
});

// ── List / search / filter requests ─────────────────────────────────────
app.get('/api/requests', async (request, response) => {
  try {
    const { search, status, priority, category, assignedTo } = request.query;

    const where = {};

    // Text search across requester name, email, message, and request number
    if (search) {
      where.OR = [
        { requesterName: { contains: search } },
        { email: { contains: search } },
        { message: { contains: search } },
        { requestNumber: { contains: search } },
      ];
    }

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (category) where.category = category;
    if (assignedTo) where.assignedTo = assignedTo;

    const requests = await prisma.supportRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    response.json(requests);
  } catch (error) {
    console.error('GET /api/requests error:', error);
    response.status(500).json({ error: 'Failed to fetch requests' });
  }
});

// ── Get single request with events ──────────────────────────────────────
app.get('/api/requests/:id', async (request, response) => {
  try {
    const id = parseInt(request.params.id, 10);

    if (isNaN(id)) {
      return response.status(400).json({ error: 'Invalid request ID' });
    }

    const supportRequest = await prisma.supportRequest.findUnique({
      where: { id },
      include: {
        events: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!supportRequest) {
      return response.status(404).json({ error: 'Request not found' });
    }

    response.json(supportRequest);
  } catch (error) {
    console.error('GET /api/requests/:id error:', error);
    response.status(500).json({ error: 'Failed to fetch request' });
  }
});

// ── Create a new request ────────────────────────────────────────────────
app.post('/api/requests', async (request, response) => {
  try {
    const { requesterName, email, category, priority, status, message } = request.body;

    // Validation
    const errors = [];
    if (!requesterName || !requesterName.trim()) errors.push('Requester name is required');
    if (!email || !email.trim()) errors.push('Email is required');
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Invalid email format');
    if (!category || !category.trim()) errors.push('Category is required');
    if (!priority || !priority.trim()) errors.push('Priority is required');
    if (!status || !status.trim()) errors.push('Status is required');
    if (!message || !message.trim()) errors.push('Message is required');

    if (errors.length > 0) {
      return response.status(400).json({ error: 'Validation failed', details: errors });
    }

    // Generate next request number (SR-013, SR-014, ...)
    const lastRequest = await prisma.supportRequest.findFirst({
      orderBy: { id: 'desc' },
      select: { requestNumber: true },
    });

    let nextNumber = 1;
    if (lastRequest) {
      const match = lastRequest.requestNumber.match(/SR-(\d+)/);
      if (match) nextNumber = parseInt(match[1], 10) + 1;
    }
    const requestNumber = `SR-${String(nextNumber).padStart(3, '0')}`;

    const created = await prisma.supportRequest.create({
      data: {
        requestNumber,
        requesterName: requesterName.trim(),
        email: email.trim(),
        category: category.trim(),
        priority: priority.trim(),
        status: status.trim(),
        message: message.trim(),
      },
    });

    // Log the creation event
    await prisma.requestEvent.create({
      data: {
        requestId: created.id,
        action: 'Created',
        note: `Request submitted by ${created.requesterName}.`,
      },
    });

    response.status(201).json(created);
  } catch (error) {
    console.error('POST /api/requests error:', error);
    response.status(500).json({ error: 'Failed to create request' });
  }
});

// ── Update a request (status, priority, assignedTo, internalNote) ───────
app.patch('/api/requests/:id', async (request, response) => {
  try {
    const id = parseInt(request.params.id, 10);

    if (isNaN(id)) {
      return response.status(400).json({ error: 'Invalid request ID' });
    }

    const existing = await prisma.supportRequest.findUnique({ where: { id } });
    if (!existing) {
      return response.status(404).json({ error: 'Request not found' });
    }

    // Only allow updating specific fields
    const allowedFields = ['status', 'priority', 'assignedTo', 'internalNote'];
    const data = {};
    const changes = [];

    for (const field of allowedFields) {
      if (request.body[field] !== undefined) {
        data[field] = request.body[field];

        // Build human-readable change descriptions for event log
        if (field === 'status' && request.body[field] !== existing[field]) {
          changes.push(`Status changed from ${existing.status} to ${request.body[field]}`);
        } else if (field === 'priority' && request.body[field] !== existing[field]) {
          changes.push(`Priority changed from ${existing.priority} to ${request.body[field]}`);
        } else if (field === 'assignedTo' && request.body[field] !== existing[field]) {
          changes.push(`Assigned to ${request.body[field] || 'Unassigned'}`);
        } else if (field === 'internalNote' && request.body[field] !== existing[field]) {
          changes.push('Internal note updated');
        }
      }
    }

    if (Object.keys(data).length === 0) {
      return response.status(400).json({ error: 'No valid fields to update' });
    }

    const updated = await prisma.supportRequest.update({
      where: { id },
      data,
    });

    // Log each meaningful change as an event
    if (changes.length > 0) {
      await prisma.requestEvent.create({
        data: {
          requestId: id,
          action: changes.join('; '),
          note: request.body.internalNote || null,
        },
      });
    }

    response.json(updated);
  } catch (error) {
    console.error('PATCH /api/requests/:id error:', error);
    response.status(500).json({ error: 'Failed to update request' });
  }
});

// ── List users ──────────────────────────────────────────────────────────
app.get('/api/users', async (_request, response) => {
  try {
    const users = await prisma.userOption.findMany({
      orderBy: { name: 'asc' },
    });
    response.json(users);
  } catch (error) {
    console.error('GET /api/users error:', error);
    response.status(500).json({ error: 'Failed to fetch users' });
  }
});

// ── 404 fallback ────────────────────────────────────────────────────────
app.use((_request, response) => {
  response.status(404).json({ error: 'Not found' });
});

app.listen(port, () => {
  console.log(`Support Request Tracker API listening on http://127.0.0.1:${port}`);
});
