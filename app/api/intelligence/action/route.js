import { recordIntelligenceAction } from "@/lib/dataService";

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      caseId = "rel-001",
      actionType, // "ACKNOWLEDGE_FINDING" | "REQUEST_CORRECTION" | "RESOLVE_FINDING"
      findingId,
      findingClause,
      remarks,
      actorName = "Dr. Rajesh Sharma (Senior Reviewer)",
      actorRole = "reviewer",
    } = body;

    if (!actionType || !remarks) {
      return Response.json(
        { success: false, message: "actionType and remarks are required." },
        { status: 400 }
      );
    }

    const result = await recordIntelligenceAction({
      caseId,
      actionType,
      findingId,
      findingClause,
      remarks,
      actorName,
      actorRole,
    });

    return Response.json({
      success: true,
      message: `Action "${actionType}" recorded successfully.`,
      result,
    });
  } catch (err) {
    console.error("[API intelligence/action] Error:", err);
    return Response.json(
      { success: false, error: err.message || "Failed to record reviewer action." },
      { status: 500 }
    );
  }
}
