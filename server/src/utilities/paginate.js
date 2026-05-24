// Author: Refaat
// build the pagination object

export default function paginate(result, total, page, limit, url) {
    const fn = (p) => {
        url.searchParams.set("page", p);
        return url.href;
    }

    const totalPages = Math.ceil(total[0].total/limit);

    return  {
        totalPages,
        totalRows: total[0].total,
        currentPage: page,
        currentRows: result.length,
        links: {
            first: fn(0),
            last: fn(totalPages),
            next: page + 1 > totalPages ? undefined : fn(page + 1),
            prev: page > 1 ? fn(page - 1) : undefined
        }
    };
}
