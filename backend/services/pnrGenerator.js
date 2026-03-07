// PNR Generation Logic
// Format: 10 Digits
// First 3: Zone Code (System)
// Next 7: Random Unique

const supabase = require('../db/supabase');

// Map of station zones (Simplified for demo)
const ZONE_MAP = {
    'TVC': 211, 'ERS': 212, 'CLT': 213, 'CAN': 214,
    'MAQ': 215, 'PGT': 216, 'TCR': 217, 'KTYM': 218,
    'ALLP': 219, 'QLN': 220, 'NCJ': 221, 'SRR': 222
};

const getZoneCode = (sourceStation) => {
    // Default to 299 if unknown
    return (ZONE_MAP[sourceStation.toUpperCase()] || 299).toString();
};

const generateRandom7 = () => {
    return Math.floor(1000000 + Math.random() * 9000000).toString();
};

const generateUniquePNR = async (sourceStation) => {
    let isUnique = false;
    let pnr = '';
    const zoneCode = getZoneCode(sourceStation);

    while (!isUnique) {
        const uniqueId = generateRandom7();
        pnr = `${zoneCode}${uniqueId}`;

        // Check DB for existing PNR
        const { data, error } = await supabase
            .from('pnr_bookings')
            .select('pnr')
            .eq('pnr', pnr)
            .single();

        if (error && error.code === 'PGRST116') { // Not found error code (PostgREST)
            isUnique = true;
        } else if (!data) {
             isUnique = true;
        }
        // If data exists, loop again
    }
    return pnr;
};

module.exports = { generateUniquePNR };
