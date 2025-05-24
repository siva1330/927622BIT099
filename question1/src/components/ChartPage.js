import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Paper
} from "@mui/material";
import { Line } from "react-chartjs-2";
import axios from "axios";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

const ChartPage = () => {
  const [stocks, setStocks] = useState({});
  const [selectedStock, setSelectedStock] = useState("");
  const [priceData, setPriceData] = useState([]);
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
    const fetchPriceData = async () => {
      if (!selectedStock) return;
      setLoading(true);
      try {
        const res = await axios.get(
          `http://20.244.56.144/evaluation-service/stocks/${selectedStock}?minutes=50`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setPriceData(res.data);
      } catch (error) {
        console.error("Error fetching stock prices:", error);
      }
      setLoading(false);
    };
    fetchPriceData();
  }, [selectedStock, token]);

  const chartData = {
    labels: priceData.map((_, index) => index),
    datasets: [
      {
        label: selectedStock,
        data: priceData.map((d) => d.price),
        borderColor: "#3f51b5",
        backgroundColor: "rgba(63, 81, 181, 0.3)",
        fill: true,
      },
    ],
  };

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        Stock Price Chart
      </Typography>

      <FormControl fullWidth sx={{ mb: 4 }}>
        <InputLabel>Select Stock</InputLabel>
        <Select
          value={selectedStock}
          onChange={(e) => setSelectedStock(e.target.value)}
          label="Select Stock"
        >
          {Object.entries(stocks).map(([name, symbol]) => (
            <MenuItem key={symbol} value={symbol}>
              {name} ({symbol})
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {loading ? (
        <CircularProgress />
      ) : (
        priceData.length > 0 && (
          <Paper sx={{ p: 2 }}>
            <Line data={chartData} />
          </Paper>
        )
      )}
    </Box>
  );
};

export default ChartPage;
