export const processWeeklyData =  (
    data: {day_of_week: number; total: number}[],
    transactionType: "Income" | "Expense" = "Income"
) => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    let barData = days.map((label) => ({
        label,
        value: 0,
    }))
     data.forEach((item) => {
        const dayIndex = item.day_of_week;
        if(dayIndex >= 0 && dayIndex < 7) {
            barData[dayIndex].value = item.total;
        }
     })
};