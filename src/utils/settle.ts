// Settle all promises but throw error at the end if any of the promises rejected
export const settle = async <T extends readonly unknown[]>(
  tasks: T
): Promise<
  {
    -readonly [P in keyof T]: PromiseSettledResult<
      T[P] extends PromiseLike<infer U> ? U : T[P]
    >;
  }
> => {
  const results = await Promise.allSettled(tasks);

  for (const result of results) {
    if (result.status === "rejected") {
      throw result.reason;
    }
  }

  return results;
};
