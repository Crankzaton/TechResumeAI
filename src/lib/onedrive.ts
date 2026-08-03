import type { AgentSettings, ResumeData } from "./types";

export function isOneDriveConfigured(settings: AgentSettings): boolean {
  const od = settings.oneDrive;
  return Boolean(
    od?.enabled && od.clientId && od.clientSecret && od.refreshToken,
  );
}

async function getAccessToken(settings: AgentSettings): Promise<string> {
  const od = settings.oneDrive;
  const tokenUrl = `https://login.microsoftonline.com/${od.tenantId || "common"}/oauth2/v2.0/token`;
  const body = new URLSearchParams({
    client_id: od.clientId,
    client_secret: od.clientSecret,
    refresh_token: od.refreshToken,
    grant_type: "refresh_token",
    scope: "offline_access Files.ReadWrite User.Read",
  });

  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const data = (await res.json()) as {
    access_token?: string;
    error_description?: string;
  };
  if (!res.ok || !data.access_token) {
    throw new Error(data.error_description || "OneDrive token refresh failed");
  }
  return data.access_token;
}

/** Upload resume JSON snapshot to OneDrive folder. */
export async function saveResumeToOneDrive(
  settings: AgentSettings,
  resume: ResumeData,
): Promise<{ ok: boolean; webUrl?: string; itemId?: string; error?: string }> {
  if (!isOneDriveConfigured(settings)) {
    return {
      ok: false,
      error:
        "OneDrive not configured. Set ONEDRIVE_* credentials in Agent settings.",
    };
  }

  try {
    const token = await getAccessToken(settings);
    const folder = (settings.oneDrive.folderPath || "TechResumeAI").replace(
      /^\/+|\/+$/g,
      "",
    );
    const fileName = `${resume.resumeNumber}_${resume.fullName.replace(/[^a-zA-Z0-9_-]+/g, "_")}_v${resume.designVersion}.json`;
    const path = `/me/drive/root:/${folder}/${fileName}:/content`;

    const res = await fetch(`https://graph.microsoft.com/v1.0${path}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(resume, null, 2),
    });

    const data = (await res.json()) as {
      id?: string;
      webUrl?: string;
      error?: { message?: string };
    };

    if (!res.ok) {
      return {
        ok: false,
        error: data.error?.message || `OneDrive upload failed (${res.status})`,
      };
    }

    return { ok: true, webUrl: data.webUrl, itemId: data.id };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "OneDrive upload failed",
    };
  }
}
