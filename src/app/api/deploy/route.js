import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

export async function POST(request) {
  try {
    const { cloudProvider, env, pattern, designId } = await request.json();

    let dbDeployment = null;
    const loggedLines = [];

    // If we have a design ID, create a record in the deployment history
    if (designId) {
      try {
        dbDeployment = await prisma.deployment.create({
          data: {
            designId,
            environment: env || 'prod',
            status: 'running',
            logs: JSON.stringify([]),
          }
        });
      } catch (dbErr) {
        console.error('Failed to create deployment record:', dbErr);
      }
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const steps = [
          `[00:00] Initializing Terraform for ${env || 'production'} environment...`,
          `[00:01] Validating configuration for ${cloudProvider}...`,
          `[00:02] Planning infrastructure changes...`,
          `[00:04] Creating virtual networking resources & security boundaries...`,
          `[00:08] Provisioning ${cloudProvider === "AWS" ? "EC2 Auto-Scaling Group / Container Cluster" : "App Services / AKS Scale Set"}...`,
          `[00:12] Setting up managed database cluster with active replica...`,
          `[00:16] Configuring distributed caching layer...`,
          `[00:19] Applying security groups, IAM policies, and RBAC rules...`,
          `[00:22] Configuring load balancing, SSL endpoints, and CDN routing...`,
          `[00:24] Running final container health checks and network sanity tests...`,
          `[00:25] ✅ Infrastructure successfully deployed to ${cloudProvider}!`,
          `[00:25] Public Endpoint: https://${pattern?.split(" ")[0]?.toLowerCase() || 'infra'}.${env || "prod"}.${cloudProvider?.toLowerCase() || 'aws'}.io`,
        ];

        for (let i = 0; i < steps.length; i++) {
          const step = steps[i];
          loggedLines.push(step);

          // Simulate variable delay between steps
          const delay = i === steps.length - 1 ? 500 : 1200;
          await new Promise(resolve => setTimeout(resolve, delay));
          
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ log: step, isDone: i === steps.length - 1 })}\n\n`
            )
          );
        }

        // Update database with final success state and completed logs
        if (dbDeployment) {
          try {
            await prisma.deployment.update({
              where: { id: dbDeployment.id },
              data: {
                status: 'success',
                logs: JSON.stringify(loggedLines)
              }
            });
          } catch (dbErr) {
            console.error('Failed to update deployment to success:', dbErr);
          }
        }
        controller.close();
      },
      async cancel() {
        // Handle stream cancellation (failure state)
        if (dbDeployment) {
          try {
            loggedLines.push(`[Error] Deployment interrupted by user.`);
            await prisma.deployment.update({
              where: { id: dbDeployment.id },
              data: {
                status: 'failed',
                logs: JSON.stringify(loggedLines)
              }
            });
          } catch (dbErr) {
            console.error('Failed to update deployment to failed:', dbErr);
          }
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Deploy route error:', error);
    return NextResponse.json({ error: 'Failed to deploy' }, { status: 500 });
  }
}
export const dynamic = 'force-dynamic';
