const yahooFinance = require('yahoo-finance2').default;

async function getFinancialDataCharts(request, response) {
    try {
        const { symbol, startDate, endDate, interval } = request.query;

        if (!symbol) {
            return response.status(400).json({ error: 'Symbol is required' });
        }
        if (!startDate || !endDate) {
            return response.status(400).json({ error: 'Start date and end date are required' });
        }
        if (!interval) {
            return response.status(400).json({ error: 'Interval is required' });
        }

        const queryOptions = {
            period1: startDate,
            period2: endDate,
            interval: interval,
        };

        const results = await yahooFinance.chart(symbol.toLowerCase(), queryOptions);
        console.log('Results finances:', results);

        response.json(results);
    } catch (error) {
        console.error('Error fetching financial data:', error);
        response.status(500).json({ error: error.message || 'Internal Server Error' });
    }
}

module.exports = { getFinancialDataCharts };
