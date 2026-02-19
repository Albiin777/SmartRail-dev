/**
 * Train Controller — RailRadar API proxy with in-memory cache
 *
 * Cache strategy: every API response is stored in a Map with a 10-minute TTL.
 * Repeated requests within that window cost zero API calls.
 */

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const cache = new Map();

/* ────────────── helpers ────────────── */

function getCached(key) {
    const entry = cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.ts > CACHE_TTL_MS) {
        cache.delete(key);
        return null;
    }
    console.log(`[CACHE HIT] ${key}`);
    return entry.data;
}

function setCache(key, data) {
    cache.set(key, { data, ts: Date.now() });
}

async function railradarFetch(path) {
    const base = process.env.RAILRADAR_API_BASE || 'https://railradar.in/api/v1';
    const apiKey = process.env.RAILRADAR_API_KEY;

    const url = `${base}${path}`;
    console.log(`[API CALL] ${url}`);

    const headers = { 'Accept': 'application/json' };
    if (apiKey) headers['X-API-Key'] = apiKey;

    const res = await fetch(url, { headers });

    if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`RailRadar API ${res.status}: ${text}`);
    }

    return res.json();
}

/* ────────────── controllers ────────────── */

/**
 * GET /api/trains/:trainNumber
 * Returns basic train details (name, type, classes, source, destination, etc.)
 */
export async function getTrainDetails(req, res) {
    try {
        const { trainNumber } = req.params;
        const cacheKey = `train:${trainNumber}`;

        const cached = getCached(cacheKey);
        if (cached) return res.json({ success: true, source: 'cache', data: cached });

        const data = await railradarFetch(`/trains/${trainNumber}`);
        setCache(cacheKey, data);

        return res.json({ success: true, source: 'api', data });
    } catch (err) {
        console.error('[getTrainDetails]', err.message);
        return res.status(502).json({ success: false, error: err.message });
    }
}

/**
 * GET /api/trains/:trainNumber/schedule
 * Returns full schedule with all stops, arrival/departure times.
 */
export async function getTrainSchedule(req, res) {
    try {
        const { trainNumber } = req.params;
        const cacheKey = `schedule:${trainNumber}`;

        const cached = getCached(cacheKey);
        if (cached) return res.json({ success: true, source: 'cache', data: cached });

        const data = await railradarFetch(`/trains/${trainNumber}/schedule`);
        setCache(cacheKey, data);

        return res.json({ success: true, source: 'api', data });
    } catch (err) {
        console.error('[getTrainSchedule]', err.message);
        return res.status(502).json({ success: false, error: err.message });
    }
}

/**
 * GET /api/trains/between?from=SRC&to=DEST
 * Returns trains running between two station codes.
 */
export async function getTrainsBetween(req, res) {
    try {
        const { from, to } = req.query;

        if (!from || !to) {
            return res.status(400).json({
                success: false,
                error: 'Both "from" and "to" query params are required',
            });
        }

        const cacheKey = `between:${from.toUpperCase()}:${to.toUpperCase()}`;

        const cached = getCached(cacheKey);
        if (cached) return res.json({ success: true, source: 'cache', data: cached });

        const data = await railradarFetch(
            `/trains/between?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
        );
        setCache(cacheKey, data);

        return res.json({ success: true, source: 'api', data });
    } catch (err) {
        console.error('[getTrainsBetween]', err.message);
        return res.status(502).json({ success: false, error: err.message });
    }
}

/**
 * GET /api/trains/search/stations?q=QUERY
 * Autocomplete suggestions for station names/codes.
 */
export async function searchStations(req, res) {
    try {
        const { q } = req.query;
        if (!q || q.length < 2) {
            return res.json({ success: true, data: [] });
        }

        const cacheKey = `search:station:${q.toLowerCase()}`;
        const cached = getCached(cacheKey);
        if (cached) return res.json({ success: true, source: 'cache', data: cached });

        const data = await railradarFetch(
            `/search/stations?query=${encodeURIComponent(q)}`
        );
        setCache(cacheKey, data);

        return res.json({ success: true, source: 'api', data });
    } catch (err) {
        console.error('[searchStations]', err.message);
        return res.status(502).json({ success: false, error: err.message });
    }
}

/**
 * GET /api/trains/search/trains?q=QUERY
 * Autocomplete suggestions for train names/numbers.
 */
export async function searchTrains(req, res) {
    try {
        const { q } = req.query;
        if (!q || q.length < 2) {
            return res.json({ success: true, data: [] });
        }

        const cacheKey = `search:train:${q.toLowerCase()}`;
        const cached = getCached(cacheKey);
        if (cached) return res.json({ success: true, source: 'cache', data: cached });

        const data = await railradarFetch(
            `/search/trains?query=${encodeURIComponent(q)}`
        );
        setCache(cacheKey, data);

        return res.json({ success: true, source: 'api', data });
    } catch (err) {
        console.error('[searchTrains]', err.message);
        return res.status(502).json({ success: false, error: err.message });
    }
}
