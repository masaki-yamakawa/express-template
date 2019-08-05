export const mockGetRequest = (query) => ({
    query,
});

export const mockPostRequest = (body) => ({
    body,
});

export const mockResponse = () => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};
