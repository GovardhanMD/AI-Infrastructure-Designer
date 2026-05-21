# Full-Stack AI Infrastructure Generator Implementation

This plan outlines the steps to build out the complete end-to-end "AI Infrastructure Designer" based on your prototype and requirements. This involves refactoring the Next.js app into a premium, multi-step wizard, connecting to a real AI model for generation, and implementing the deployment engine simulator.

## User Review Required

> [!IMPORTANT]
> **AI Provider Choice:** To perform *real* AI architecture and Terraform generation, we need an AI model. I propose using the **Vercel AI SDK with Google Gemini (`@ai-sdk/google`)**. 
> 
> **Are you okay with this?** You will need to provide a `GOOGLE_GENERATIVE_AI_API_KEY` in your `.env.local` file for it to work. If you prefer to stick to a highly advanced mock backend (like the one in your prototype) to avoid API keys, please let me know.

## Open Questions

> [!WARNING]
> 1. **React Flow Integration:** Your prototype uses a custom `ArchDiagram` component, but we currently have `@xyflow/react` (React Flow) installed. Should we use the interactive React Flow diagram for the architecture, or the simpler custom one from your prototype? (I propose using React Flow for a more premium, interactive experience).
> 2. **Deployment Engine:** I will implement the deployment engine as a realistic simulation (streaming logs of provisioning resources). Actual infrastructure deployment would require extensive cloud credentials and SDK integrations. Is the simulated UI acceptable for the deployment step?

## Proposed Changes

---

### 1. Project Dependencies

#### [MODIFY] package.json
Install the AI SDK to enable real AI generation.
- Install `ai` and `@ai-sdk/google`.

---

### 2. Backend & APIs

#### [MODIFY] src/app/api/generate/route.js
Rewrite the backend to connect to a real AI model using the AI SDK.
- Use `generateObject` or `streamText` from the AI SDK to parse the user's requirements.
- Instruct the AI to return structured JSON containing: 
  - `nodes` and `edges` for the React Flow diagram.
  - `terraformCode` tailored to their requirements and cloud provider.
  - `costs` array with estimates.
  - `analysis` text explaining the design decisions.
- If the API key is missing, gracefully fallback to an advanced local mock engine (similar to `detectPattern` in your prototype).

#### [NEW] src/app/api/deploy/route.js
Create an API route to simulate the deployment process.
- Stream realistic deployment logs back to the frontend to power the "Deployment Engine" UI.

---

### 3. Frontend Application & UI

#### [MODIFY] src/app/page.js
Refactor the main page into a multi-step animated wizard (Apple-style UI).
- Step 0: Requirements Form (with Cloud and Scale selection).
- Step 1: Architecture & AI Analysis (React Flow + streamed AI analysis).
- Step 2: Cost Estimator (Animated progress bars and monthly projections).
- Step 3: Terraform Configuration (Syntax-highlighted code block with copy button).
- Step 4: Deployment Engine (Environment selection and streaming console logs).
- Use `framer-motion` for smooth layout transitions (`<AnimatePresence mode="wait">`) between steps.

#### [NEW] src/components/DeploymentEngine.js
Implement the deploy panel from your prototype with premium styling.
- Environment selection cards (Production, Staging, Dev).
- Animated deployment button.
- Real-time simulated terminal output window that fetches from the `/api/deploy` route.

#### [NEW] src/components/WizardProgress.js
Implement the step indicator dots with smooth CSS transitions.

#### [MODIFY] src/components/RequirementsForm.js
Enhance the form to include cloud provider (AWS/Azure) and scale selection buttons.

#### [MODIFY] src/components/ArchitectureDiagram.js
Update the React Flow diagram to look incredibly sleek, utilizing custom nodes and edge styling (glassmorphism, vibrant gradients for the specific cloud provider).

#### [MODIFY] src/components/CostEstimator.js
Implement the animated cost bars from the prototype.

#### [MODIFY] src/components/TerraformViewer.js
Enhance the code block to include basic syntax highlighting and a copy-to-clipboard button.

## Verification Plan

### Automated/Manual Verification
1. Start the Next.js development server (`npm run dev`).
2. Input a sample requirement (e.g., "High traffic e-commerce site").
3. Verify the frontend seamlessly transitions through the 5 steps using Framer Motion.
4. Verify the backend calls the AI SDK (if key provided) or fallback logic, and returns correct JSON.
5. Verify the deployment engine streams logs correctly and completes.
