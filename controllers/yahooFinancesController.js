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


async function searchStockSymbol(request, response) {
    try {
        const { companyName } = request.query;

        if (!companyName) {
            return response.status(400).json({ error: "Company name is required" });
        }

        console.log(`Searching for stock symbol for company: ${companyName}`);
        const searchResults = await yahooFinance.search(companyName);

        if (!searchResults.quotes.length) {
            return response.status(404).json({ error: `No symbol found for company name '${companyName}'` });
        }

        const symbol = searchResults.quotes[0].symbol.toUpperCase();
        console.log(`Found stock symbol: ${symbol}`);

        response.json({ symbol });
    } catch (error) {
        console.error("Error searching for stock symbol:", error);
        response.status(500).json({ error: "Error retrieving stock symbol" });
    }
}

module.exports = { searchStockSymbol,  getFinancialDataCharts  };
