import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { access_token } = body;

    if (!access_token) {
      return NextResponse.json(
        { error: "Missing access_token" },
        { status: 400 }
      );
    }

    const topicName = "projects/paipers/topics/paipers-gmail";

    const response = await fetch(
      "https://gmail.googleapis.com/gmail/v1/users/me/watch",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topicName,
          labelIds: ["INBOX"],
        }),
      }
    );

    const data = await response.json();

    console.log("WATCH FULL RESPONSE:", data);

    if (!response.ok) {
      return NextResponse.json(
        { error: data },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (e: any) {
    console.error("WATCH ERROR CATCH:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
