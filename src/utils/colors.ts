const COLORS = [
    '#4f46e5', '#ec4899', '#0ea5e9', '#10b981', '#f59e0b',
    '#8b5cf6', '#ef4444', '#14b8a6', '#f97316', '#6366f1'
]
let colorIndex = 0;
export const getNextColor = () => COLORS[(colorIndex++) % COLORS.length]
