import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const designId = searchParams.get('id');

    if (designId) {
      // Fetch a specific design with its deployment history
      const design = await prisma.design.findUnique({
        where: { id: designId },
        include: { deployments: { orderBy: { createdAt: 'desc' } } }
      });

      if (!design) {
        return NextResponse.json({ error: 'Design not found' }, { status: 404 });
      }

      // Parse JSON fields
      return NextResponse.json({
        ...design,
        architecture: JSON.parse(design.architecture),
        costs: JSON.parse(design.costs),
        deployments: design.deployments.map(d => ({
          ...d,
          logs: JSON.parse(d.logs)
        }))
      });
    }

    // Otherwise, fetch all designs for the sidebar history list (omitting heavy fields like terraformCode for speed)
    const designs = await prisma.design.findMany({
      select: {
        id: true,
        prompt: true,
        cloudProvider: true,
        scale: true,
        region: true,
        pattern: true,
        createdAt: true,
        costs: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    const parsedDesigns = designs.map(d => ({
      ...d,
      costs: JSON.parse(d.costs)
    }));

    return NextResponse.json(parsedDesigns);
  } catch (error) {
    console.error('History API error:', error);
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}
