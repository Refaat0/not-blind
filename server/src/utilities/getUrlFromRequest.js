// Author: Refaat
export default function getUrlFromRequest(request) {
    if (!request) throw Error("getUrl: Request object cannot be null");
    return new URL(`${request.protocol}://${request.get('host')}${request.url}`);
}
