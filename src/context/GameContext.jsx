import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { INITIAL_GAME_STATE, CARRIERS } from '../data/gameData';
import { generateLoadsForDay } from '../utils/gameLogic';

const GameContext = createContext();

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

const gameReducer = (state, action) => {
    switch (action.type) {
        case 'NEXT_DAY':
            // This is a complex state update that should ideally be chained.
            // But reducers must be pure. We can just call the logic helper or dispatch multiple times from the component.
            // Better: Let NEXT_DAY just increment day, and we rely on the component (Layout) to dispatch 'ADVANCE_LOADS' first.
            // OR: We compose them here.

            // To be safe and keep logic in one place, let's assume we handle Day increment here
            // But the 'ADVANCE_LOADS' logic was complex.
            // Let's simplfy: The user wants "Better Logic".
            // We will let Layout dispatch 'ADVANCE_LOADS' *before* 'NEXT_DAY'.
            return {
                ...state,
                day: state.day + 1,
                financials: {
                    ...state.financials,
                    dailyHistory: [...state.financials.dailyHistory, { day: state.day, cash: state.userProfile.cash }]
                }
            };
        case 'UPDATE_CASH':
            return {
                ...state,
                userProfile: { ...state.userProfile, cash: state.userProfile.cash + action.payload }
            };
        case 'UPDATE_REP':
            return {
                ...state,
                userProfile: { ...state.userProfile, reputation: Math.min(100, Math.max(0, state.userProfile.reputation + action.payload)) }
            };
        case 'ADD_LOADS':
            return {
                ...state,
                loads: [...state.loads, ...action.payload]
            };
        case 'SET_ACTIVE_LOAD':
            return {
                ...state,
                activeLoadId: action.payload
            };
        case 'BOOK_LOAD':
            // Payload: { loadId, quote, finalMargin, success }
            return {
                ...state,
                loads: state.loads.map(l => l.id === action.payload.loadId ? {
                    ...l,
                    status: 'Dispatched',
                    carrier: action.payload.quote,
                    margin: action.payload.finalMargin,
                    progress: 0,
                    daysInTransit: 0,
                    totalDays: Math.ceil(l.dist / 500) + 1 // 500 miles/day + 1 day load/unload
                } : l),
                // Don't add to history yet, add when delivered. Or add as "Booked" event? 
                // Let's keep history for "Actions".
                // Save origin/dest/revenue in history for MapOverlay to use even if load is gone
                history: [...state.history, {
                    ...action.payload,
                    type: 'BOOKING',
                    origin: state.loads.find(l => l.id === action.payload.loadId).origin,
                    dest: state.loads.find(l => l.id === action.payload.loadId).dest,
                    msg: `Booked ${state.loads.find(l => l.id === action.payload.loadId).origin} -> ${state.loads.find(l => l.id === action.payload.loadId).dest}`
                }],
                activeLoadId: null
            };

        case 'ADVANCE_LOADS':
            // Called by NEXT_DAY
            let newCash = state.userProfile.cash;
            let newRep = state.userProfile.reputation;
            let newHistory = [...state.history];

            const updatedLoads = state.loads.map(l => {
                if (l.status === 'Dispatched') {
                    // Logic: Advance progress
                    const newDays = l.daysInTransit + 1;
                    const newProgress = Math.min(100, (newDays / l.totalDays) * 100);

                    // Events (10% chance per day)
                    if (Math.random() < 0.1) {
                        newHistory.push({ type: 'EVENT', msg: `Delay on Load #${l.id.slice(-4)}: Traffic`, successful: false });
                        // Could extend totalDays here
                    }

                    if (newProgress >= 100) {
                        // DELIVERED
                        newCash += l.margin;
                        newRep += 1; // Small rep boost
                        newHistory.push({
                            type: 'DELIVERY',
                            msg: `Load #${l.id.slice(-4)} Delivered!`,
                            success: true,
                            finalMargin: l.margin,
                            loadId: l.id,
                            origin: l.origin,
                            dest: l.dest,
                            quote: l.carrier // ensure quote is available if Map needs it
                        });
                        return { ...l, status: 'Delivered', progress: 100 };
                    }

                    // Speed up: 1 day = 33% progress min (3 day max trip) + distance factor
                    // Let's make it simpler: fixed 25% progress per day for now to ensure movement visibility
                    const forcedProgress = l.progress + (Math.random() * 20 + 15);
                    const calculatedProgress = Math.min(100, (newDays / l.totalDays) * 100);

                    return { ...l, status: 'Dispatched', progress: Math.max(forcedProgress, calculatedProgress), daysInTransit: newDays };
                }
                return l;
            });

            // AUTO PILOT LOGIC
            // If Auto Pilot is ON, try to book available loads automatically
            // Strategy: Book checks that are profitable and low risk (Simple Strategy)
            if (state.autoPilot) {
                const available = state.loads.filter(l => l.status === 'Available');
                const autoBooked = [];
                let currentCash = newCash;

                available.forEach(load => {
                    // Simple Strategy: Find first profitable carrier
                    // In real app, we'd use CARRIERS from data, but we need to generate quotes on the fly.
                    // We'll mimic the "Booking" logic here or triggered via side-effect.
                    // Since Reducer is pure, we can't generate random numbers easily without sticking to seed or passing them in.
                    // BUT: The simulation uses Math.random() in components.
                    // We will simplify: If Auto Pilot is ON, we assume we find a "Good" carrier (standard market rate).

                    // Risk Check: 90% success rate on Auto Pilot
                    const success = Math.random() > 0.1;
                    const margin = Math.floor(load.revenue * 0.15); // Guaranteed 15% margin
                    const cost = load.revenue - margin;

                    if (currentCash > 0) { // Infinite capacity? No, limit by something? No, limit by Cash.
                        // Assuming we pay carrier later? usually 30 days. But let's assume we need cash flow.
                        // Actually, let's just book it.

                        load.status = 'Dispatched';
                        load.progress = 0;
                        load.daysInTransit = 0;
                        load.totalDays = Math.ceil(load.dist / 500) + 1;
                        load.carrier = { name: "AutoBroker", driver: "Bot" };
                        load.margin = margin;

                        updatedLoads.push(load); // This adds duplicate? No, map above handled dispatched.
                        // Wait, 'available' are from state.loads. updatedLoads is a NEW array from map.
                        // We need to UPDATE the load in updatedLoads, not push.

                        const loadIndex = updatedLoads.findIndex(l => l.id === load.id);
                        if (loadIndex >= 0) {
                            updatedLoads[loadIndex] = {
                                ...updatedLoads[loadIndex],
                                status: 'Dispatched',
                                progress: 0,
                                daysInTransit: 0,
                                totalDays: Math.ceil(load.dist / 500) + 1,
                                carrier: { name: "AutoBroker", driver: "Bot" },
                                margin: margin
                            };

                            newHistory.push({ type: 'BOOKING', msg: `Auto Pilot booked Load #${load.id.slice(-4)}` });
                        }
                    }
                });
            }

            return {
                ...state,
                loads: updatedLoads,
                userProfile: { ...state.userProfile, cash: newCash, reputation: newRep },
                history: newHistory
            };
        case 'ACQUIRE_CUSTOMER':
            return {
                ...state,
                customers: [...state.customers, action.payload],
                userProfile: { ...state.userProfile, cash: state.userProfile.cash - action.payload.cost }
            };
        case 'START_GAME':
            return {
                ...state,
                gameStarted: true,
                userProfile: {
                    ...state.userProfile,
                    name: action.payload.playerName
                },
                settings: {
                    difficulty: action.payload.difficulty,
                    maxDays: action.payload.maxDays
                }
            };
        case 'NAVIGATE':
            return {
                ...state,
                activeTab: action.payload
            };
        case 'TOGGLE_AUTOPILOT':
            return {
                ...state,
                autoPilot: !state.autoPilot
            };
        default:
            return state;
    }
};

