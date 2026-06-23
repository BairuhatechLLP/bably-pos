export const ApiMetaData = (page: any, limit: any, total: any) => {
  try {
    const skip = (page - 1) * limit;
    total;
    const next = Math.ceil(total / limit) > page + 1 ? page + 1 : page;
    return {
      total: total,
      page: page,
      limit: limit,
      skip: skip,
      total_pages: Math.ceil(total / limit),
      next_page: next,
    };
  } catch (err) {
    return {
      total: total,
      page: page,
      skip: 0,
      total_pages: 1,
      next_page: 1,
    };
  }
};
