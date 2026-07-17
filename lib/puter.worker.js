const PROJECT_PREFIX = "archnest_project_";
const PUBLIC_PROJECT_PREFIX = "archnest_public_project_";

const jsonError = (status, message, extra = {}) => {
  return new Response(JSON.stringify({ error: message, ...extra }), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
};

const getAuthUser = async (userPuter) => {
  try {
    const authUser = await userPuter.auth.getUser();
    if (!authUser?.uuid) return null;
    return {
      id: authUser.uuid,
      username: authUser.username || authUser.uuid,
    };
  } catch {
    return null;
  }
};

router.post("/api/projects/save", async ({ request, user }) => {
  try {
    const userPuter = user.puter;

    if (!userPuter) return jsonError(401, "Authentication failed");

    const body = await request.json();
    const project = body?.project;

    if (!project?.id || !project?.sourceImage)
      return jsonError(400, "Project ID and source image are required");

    const authUser = await getAuthUser(userPuter);
    if (!authUser) return jsonError(401, "Authentication failed");

    const key = `${PROJECT_PREFIX}${project.id}`;
    const existing = await userPuter.kv.get(key);

    const payload = {
      ...project,
      isPublic: project.isPublic ?? false,
      ownerId: existing?.ownerId || authUser.id,
      ownerUsername: existing?.ownerUsername || authUser.username,
      updatedAt: new Date().toISOString(),
    };

    await userPuter.kv.set(key, payload);

    return { saved: true, id: project.id, project: payload };
  } catch (e) {
    return jsonError(500, "Failed to save project", {
      message: e.message || "Unknown error",
    });
  }
});

router.get("/api/projects/list", async ({ user }) => {
  try {
    const userPuter = user.puter;
    if (!userPuter) return jsonError(401, "Authentication failed");

    const authUser = await getAuthUser(userPuter);
    if (!authUser) return jsonError(401, "Authentication failed");

    const projects = (await userPuter.kv.list(PROJECT_PREFIX, true)).map(
      ({ value }) => ({ ...value, isPublic: !!value.isPublic }),
    );

    return { projects };
  } catch (e) {
    return jsonError(500, "Failed to list projects", {
      message: e.message || "Unknown error",
    });
  }
});

router.get("/api/projects/get", async ({ request, user }) => {
  try {
    const userPuter = user.puter;
    if (!userPuter) return jsonError(401, "Authentication failed");

    const authUser = await getAuthUser(userPuter);
    if (!authUser) return jsonError(401, "Authentication failed");

    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) return jsonError(400, "Project ID is required");

    const key = `${PROJECT_PREFIX}${id}`;
    const project = await userPuter.kv.get(key);

    if (!project) return jsonError(404, "Project not found");

    return { project };
  } catch (e) {
    return jsonError(500, "Failed to get project", {
      message: e.message || "Unknown error",
    });
  }
});

router.get("/api/projects/get-public", async ({ request, user }) => {
  try {
    const userPuter = user.puter;
    if (!userPuter) return jsonError(401, "This project is not shared");

    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) return jsonError(400, "Project ID is required");

    const publicKey = `${PUBLIC_PROJECT_PREFIX}${id}`;
    const project = await userPuter.kv.get(publicKey);

    if (!project || !project.isPublic) {
      return jsonError(404, "This project is not shared or does not exist");
    }

    return { project };
  } catch (e) {
    return jsonError(500, "Failed to get shared project", {
      message: e.message || "Unknown error",
    });
  }
});

router.post("/api/projects/share", async ({ request, user }) => {
  try {
    const userPuter = user.puter;
    if (!userPuter) return jsonError(401, "Authentication failed");

    const authUser = await getAuthUser(userPuter);
    if (!authUser) return jsonError(401, "Authentication failed");

    const body = await request.json();
    const id = body?.id;
    if (!id) return jsonError(400, "Project ID is required");

    const privateKey = `${PROJECT_PREFIX}${id}`;
    const project = await userPuter.kv.get(privateKey);
    if (!project) return jsonError(404, "Project not found");

    const sharedAt = new Date().toISOString();
    const publicPayload = {
      ...project,
      isPublic: true,
      ownerId: authUser.id,
      ownerUsername: authUser.username,
      sharedAt,
    };

    const publicKey = `${PUBLIC_PROJECT_PREFIX}${id}`;
    await userPuter.kv.set(publicKey, publicPayload);
    await userPuter.kv.set(privateKey, publicPayload);

    return { shared: true, project: publicPayload };
  } catch (e) {
    return jsonError(500, "Failed to share project", {
      message: e.message || "Unknown error",
    });
  }
});

router.post("/api/projects/delete", async ({ request, user }) => {
  try {
    const userPuter = user.puter;
    if (!userPuter) return jsonError(401, "Authentication failed");

    const authUser = await getAuthUser(userPuter);
    if (!authUser) return jsonError(401, "Authentication failed");

    const body = await request.json();
    const id = body?.id;
    if (!id) return jsonError(400, "Project ID is required");

    const privateKey = `${PROJECT_PREFIX}${id}`;
    const existing = await userPuter.kv.get(privateKey);
    if (!existing) return jsonError(404, "Project not found");

    await userPuter.kv.del(privateKey);

    try {
      const publicKey = `${PUBLIC_PROJECT_PREFIX}${id}`;
      await userPuter.kv.del(publicKey);
    } catch {
      // Fine if it never existed.
    }

    return { deleted: true, id };
  } catch (e) {
    return jsonError(500, "Failed to delete project", {
      message: e.message || "Unknown error",
    });
  }
});
