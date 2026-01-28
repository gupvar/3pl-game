export const CITIES = {
    'Atlanta': { x: 140, y: 150, type: 'Headhaul', label: 'Hub' },
    'Savannah': { x: 330, y: 300, type: 'Headhaul', label: 'Port' },
    'Dalton': { x: 130, y: 50, type: 'Backhaul', label: 'Mfg' },
    'Valdosta': { x: 200, y: 400, type: 'Backhaul', label: 'Ag' },
    'Augusta': { x: 280, y: 180, type: 'Neutral', label: 'Mix' },
    'Columbus': { x: 80, y: 260, type: 'Neutral', label: 'Mix' },
    'Athens': { x: 200, y: 130, type: 'Neutral', label: 'Mix' }
};

export const CUSTOMER_DATABASE = [
    { id: 'c1', name: "Home Depot", comm: "Lumber", mode: "Flatbed", req: "Must Tarp", fee: 5000, volume: 'High', color: 'bg-orange-600', icon: 'Hammer' },
    { id: 'c2', name: "Coca-Cola", comm: "Syrup", mode: "Reefer", req: "Temp: 34°F", fee: 8000, volume: 'High', color: 'bg-red-600', icon: 'CupSoda' },
    { id: 'c3', name: "Georgia Pacific", comm: "Paper", mode: "Dry Van", req: "Clean Trailer", fee: 4000, volume: 'Med', color: 'bg-blue-600', icon: 'ScrollText' },
    { id: 'c4', name: "Shaw Floors", comm: "Carpet", mode: "Dry Van", req: "Floor Load", fee: 3000, volume: 'Med', color: 'bg-teal-600', icon: 'Layers' },
    { id: 'c5', name: "Publix", comm: "Produce", mode: "Reefer", req: "Continuous Cool", fee: 6000, volume: 'High', color: 'bg-green-600', icon: 'Apple' },
    { id: 'c6', name: "Amazon", comm: "Drop Trailer", mode: "Power Only", req: "Bobtail In", fee: 10000, volume: 'Very High', color: 'bg-slate-800', icon: 'Package' }
];

export const CARRIERS = [
    { name: "Swift", score: 75, fleet: "Dry Van" },
    { name: "Old Dominion", score: 95, fleet: "Dry Van" },
    { name: "Maverick", score: 92, fleet: "Flatbed" },
    { name: "Prime Inc", score: 90, fleet: "Reefer" },
    { name: "Billy Bob's Trucking", score: 60, fleet: "Any" },
    { name: "Coyote", score: 85, fleet: "Power Only" },
    { name: "Landstar", score: 88, fleet: "Flatbed" }
];

export const INITIAL_GAME_STATE = {
    userProfile: {
        companyName: "Nano Banana Logistics",
        cash: 50000, // Startup capital
        reputation: 100,
        level: 1
    },
    day: 1,
    customers: [], // Starts empty, must acquire
    loads: [],
    history: [],
    financials: {
        revenue: 0,
        cost: 0,
        dailyHistory: []
    }
};
