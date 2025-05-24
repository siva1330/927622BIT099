// src/pages/StockPage.js

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  CircularProgress,
  Container,
  Typography,
  Select,
  MenuItem,
} from '@mui/material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

const API_URL = 'http://20.244.56.144/evaluation-service/stocks';
const TOKEN = process.env.REACT_APP_API_TOKEN;

const StockPage = () => {
  const [stocks, setStocks] = useState({});
  const [selectedStock, setSelectedStock] = useState('');
  const [priceHistory, setPriceHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [timeFrame, setTimeFrame] = useState(30); // default 30 minutes
  const [error, setError] = useState('');

  const fetchAllStocks = useCallback(async () => {
    try {
      const response = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
        },
      });
      const data = response.data;
      if (data && typeof data === 'object') {
        setStocks(data.stocks || {});
      } else {
        throw new Error('Invalid stock data received.');
      }
    } catch (err) {
      console.error('Failed to fetch stocks', err);
      setError('Failed to load stock list.');
    }
  }, []);

  const fetchStockPriceHistory = useCallback(async () => {
    if (!selectedStock) return;
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_URL}/${selectedStock}?minutes=${timeFrame}`, {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
        },
      });
      const formatted = (response.data || []).map((item) => ({
        price: item.price,
        time: item.lastUpdatedAt,
      }));
      setPriceHistory(formatted);
    } catch (err) {
      console.error('Failed to fetch price history', err);
      setError('Failed to load price history.');
    } finally {
      setLoading(false);
    }
  }, [selectedStock, timeFrame]);

  useEffect(() => {
    fetchAllStocks();
  }, [fetchAllStocks]);

  useEffect(() => {
    fetchStockPriceHistory();
  }, [selectedStock, timeFrame, fetchStockPriceHistory]);

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Stock Price Viewer
      </Typography>

      {error && <Typography color="error">{error}</Typography>}

      <Select
        value={selectedStock}
        onChange={(e) => setSelectedStock(e.target.value)}
        displayEmpty
        fullWidth
      >
        <MenuItem value="" disabled>
          Select a stock
        </MenuItem>
        {stocks &&
          Object.entries(stocks).map(([name, ticker]) => (
            <MenuItem key={ticker} value={ticker}>
              {name}
            </MenuItem>
          ))}
      </Select>

      <Select
        value={timeFrame}
        onChange={(e) => setTimeFrame(e.target.value)}
        displayEmpty
        fullWidth
        style={{ marginTop: '1rem' }}
      >
        <MenuItem value={5}>Last 5 minutes</MenuItem>
        <MenuItem value={15}>Last 15 minutes</MenuItem>
        <MenuItem value={30}>Last 30 minutes</MenuItem>
        <MenuItem value={60}>Last 60 minutes</MenuItem>
      </Select>

      {loading ? (
        <CircularProgress style={{ marginTop: '2rem' }} />
      ) : (
        priceHistory.length > 0 && (
          <Line
            data={{
              labels: priceHistory.map((item) =>
                new Date(item.time).toLocaleTimeString()
              ),
              datasets: [
                {
                  label: `${selectedStock} Price`,
                  data: priceHistory.map((item) => item.price),
                  fill: false,
                  borderColor: 'blue',
                  tension: 0.1,
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  display: true,
                },
                tooltip: {
                  enabled: true,
                },
              },
            }}
          />
        )
      )}
    </Container>
  );
};

export default StockPage;
