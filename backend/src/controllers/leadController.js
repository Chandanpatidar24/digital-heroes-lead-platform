const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const VALID_STATUSES = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'WON', 'LOST'];

// Public endpoint to create lead via web capture form
const createPublicLead = async (req, res) => {
  try {
    const { name, email, phone, company, value, source, message } = req.body;

    if (!name || !name.trim() || !email || !email.trim()) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Name and Email are required fields',
      });
    }

    const leadValue = parseFloat(value) || 0;

    const lead = await prisma.lead.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone ? phone.trim() : null,
        company: company ? company.trim() : null,
        value: leadValue,
        source: source || 'Website Form',
        status: 'NEW',
        activityLogs: {
          create: [
            {
              action: 'CREATED',
              details: message ? `Public form submission: "${message.trim()}"` : 'Lead submitted via Public Web Form',
            },
          ],
        },
      },
    });

    return res.status(201).json({
      message: 'Lead captured successfully',
      lead,
    });
  } catch (error) {
    console.error('Error creating public lead:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to record lead request.',
    });
  }
};

// Authenticated endpoint to list leads with pagination & filtering
// ADMIN can see all leads (or filter by any assignee)
// MEMBER can ONLY see leads assigned to themselves
const getLeads = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { status, assignedTo, search } = req.query;
    const userRole = req.user.role;
    const userId = req.user.id;

    const where = {};

    // Enforce Member Lead Scoping Rule
    if (userRole !== 'ADMIN') {
      where.assignedToId = userId;
    } else if (assignedTo) {
      if (assignedTo === 'unassigned') {
        where.assignedToId = null;
      } else {
        const parsedAssignee = parseInt(assignedTo);
        if (!isNaN(parsedAssignee)) {
          where.assignedToId = parsedAssignee;
        }
      }
    }

    if (status && VALID_STATUSES.includes(status.toUpperCase())) {
      where.status = status.toUpperCase();
    }

    if (search) {
      const searchTerm = search.trim();
      where.OR = [
        { name: { contains: searchTerm } },
        { email: { contains: searchTerm } },
        { company: { contains: searchTerm } },
      ];
    }

    const [total, leads] = await Promise.all([
      prisma.lead.count({ where }),
      prisma.lead.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          assignedTo: {
            select: { id: true, name: true, email: true, role: true },
          },
          _count: {
            select: { notes: true, activityLogs: true },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return res.status(200).json({
      leads,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error('Error getting leads:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve leads list.',
    });
  }
};

// Authenticated endpoint to get single lead details with notes & activity log
const getLeadById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const userRole = req.user.role;
    const userId = req.user.id;

    if (isNaN(id)) {
      return res.status(400).json({ error: 'Bad Request', message: 'Invalid Lead ID' });
    }

    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true, role: true },
        },
        notes: {
          orderBy: { createdAt: 'desc' },
          include: {
            author: { select: { id: true, name: true, email: true, role: true } },
          },
        },
        activityLogs: {
          orderBy: { createdAt: 'desc' },
          include: {
            actor: { select: { id: true, name: true, email: true, role: true } },
          },
        },
      },
    });

    if (!lead) {
      return res.status(404).json({ error: 'Not Found', message: 'Lead not found' });
    }

    // Scoping Guard: Members can only access leads assigned to them
    if (userRole !== 'ADMIN' && lead.assignedToId !== userId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access Restricted: Sales members can only view leads assigned to them.',
      });
    }

    return res.status(200).json({ lead });
  } catch (error) {
    console.error('Error fetching lead:', error);
    return res.status(500).json({ error: 'Internal Server Error', message: 'Failed to fetch lead details.' });
  }
};

