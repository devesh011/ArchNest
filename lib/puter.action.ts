import { puter } from "@heyputer/puter.js";
import {
  getOrCreateHostingConfig,
  uploadImageToHosting,
} from "./puter.hosting";
import { isHostedUrl, getHostedUrl, createShareToken } from "./utils";
import { PUTER_WORKER_URL } from "./constants";

export const signIn = async () => {
  const result = await puter.auth.signIn();
  await puter.fs
    .mkdir("projects", { createMissingParents: true })
    .catch(() => {});
  await puter.fs
    .mkdir("shared", { createMissingParents: true })
    .catch(() => {});
  return result;
};

export const signOut = async () => puter.auth.signOut();

export const getCurrentUser = async () => {
  try {
    return await puter.auth.getUser();
  } catch {
    return null;
  }
};

export const getMonthlyUsage = async () => {
  try {
    return await puter.auth.getMonthlyUsage();
  } catch (e) {
    console.error("Failed to fetch monthly usage", e);
    return null;
  }
};

export const getAppStorageUsage = async (): Promise<{
  bytes: number;
  fileCount: number;
}> => {
  let totalBytes = 0;
  let fileCount = 0;

  const walk = async (path: string) => {
    let items;
    try {
      items = await puter.fs.readdir(path);
    } catch (e: any) {
      return;
    }
    for (const item of items as any[]) {
      if (item.is_dir) {
        await walk(item.path);
      } else {
        totalBytes += item.size ?? 0;
        fileCount++;
      }
    }
  };

  await walk("projects");
  await walk("shared");

  return { bytes: totalBytes, fileCount };
};

export const createProject = async ({
  item,
  visibility = "private",
}: CreateProjectParams): Promise<DesignItem | null | undefined> => {
  if (!PUTER_WORKER_URL) {
    console.warn("Missing VITE_PUTER_WORKER_URL; skip history fecth;");
    return null;
  }
  const projectId = item.id;

  const hosting = await getOrCreateHostingConfig();

  const hostedSource = projectId
    ? await uploadImageToHosting({
        hosting,
        url: item.sourceImage,
        projectId,
        label: "source",
      })
    : null;

  const hostedRender =
    projectId && item.renderedImage
      ? await uploadImageToHosting({
          hosting,
          url: item.renderedImage,
          projectId,
          label: "rendered",
        })
      : null;

  const resolvedSource =
    hostedSource?.url ||
    (isHostedUrl(item.sourceImage) ? item.sourceImage : "");

  if (!resolvedSource) {
    console.warn("Failed to host source image, skipping save.");
    return null;
  }

  const resolvedRender = hostedRender?.url
    ? hostedRender?.url
    : item.renderedImage && isHostedUrl(item.renderedImage)
      ? item.renderedImage
      : undefined;

  const {
    sourcePath: _sourcePath,
    renderedPath: _renderedPath,
    publicPath: _publicPath,
    ...rest
  } = item;

  const payload = {
    ...rest,
    sourceImage: resolvedSource,
    renderedImage: resolvedRender,
  };

  try {
    const response = await puter.workers.exec(
      `${PUTER_WORKER_URL}/api/projects/save`,
      {
        method: "POST",
        body: JSON.stringify({
          project: payload,
          visibility,
        }),
      },
    );
    if (!response.ok) {
      console.error("failed to save the project", await response.text());
      return null;
    }
    const data = (await response.json()) as { project?: DesignItem | null };
    return data?.project ?? null;
  } catch (e) {
    console.log("Failed to save project", e);
    return null;
  }
};

export const getProjects = async () => {
  if (!PUTER_WORKER_URL) {
    console.warn("Missing VITE_PUTER_WORKER_URL; skip history fecth;");
    return [];
  }

  try {
    const response = await puter.workers.exec(
      `${PUTER_WORKER_URL}/api/projects/list`,
      { method: "GET" },
    );

    if (!response.ok) {
      console.error("Failed to fetch history", await response.text());
      return [];
    }

    const data = (await response.json()) as { projects?: DesignItem[] | null };
    return Array.isArray(data?.projects) ? data?.projects : [];
  } catch (e) {
    console.error("Failed to get projects", e);
    return [];
  }
};

export const getProjectById = async ({ id }: { id: string }) => {
  if (!PUTER_WORKER_URL) {
    console.warn("Missing VITE_PUTER_WORKER_URL; skipping project fetch.");
    return null;
  }

  try {
    const response = await puter.workers.exec(
      `${PUTER_WORKER_URL}/api/projects/get?id=${encodeURIComponent(id)}`,
      { method: "GET" },
    );

    if (!response.ok) {
      console.error("Failed to fetch project:", await response.text());
      return null;
    }

    const data = (await response.json()) as {
      project?: DesignItem | null;
    };

    return data?.project ?? null;
  } catch (error) {
    console.error("Failed to fetch project:", error);
    return null;
  }
};

