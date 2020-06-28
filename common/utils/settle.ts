// Settle all promises but throw error at the end if any of the promises rejected

export const settle = async (tasks: unknown[]) => {
  const results = await Promise.allSettled(tasks);

  for (const result of results) {
    if (result.status === "rejected") {
      throw result.reason;
    }
  }

  return results;
};
