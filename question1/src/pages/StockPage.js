import React, { useEffect, useState, useCallback } from 'react';

const API_URL = 'http://20.244.56.144/evaluation-service/stocks';
const TOKEN = process.env.REACT_APP_API_TOKEN;

const StockPage = () => {
  const [stockList, setStockList] = useState({});
  const [selectedStock, setSelectedStock] = useState('');
  const [priceHistory, setPriceHistory] = useState([]);

  const loadStockData = useCallback(async () => {
    try {
      const res = await fetch(API_URL, {
        headers: { Authorization: TOKEN },
      });
      const data = await res.json();
      setStockList(data.stocks);
    } catch (err) {
      console.error('Error loading stock list', err);
    }
  }, []);

  const fetchPriceHistory = async (ticker) => {
    try {
      const res = await fetch(`${API_URL}/${ticker}?minutes=50`, {
        headers: { Authorization: TOKEN },
      });
      const data = await res.json();
      setPriceHistory(data);
    } catch (err) {
      console.error('Error fetching price history', err);
    }
  };

  useEffect(() => {
    loadStockData();
  }, [loadStockData]);

  return (
    <div>
      <h2>Stock Page</h2>
      <select onChange={(e) => {
        const ticker = e.target.value;
        setSelectedStock(ticker);
        fetchPriceHistory(ticker);
      }}>
        <option value="">Select Stock</option>
        {Object.entries(stockList).map(([name, ticker]) => (
          <option key={ticker} value={ticker}>
            {name}
          </option>
        ))}
      </select>

      {selectedStock && (
        <div>
          <h3>{selectedStock} - Last 50 min</h3>
          <ul>
            {priceHistory.map((p, i) => (
              <li key={i}>
                {p.lastUpdatedAt}: ${p.price.toFixed(2)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default StockPage;

