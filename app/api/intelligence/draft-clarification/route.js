import { GoogleGenAI } from "@google/genai";

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      instrument_reference = "FDR-2024-ND-001",
      institution_name = "Technical Institution",
      fdr_number = "FDR-123456",
      discrepancy = "Variance noted in submitted record.",
      clause = "Clause 2.25",
    } = body;

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `
You are the Senior Verification Officer at the All India Council for Technical Education (AICTE), Bureau of Approval, New Delhi.
Draft an official, formal Regulatory Clarification Letter to the College Administrator / Principal regarding a discrepancy in their Security Deposit Fixed Deposit Receipt (FDR).

Case Reference: ${instrument_reference}
Institution: ${institution_name}
FDR Certificate Number: ${fdr_number}
Detected Discrepancy: ${discrepancy}
Applicable Regulatory Clause: ${clause} of the AICTE Approval Process Handbook (2024-25 to 2026-27).

Instructions:
- Write in an authoritative, professional, respectful government tone.
- Explain the exact discrepancy clearly.
- Cite the applicable Approval Process Handbook Clause.
- Specify the required corrective documentation (e.g., bank branch manager verification letter, original joint lien endorsement, or rectified deposit certificate).
- Stipulate a statutory compliance window of 7 working days.
- Sign off as:
  Dr. Rajesh Sharma
  Senior Verification Officer
  Bureau of Approval, AICTE Headquarters, New Delhi
`;

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: {
            temperature: 0.2,
          },
        });

        const draftText = response.text || "";
        return Response.json({ success: true, draft: draftText.trim(), is_live_ai: true });
      } catch (geminiErr) {
        console.warn("[Draft Clarification API] Gemini error, using fallback template:", geminiErr.message);
      }
    }

    // Default template fallback
    const fallbackDraft = `To,\nThe Principal / Registrar,\n${institution_name}\n\nSubject: Official Notice: Clarification Regarding Security Deposit FDR (${fdr_number})\nReference: AICTE Approval Process Handbook (2024–27), ${clause}\n\nRespected Sir/Madam,\n\nDuring statutory scrutiny of your security deposit submission (Ref: ${instrument_reference}), the Council verification team has identified the following variance:\n\n• ${discrepancy}\n\nUnder ${clause}, technical institutions must maintain an authentic, unencumbered security deposit jointly lien-marked to the Member Secretary, AICTE without discrepancy.\n\nYou are hereby directed to provide an official clarification endorsed by the issuing bank branch manager, along with relevant supporting proof, within seven (7) working days of receipt of this notice.\n\nYours faithfully,\n\nDr. Rajesh Sharma\nSenior Verification Officer\nBureau of Approval, All India Council for Technical Education (AICTE)\nNelson Mandela Marg, Vasant Kunj, New Delhi - 110070`;

    return Response.json({ success: true, draft: fallbackDraft, is_live_ai: false });
  } catch (err) {
    console.error("[Draft Clarification API] Error:", err);
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
