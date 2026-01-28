import { CITIES } from '../data/gameData';

export const calculateDistance = (cityA, cityB) => {
    const start = CITIES[cityA];
    const end = CITIES[cityB];
    if (!start || !end) return 0;

    // Simple Euclidean distance scaled for the map
    return Math.floor(Math.sqrt(Math.pow(start.x - end.x, 2) + Math.pow(start.y - end.y, 2)) * 1.5);
};

export const generateLoadsForDay = (activeCustomers, day) => {
    const newLoads = [];
    const cityKeys = Object.keys(CITIES);

    activeCustomers.forEach(cust => {
        // Volume logic: High volume = more loads per day
        let loadCount = 0;
        if (cust.volume === 'High') loadCount = Math.random() > 0.3 ? 2 : 1;
        else if (cust.volume === 'Very High') loadCount = Math.random() > 0.1 ? 3 : 2;
        else loadCount = Math.random() > 0.6 ? 1 : 0; // Med volume

        for (let i = 0; i < loadCount; i++) {
            const origin = cityKeys[Math.floor(Math.random() * cityKeys.length)];
            let dest = origin;
            while (dest === origin) dest = cityKeys[Math.floor(Math.random() * cityKeys.length)];

            const dist = calculateDistance(origin, dest);

            // Rate Logic from original HTML
            let ratePerMile = 2.5;
            let marketType = "Neutral";
            const originData = CITIES[origin];

            if (originData.type === 'Headhaul') {
                ratePerMile = 3.8; // Increased from 3.5
                marketType = "Headhaul";
            } else if (originData.type === 'Backhaul') {
                ratePerMile = 2.2; // Increased from 1.8
                marketType = "Backhaul";
            }

            // Mode Premiums
            if (cust.mode === 'Reefer') ratePerMile += 0.5;
            if (cust.mode === 'Flatbed') ratePerMile += 0.6;
            if (cust.mode === 'Power Only') ratePerMile -= 0.4;

            const revenue = Math.floor(dist * ratePerMile);

            newLoads.push({
                id: `${day}-${cust.id}-${i}-${Date.now()}`,
                custId: cust.id,
                custName: cust.name,
                comm: cust.comm,
                mode: cust.mode,
                req: cust.req,
                origin: origin,
                dest: dest,
                dist: dist,
                market: marketType,
                revenue: revenue,
                revenue: revenue,
                // Margin between 15% and 30%
                baseCost: Math.floor(revenue * (0.7 + Math.random() * 0.15)),
                status: 'Available', // Available, Covered, Delivered, Problem
                createdDay: day
            });
        }
    });

    return newLoads;
};
