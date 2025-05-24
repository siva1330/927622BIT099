// src/pages/Heatmap.js

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Slider,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  TableContainer,
  Paper,
} from "@mui/material";
import axios from "axios";

// Utility functions
const calculateStats = (prices) => {
  const avg = prices.reduce((sum, p) => sum + p, 0) / prices.length;
  const stddev = Math.sqrt(
    prices.reduce((sum, p) => sum + Math.pow(p - avg, 2), 0) / (prices.length - 1)
  );
  return { avg, stddev };
};

const calculateCorrelation = (a, b) => {
  const avgA = a.reduce((s, p) => s + p, 0) / a.length;
  const avgB = b.reduce((s, p) => s + p, 0) / b.length;
  const numerator = a.reduce((sum, ai, i) => sum + (ai - avgA) * (b[i] - avgB), 0);
  const denominator = Math.sqrt(
    a.reduce((sum, ai) => sum + Math.pow(ai - avgA, 2), 0) *
    b.reduce((sum, bi) => sum + Math.pow(bi - avgB, 2), 0)
  );
  return denominator !== 0 ? numerator / denominator : 0;
};

// Color scale helper
const getColor = (value) => {
  const red = Math.floor((1 - value) * 255);
  const green = Math.floor(value * 255);
  return `rgb(${red}, ${green}, 100)`;
};

const Heatmap = () => {
  const [minutes, setMinutes] = useState(50);
  const [stocks, setStocks] = useState({});
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(false);
  const token = process.env.REACT_APP_API_TOKEN;

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const res = await axios.get("http://20.244.56.144/evaluation-service/stocks", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStocks(res.data.stocks);
      } catch (error) {
        console.error("Error fetching stock list:", error);
      }
    };
    fetchStocks();
  }, [token]);

  useEffect(() => {
    const fetchPrices = async () => {
      setLoading(true);
      try {
        const data = {};
        const stockEntries = Object.entries(stocks);
        for (let i = 0; i < stockEntries.length; i++) {
          const [name, symbol] = stockEntries[i];
          const res = await axios.get(
            `http://20.244.56.144/evaluation-service/stocks/${symbol}?minutes=${minutes}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const pricesList = res.data.map((d) => d.price);
          if (pricesList.length > 1) data[symbol] = pricesList;
        }
        setPrices(data);
      } catch (error) {
        console.error("Error fetching price data:", error);
      }
      setLoading(false);
    };

    if (Object.keys(stocks).length) fetchPrices();
  }, [stocks, minutes, token]);

  const symbols = Object.keys(prices);

  return (
    <Box p={4}>
      <Typography variant="h4" mb={2}>
        Correlation Heatmap
      </Typography>

      <Box mb={4}>
        <Typography gutterBottom>Time Window (minutes): {minutes}</Typography>
        <Slider
          value={minutes}
          onChange={(e, newVal) => setMinutes(newVal)}
          min={10}
          max={100}
          step={5}
          valueLabelDisplay="auto"
        />
      </Box>

      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell />
                {symbols.map((s1) => (
                  <TableCell key={s1} align="center">{s1}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {symbols.map((s1) => (
                <TableRow key={s1}>
                  <TableCell>
                    <Tooltip
                      title={
                        prices[s1]
                          ? `Avg: ${calculateStats(prices[s1]).avg.toFixed(
                              2
                            )}, SD: ${calculateStats(prices[s1]).stddev.toFixed(2)}`
                          : ""
                      }
                    >
                      <span>{s1}</span>
                    </Tooltip>
                  </TableCell>
                  {symbols.map((s2) => {
                    const val =
                      prices[s1] && prices[s2] && prices[s1].length === prices[s2].length
                        ? calculateCorrelation(prices[s1], prices[s2])
                        : 0;
                    return (
                      <TableCell
                        key={s2}
                        align="center"
                        style={{ backgroundColor: getColor((val + 1) / 2) }}
                      >
                        {val.toFixed(2)}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default Heatmap;