export const getPublicProjectById = async ({
  id,
  subdomain,
  token,
}: {
  id: string;
  subdomain: string;
  token: string;
}): Promise<DesignItem | null> => {
  if (!subdomain || !token) {
    console.warn(
      "Missing hosting subdomain or share token; cannot fetch shared project.",
    );
    return null;
  }

  try {
    const url = getHostedUrl({ subdomain }, `shared/${id}/${token}.json`);
    if (!url) return null;

    const bustedUrl = `${url}?_=${Date.now()}`;
    const response = await fetch(bustedUrl, {
      cache: "no-store",
      headers: { "Cache-Control": "no-cache" },
    });

    if (!response.ok) {
      console.error("Shared project not found or not public:", response.status);
      return null;
    }

    const project = (await response.json()) as DesignItem;

    if (!project || project.isPublic !== true) {
      return null;
    }

    return project;
  } catch (error) {
    console.error("Failed to fetch shared project:", error);
    return null;
  }
};

export const shareProject = async ({
  id,
}: {
  id: string;
}): Promise<{
  ok: boolean;
  project?: DesignItem | null;
  publicUrl?: string;
  subdomain?: string;
  shareToken?: string;
  error?: string;
}> => {
  try {
    const hosting = await getOrCreateHostingConfig();
    if (!hosting?.subdomain) {
      return { ok: false, error: "Missing hosting subdomain" };
    }

    const existing = await getProjectById({ id });
    if (!existing) {
      return { ok: false, error: "Project not found" };
    }

    const shareToken = createShareToken();
    const sharedAt = new Date().toISOString();
    const sharedPayload: DesignItem = {
      ...existing,
      isPublic: true,
      sharedAt,
    };

    const dir = `shared/${id}`;
    const path = `${dir}/${shareToken}.json`;

    await puter.fs.mkdir(dir, { createMissingParents: true }).catch(() => {
      // Directory may already exist — safe to ignore.
    });

    const file = new File(
      [JSON.stringify(sharedPayload)],
      `${shareToken}.json`,
      {
        type: "application/json",
      },
    );
    await puter.fs.write(path, file);

    const publicUrl = getHostedUrl({ subdomain: hosting.subdomain }, path);
    if (!publicUrl) {
      return { ok: false, error: "Failed to resolve public URL" };
    }

    const finalPayload = { ...sharedPayload, publicUrl, shareToken };

    if (PUTER_WORKER_URL) {
      try {
        await puter.workers.exec(`${PUTER_WORKER_URL}/api/projects/save`, {
          method: "POST",
          body: JSON.stringify({
            project: finalPayload,
            visibility: "private",
          }),
        });
      } catch (e) {
        console.warn(
          "Shared file written, but failed to sync private KV copy",
          e,
        );
      }
    }

    return {
      ok: true,
      project: finalPayload,
      publicUrl,
      subdomain: hosting.subdomain,
      shareToken,
    };
  } catch (e) {
    console.error("Failed to share project", e);
    return { ok: false, error: (e as Error)?.message || "Unknown error" };
  }
};

export const regenerateShareLink = async ({
  id,
}: {
  id: string;
}): Promise<{
  ok: boolean;
  project?: DesignItem | null;
  publicUrl?: string;
  subdomain?: string;
  shareToken?: string;
  error?: string;
}> => {
  try {
    const existing = await getProjectById({ id });
    if (!existing) {
      return { ok: false, error: "Project not found" };
    }

    const oldToken = existing.shareToken;
    if (oldToken) {
      const oldPath = `shared/${id}/${oldToken}.json`;
      try {
        const tombstone = new File(
          [JSON.stringify({ ...existing, isPublic: false })],
          `${oldToken}.json`,
          { type: "application/json" },
        );
        await puter.fs.write(oldPath, tombstone);
      } catch (e) {
        console.error(
          "Failed to tombstone old share token content during " +
            "regenerate — old link may still work until deletion below " +
            "succeeds:",
          e,
        );
      }
      try {
        await puter.fs.delete(oldPath);
      } catch (e) {
        console.error(
          "puter.fs.delete failed for old share token during regenerate " +
            "— content was still tombstoned above, so the old link " +
            "should still be dead either way:",
          e,
        );
      }
    }
    return await shareProject({ id });
  } catch (e) {
    console.error("Failed to regenerate share link", e);
    return { ok: false, error: (e as Error)?.message || "Unknown error" };
  }
};

export const deleteProject = async ({
  id,
}: {
  id: string;
}): Promise<{ ok: boolean; error?: string }> => {
  if (!PUTER_WORKER_URL) {
    return { ok: false, error: "Missing worker URL" };
  }

  try {
    const response = await puter.workers.exec(
      `${PUTER_WORKER_URL}/api/projects/delete`,
      {
        method: "POST",
        body: JSON.stringify({ id }),
      },
    );

    if (!response.ok) {
      const text = await response.text();
      console.error("Failed to delete project", text);
      return { ok: false, error: text };
    }
    try {
      await puter.fs.delete(`projects/${id}`, { recursive: true });
    } catch (e) {
      console.warn("Could not delete project files (may not exist)", e);
    }

    try {
      await puter.fs.delete(`shared/${id}.json`);
    } catch (e) {
      console.warn("Could not delete shared file (may not exist)", e);
    }

    return { ok: true };
  } catch (e) {
    console.error("Failed to delete project", e);
    return { ok: false, error: (e as Error)?.message || "Unknown error" };
  }
};