// Authenticated endpoint to update lead status, reassignment, or details
const updateLead = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Bad Request', message: 'Invalid Lead ID' });
    }

    const currentLead = await prisma.lead.findUnique({
      where: { id },
      include: { assignedTo: true },
    });

    if (!currentLead) {
      return res.status(404).json({ error: 'Not Found', message: 'Lead not found' });
    }

    const { status, assignedToId, name, email, phone, company, value } = req.body;
    const userRole = req.user.role;
    const rawActorId = req.user.id;

    // Scoping Guard: Members can only manage leads assigned to them
    if (userRole !== 'ADMIN' && currentLead.assignedToId !== rawActorId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access Restricted: Sales members can only manage leads assigned to them.',
      });
    }

    // Verify actor exists in DB to prevent foreign key violation
    let validActorId = null;
    if (rawActorId) {
      const actorUser = await prisma.user.findUnique({ where: { id: parseInt(rawActorId) } });
      if (actorUser) {
        validActorId = actorUser.id;
      }
    }

    // Parse target assignedToId if provided
    let newAssignedId = undefined;
    if (assignedToId !== undefined) {
      newAssignedId = assignedToId === '' || assignedToId === null || assignedToId === 'null' ? null : parseInt(assignedToId);
      if (newAssignedId !== null && isNaN(newAssignedId)) {
        return res.status(400).json({ error: 'Bad Request', message: 'Invalid assigned user ID' });
      }
    }

    // FIRST: Enforce RBAC Permission Guard (Members cannot reassign leads)
    if (newAssignedId !== undefined && newAssignedId !== currentLead.assignedToId) {
      if (userRole !== 'ADMIN') {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Only Admins are permitted to reassign leads to team members.',
        });
      }

      // SECOND: Verify target assignee user exists in database
      if (newAssignedId !== null) {
        const assigneeUser = await prisma.user.findUnique({ where: { id: newAssignedId } });
        if (!assigneeUser) {
          return res.status(400).json({ error: 'Bad Request', message: 'Assigned user does not exist' });
        }
      }
    }

    const updateData = {};
    const activityLogsToCreate = [];

    // Check status change
    if (status && status.toUpperCase() !== currentLead.status) {
      const upperStatus = status.toUpperCase();
      if (!VALID_STATUSES.includes(upperStatus)) {
        return res.status(400).json({ error: 'Bad Request', message: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` });
      }
      updateData.status = upperStatus;
      activityLogsToCreate.push({
        action: 'STATUS_CHANGE',
        details: `Updated status from ${currentLead.status} to ${upperStatus}`,
        actorId: validActorId,
      });
    }

    // Check assignment change
    if (newAssignedId !== undefined && newAssignedId !== currentLead.assignedToId) {
      updateData.assignedToId = newAssignedId;

      let assigneeName = 'Unassigned';
      if (newAssignedId) {
        const newAssignee = await prisma.user.findUnique({ where: { id: newAssignedId } });
        if (newAssignee) assigneeName = newAssignee.name;
      }

      activityLogsToCreate.push({
        action: 'REASSIGNED',
        details: `Reassigned lead to ${assigneeName}`,
        actorId: validActorId,
      });
    }

    // Optional field updates
    if (name !== undefined && name !== currentLead.name) updateData.name = name.trim();
    if (email !== undefined && email !== currentLead.email) updateData.email = email.toLowerCase().trim();
    if (phone !== undefined && phone !== currentLead.phone) updateData.phone = phone ? phone.trim() : null;
    if (company !== undefined && company !== currentLead.company) updateData.company = company ? company.trim() : null;
    if (value !== undefined) {
      const parsedValue = parseFloat(value) || 0;
      if (parsedValue !== currentLead.value) updateData.value = parsedValue;
    }

    // If nothing changed, return current lead without executing Prisma query
    if (Object.keys(updateData).length === 0 && activityLogsToCreate.length === 0) {
      return res.status(200).json({
        message: 'No changes detected',
        lead: currentLead,
      });
    }

    const prismaData = { ...updateData };
    if (activityLogsToCreate.length > 0) {
      prismaData.activityLogs = {
        create: activityLogsToCreate,
      };
    }

    const updatedLead = await prisma.lead.update({
      where: { id },
      data: prismaData,
      include: {
        assignedTo: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    return res.status(200).json({
      message: 'Lead updated successfully',
      lead: updatedLead,
    });
  } catch (error) {
    console.error('Error updating lead:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update lead. Please try again.',
    });
  }
};

// Authenticated endpoint to delete lead (ADMIN ONLY)
const deleteLead = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Bad Request', message: 'Invalid Lead ID' });
    }

    const lead = await prisma.lead.findUnique({ where: { id } });
    if (!lead) {
      return res.status(404).json({ error: 'Not Found', message: 'Lead not found' });
    }

    await prisma.lead.delete({ where: { id } });

    return res.status(200).json({
      message: `Lead "${lead.name}" deleted successfully`,
    });
  } catch (error) {
    console.error('Error deleting lead:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to delete lead.',
    });
  }
};

// Authenticated endpoint to add a note to a lead
const addNote = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { content } = req.body;
    const userRole = req.user.role;
    const userId = req.user.id;

    if (isNaN(id)) {
      return res.status(400).json({ error: 'Bad Request', message: 'Invalid Lead ID' });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Bad Request', message: 'Note content cannot be empty' });
    }

    const lead = await prisma.lead.findUnique({ where: { id } });
    if (!lead) {
      return res.status(404).json({ error: 'Not Found', message: 'Lead not found' });
    }

    // Scoping Guard: Members can only add notes to leads assigned to them
    if (userRole !== 'ADMIN' && lead.assignedToId !== userId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access Restricted: Sales members can only add notes to leads assigned to them.',
      });
    }

    // Verify session user exists in database
    const authorUser = await prisma.user.findUnique({ where: { id: parseInt(userId) } });
    if (!authorUser) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Your login session has expired because database was reset. Please log out and log back in.',
      });
    }

    const note = await prisma.note.create({
      data: {
        content: content.trim(),
        leadId: id,
        authorId: authorUser.id,
      },
      include: {
        author: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    await prisma.activityLog.create({
      data: {
        leadId: id,
        actorId: authorUser.id,
        action: 'NOTE_ADDED',
        details: `Added note: "${content.trim().substring(0, 60)}${content.trim().length > 60 ? '...' : ''}"`,
      },
    });

    return res.status(201).json({
      message: 'Note added successfully',
      note,
    });
  } catch (error) {
    console.error('Error adding note:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to add note.',
    });
  }
};

module.exports = {
  createPublicLead,
  getLeads,
  getLeadById,
  updateLead,
  deleteLead,
  addNote,
};
