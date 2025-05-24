const BASE_URL = process.env.REACT_APP_API_BASE_URL;
const TOKEN = process.env.REACT_APP_API_TOKEN;

export async function fetchAllStocks() {
  const response = await fetch(`${BASE_URL}/stocks`, {
    headers: { Authorization: TOKEN },
  });
  return response.json();
}

export async function fetchStockPriceHistory(ticker, minutes) {
  const response = await fetch(`${BASE_URL}/stocks/${ticker}?minutes=${minutes}`, {
    headers: { Authorization: TOKEN },
  });
  return response.json();
}