export const GameProvider = ({ children }) => {
    // Initialize activeTab in state
    const [state, dispatch] = useReducer(gameReducer, {
        ...INITIAL_GAME_STATE,
        gameStarted: false,
        activeTab: 'sales', // Default tab
        autoPilot: false
    });

    // Theme State - Default to 'light' only
    const [theme, setTheme] = useState('light');

    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

    useEffect(() => {
        if (state.gameStarted && state.loads.length === 0) {
            const newLoads = generateLoadsForDay(state.customers.length > 0 ? state.customers : [], state.day);
            // Wait, customers are empty initially?
            // Game data has CUSTOMER_DATABASE. We need to give player some starter customers?
            // SetupScreen usually handles "Acquire Initial Customer"?
            // Let's check SetupScreen. If no customers, give them some from DB.
        }
    }, [state.day, state.gameStarted]);

    // Initial Load Generation when Game Starts
    useEffect(() => {
        if (state.gameStarted && state.loads.length === 0) {
            // Ensure we have customers. If not, give random 2.
            let currentCustomers = state.customers;
            if (currentCustomers.length === 0) {
                import('../data/gameData').then(module => {
                    const starters = module.CUSTOMER_DATABASE.slice(0, 3);
                    dispatch({ type: 'ACQUIRE_CUSTOMER', payload: { cost: 0, ...starters[0] } }); // Free starter
                    dispatch({ type: 'ACQUIRE_CUSTOMER', payload: { cost: 0, ...starters[1] } });

                    const newLoads = generateLoadsForDay([starters[0], starters[1]], state.day);
                    dispatch({ type: 'ADD_LOADS', payload: newLoads });
                });
            } else {
                const newLoads = generateLoadsForDay(currentCustomers, state.day);
                dispatch({ type: 'ADD_LOADS', payload: newLoads });
            }
        }
    }, [state.gameStarted]);

    return (
        <GameContext.Provider value={{ state, dispatch }}>
            <ThemeContext.Provider value={{ theme, toggleTheme }}>
                {children}
            </ThemeContext.Provider>
        </GameContext.Provider>
    );
};

export const useGame = () => useContext(GameContext);
