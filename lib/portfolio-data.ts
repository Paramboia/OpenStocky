export interface Transaction {
  id: string
  date: string
  type: "buy" | "sell"
  symbol: string
  shares: number
  pricePerShare: number
  fees: number
  transactionCost: number
  comments?: string
}

export interface Holding {
  symbol: string
  shares: number
  avgCost: number
  totalCost: number
  currentPrice: number
  currentValue: number
  gainLoss: number
  gainLossPercent: number
}

// Parse the raw transaction data
export const transactions: Transaction[] = [
  { id: "1", date: "2017-11-27", type: "buy", symbol: "GOOGL", shares: 1, pricePerShare: 1058.57, fees: 20, transactionCost: 1078.57 },
  { id: "2", date: "2017-11-27", type: "buy", symbol: "TSLA", shares: 3, pricePerShare: 310, fees: 20, transactionCost: 950 },
  { id: "3", date: "2017-11-29", type: "buy", symbol: "BABA", shares: 3, pricePerShare: 178.4875, fees: 20, transactionCost: 555.4625 },
  { id: "4", date: "2017-11-29", type: "buy", symbol: "AMZN", shares: 1, pricePerShare: 1190, fees: 20, transactionCost: 1210 },
  { id: "5", date: "2017-11-29", type: "buy", symbol: "META", shares: 5, pricePerShare: 181.85, fees: 20, transactionCost: 929.25 },
  { id: "6", date: "2018-03-09", type: "sell", symbol: "AMZN", shares: 1, pricePerShare: 1567.09, fees: 19, transactionCost: 1548.09 },
  { id: "7", date: "2018-06-15", type: "sell", symbol: "BABA", shares: 3, pricePerShare: 208.3901, fees: 19, transactionCost: 606.1703 },
  { id: "8", date: "2018-06-15", type: "sell", symbol: "GOOGL", shares: 1, pricePerShare: 1160, fees: 19, transactionCost: 1141 },
  { id: "9", date: "2018-06-15", type: "sell", symbol: "META", shares: 5, pricePerShare: 195.7901, fees: 19, transactionCost: 959.9505 },
  { id: "10", date: "2018-06-15", type: "sell", symbol: "TSLA", shares: 3, pricePerShare: 358.61, fees: 19, transactionCost: 1056.83 },
  { id: "11", date: "2018-06-18", type: "buy", symbol: "ADDYY", shares: 5, pricePerShare: 195, fees: 20, transactionCost: 995 },
  { id: "12", date: "2018-06-18", type: "buy", symbol: "SPOT", shares: 7, pricePerShare: 173.46, fees: 20, transactionCost: 1234.22 },
  { id: "13", date: "2018-06-18", type: "buy", symbol: "VRTX", shares: 6, pricePerShare: 153.9, fees: 20, transactionCost: 943.4 },
  { id: "14", date: "2018-07-02", type: "sell", symbol: "VRTX", shares: 6, pricePerShare: 168.2401, fees: 19, transactionCost: 990.4406 },
  { id: "15", date: "2018-07-11", type: "buy", symbol: "ALXN", shares: 9, pricePerShare: 131, fees: 20, transactionCost: 1199 },
  { id: "16", date: "2018-08-09", type: "sell", symbol: "ADDYY", shares: 5, pricePerShare: 210, fees: 19, transactionCost: 1031 },
  { id: "17", date: "2018-08-09", type: "buy", symbol: "META", shares: 6, pricePerShare: 185, fees: 20, transactionCost: 1130 },
  { id: "18", date: "2018-08-13", type: "sell", symbol: "SPOT", shares: 7, pricePerShare: 190, fees: 19, transactionCost: 1311 },
  { id: "19", date: "2018-08-13", type: "buy", symbol: "BABA", shares: 7, pricePerShare: 178.6, fees: 20, transactionCost: 1270.2 },
  { id: "20", date: "2019-01-02", type: "buy", symbol: "AMZN", shares: 1, pricePerShare: 1465.2, fees: 20, transactionCost: 1485.2 },
  { id: "21", date: "2019-01-08", type: "sell", symbol: "AMZN", shares: 1, pricePerShare: 1665, fees: 19, transactionCost: 1646 },
  { id: "22", date: "2019-01-08", type: "buy", symbol: "AAPL", shares: 8, pricePerShare: 149, fees: 20, transactionCost: 1212 },
  { id: "23", date: "2019-02-05", type: "sell", symbol: "AAPL", shares: 8, pricePerShare: 175, fees: 19, transactionCost: 1381 },
  { id: "24", date: "2019-02-07", type: "buy", symbol: "TSLA", shares: 3, pricePerShare: 313.65, fees: 20, transactionCost: 960.95 },
  { id: "25", date: "2019-04-01", type: "buy", symbol: "LEVI", shares: 49, pricePerShare: 22.7, fees: 20, transactionCost: 1132.3 },
  { id: "26", date: "2019-04-01", type: "sell", symbol: "ALXN", shares: 9, pricePerShare: 136.58, fees: 19, transactionCost: 1210.22 },
  { id: "27", date: "2019-04-09", type: "sell", symbol: "BABA", shares: 7, pricePerShare: 187, fees: 19, transactionCost: 1290 },
  { id: "28", date: "2019-04-10", type: "buy", symbol: "CNC", shares: 20, pricePerShare: 57, fees: 20, transactionCost: 1160 },
  { id: "29", date: "2019-04-29", type: "sell", symbol: "META", shares: 6, pricePerShare: 194.5, fees: 19, transactionCost: 1148 },
  { id: "30", date: "2019-04-30", type: "buy", symbol: "APHA", shares: 149, pricePerShare: 7.35, fees: 20, transactionCost: 1115.15 },
  { id: "31", date: "2019-07-03", type: "buy", symbol: "UBER", shares: 7, pricePerShare: 44, fees: 20, transactionCost: 328 },
  { id: "32", date: "2019-11-12", type: "sell", symbol: "TSLA", shares: 3, pricePerShare: 346.9, fees: 19, transactionCost: 1021.7 },
  { id: "33", date: "2019-11-22", type: "buy", symbol: "JMIA", shares: 130, pricePerShare: 5.5, fees: 20, transactionCost: 735 },
  { id: "34", date: "2019-12-09", type: "sell", symbol: "CNC", shares: 20, pricePerShare: 61.18, fees: 19, transactionCost: 1204.6 },
  { id: "35", date: "2019-12-10", type: "buy", symbol: "GM", shares: 31, pricePerShare: 35.3, fees: 20, transactionCost: 1114.3 },
  { id: "36", date: "2020-01-02", type: "sell", symbol: "JMIA", shares: 130, pricePerShare: 6.93, fees: 19, transactionCost: 881.9 },
  { id: "37", date: "2020-03-10", type: "buy", symbol: "GE", shares: 60, pricePerShare: 8.5, fees: 0, transactionCost: 510 },
  { id: "38", date: "2020-03-10", type: "buy", symbol: "DIS", shares: 5, pricePerShare: 107.57, fees: 20, transactionCost: 557.85 },
  { id: "39", date: "2020-03-10", type: "buy", symbol: "CRM", shares: 3, pricePerShare: 157.69, fees: 20, transactionCost: 493.07 },
  { id: "40", date: "2020-03-10", type: "buy", symbol: "SNAP", shares: 45, pricePerShare: 11.59, fees: 20, transactionCost: 541.55 },
  { id: "41", date: "2020-03-10", type: "buy", symbol: "V", shares: 3, pricePerShare: 178.58, fees: 20, transactionCost: 555.74 },
  { id: "42", date: "2020-03-10", type: "buy", symbol: "AAPL", shares: 4, pricePerShare: 280.6575, fees: 20, transactionCost: 1142.63 },
  { id: "43", date: "2020-03-10", type: "buy", symbol: "MSFT", shares: 3, pricePerShare: 158.785, fees: 20, transactionCost: 496.355 },
  { id: "44", date: "2020-04-27", type: "sell", symbol: "SNAP", shares: 45, pricePerShare: 16.25, fees: 19, transactionCost: 712.25 },
  { id: "45", date: "2020-05-26", type: "sell", symbol: "AAPL", shares: 4, pricePerShare: 323.48, fees: 19, transactionCost: 1274.92 },
  { id: "46", date: "2020-06-29", type: "buy", symbol: "JNJ", shares: 8, pricePerShare: 138.5, fees: 20, transactionCost: 1128 },
  { id: "47", date: "2020-06-29", type: "sell", symbol: "CRM", shares: 3, pricePerShare: 182.67, fees: 19, transactionCost: 529.01 },
  { id: "48", date: "2020-06-29", type: "sell", symbol: "MSFT", shares: 3, pricePerShare: 197.446, fees: 19, transactionCost: 573.338 },
  { id: "49", date: "2020-06-30", type: "buy", symbol: "VZ", shares: 20, pricePerShare: 55.488, fees: 20, transactionCost: 1129.76 },
  { id: "50", date: "2020-07-01", type: "buy", symbol: "PFE", shares: 30, pricePerShare: 34.18, fees: 20, transactionCost: 1045.4 },
  { id: "51", date: "2020-07-02", type: "buy", symbol: "XOM", shares: 25, pricePerShare: 44.35, fees: 20, transactionCost: 1128.75 },
  { id: "52", date: "2020-07-02", type: "buy", symbol: "NLSN", shares: 35, pricePerShare: 14.78, fees: 20, transactionCost: 537.3 },
  { id: "53", date: "2020-07-02", type: "buy", symbol: "TPR", shares: 40, pricePerShare: 13.17, fees: 20, transactionCost: 546.8 },
  { id: "54", date: "2020-07-03", type: "buy", symbol: "REP", shares: 20, pricePerShare: 8.004, fees: 20, transactionCost: 180.08 },
  { id: "55", date: "2020-07-03", type: "buy", symbol: "SAN", shares: 100, pricePerShare: 2.58, fees: 10, transactionCost: 268 },
  { id: "56", date: "2020-07-06", type: "buy", symbol: "APERAM", shares: 1, pricePerShare: 28.41, fees: 10, transactionCost: 38.41 },
  { id: "57", date: "2020-07-06", type: "buy", symbol: "ENB", shares: 5, pricePerShare: 30.6, fees: 20, transactionCost: 173 },
  { id: "58", date: "2020-07-08", type: "buy", symbol: "APERAM", shares: 3, pricePerShare: 28.86, fees: 10, transactionCost: 96.58 },
  { id: "59", date: "2020-07-13", type: "buy", symbol: "MO", shares: 14, pricePerShare: 40.27, fees: 20, transactionCost: 583.78 },
  { id: "60", date: "2020-07-13", type: "buy", symbol: "CVX", shares: 12, pricePerShare: 85.23, fees: 20, transactionCost: 1042.76 },
  { id: "61", date: "2020-07-28", type: "buy", symbol: "LYB", shares: 8, pricePerShare: 69, fees: 20, transactionCost: 572 },
  { id: "62", date: "2020-08-24", type: "sell", symbol: "DIS", shares: 5, pricePerShare: 130.4, fees: 19, transactionCost: 633 },
  { id: "63", date: "2020-08-25", type: "buy", symbol: "CSCO", shares: 15, pricePerShare: 42.18, fees: 20, transactionCost: 652.7 },
  { id: "64", date: "2020-08-26", type: "buy", symbol: "LTC", shares: 15, pricePerShare: 36.55, fees: 20, transactionCost: 568.25 },
  { id: "65", date: "2020-08-28", type: "sell", symbol: "V", shares: 3, pricePerShare: 215, fees: 20, transactionCost: 625 },
  { id: "66", date: "2020-10-20", type: "sell", symbol: "GM", shares: 31, pricePerShare: 36.2, fees: 20, transactionCost: 1102.2 },
  { id: "67", date: "2020-10-20", type: "sell", symbol: "GE", shares: 60, pricePerShare: 9.3, fees: 0, transactionCost: 558 },
  { id: "68", date: "2020-11-16", type: "sell", symbol: "NLSN", shares: 35, pricePerShare: 16, fees: 20, transactionCost: 540 },
  { id: "69", date: "2020-11-17", type: "sell", symbol: "APERAM", shares: 4, pricePerShare: 36.62, fees: 10, transactionCost: 136.48 },
  { id: "70", date: "2020-11-17", type: "sell", symbol: "TPR", shares: 40, pricePerShare: 28, fees: 20, transactionCost: 1100 },
  { id: "71", date: "2020-11-23", type: "sell", symbol: "SAN", shares: 100, pricePerShare: 2.8, fees: 10, transactionCost: 270 },
  { id: "72", date: "2020-12-31", type: "buy", symbol: "NVTA", shares: 13, pricePerShare: 44.2, fees: 20, transactionCost: 594.6 },
  { id: "73", date: "2021-01-08", type: "buy", symbol: "LMT", shares: 2, pricePerShare: 341.88, fees: 20, transactionCost: 703.76 },
  { id: "74", date: "2021-01-08", type: "buy", symbol: "DLR", shares: 5, pricePerShare: 133, fees: 20, transactionCost: 685 },
  { id: "75", date: "2021-01-28", type: "buy", symbol: "AMC", shares: 12, pricePerShare: 13, fees: 20, transactionCost: 176 },
  { id: "76", date: "2021-01-28", type: "buy", symbol: "NOK", shares: 100, pricePerShare: 5.35, fees: 20, transactionCost: 555 },
  { id: "77", date: "2021-02-02", type: "buy", symbol: "REP", shares: 1, pricePerShare: 0, fees: 0, transactionCost: 0 },
  { id: "78", date: "2021-02-04", type: "sell", symbol: "APHA", shares: 92, pricePerShare: 17, fees: 20, transactionCost: 1544 },
  { id: "79", date: "2021-02-10", type: "sell", symbol: "APHA", shares: 17, pricePerShare: 24, fees: 20, transactionCost: 388 },
  { id: "80", date: "2021-02-24", type: "sell", symbol: "REP", shares: 21, pricePerShare: 10.235, fees: 20, transactionCost: 194.935 },
  { id: "81", date: "2021-02-25", type: "sell", symbol: "LEVI", shares: 49, pricePerShare: 23.5, fees: 20, transactionCost: 1131.5 },
  { id: "82", date: "2021-03-02", type: "buy", symbol: "PRLB", shares: 4, pricePerShare: 144.88, fees: 20, transactionCost: 599.52 },
  { id: "83", date: "2021-03-22", type: "sell", symbol: "APHA", shares: 20, pricePerShare: 21, fees: 20, transactionCost: 400 },
  { id: "84", date: "2021-04-12", type: "sell", symbol: "UBER", shares: 7, pricePerShare: 59, fees: 20, transactionCost: 393 },
  { id: "85", date: "2021-05-06", type: "sell", symbol: "APHA", shares: 20, pricePerShare: 0, fees: 0, transactionCost: 0 },
  { id: "86", date: "2021-05-06", type: "buy", symbol: "TLRY", shares: 17, pricePerShare: 0, fees: 0, transactionCost: 0 },
  { id: "87", date: "2021-05-26", type: "sell", symbol: "AMC", shares: 12, pricePerShare: 19.5, fees: 20, transactionCost: 214 },
  { id: "88", date: "2021-06-09", type: "sell", symbol: "TLRY", shares: 17, pricePerShare: 20.67, fees: 20, transactionCost: 331.39 },
  { id: "89", date: "2021-06-22", type: "sell", symbol: "LYB", shares: 8, pricePerShare: 103.21, fees: 20, transactionCost: 805.68 },
  { id: "90", date: "2021-06-25", type: "sell", symbol: "NOK", shares: 100, pricePerShare: 5.45, fees: 20, transactionCost: 525 },
  { id: "91", date: "2021-07-12", type: "sell", symbol: "XOM", shares: 25, pricePerShare: 61.3, fees: 20, transactionCost: 1512.5 },
  { id: "92", date: "2021-07-12", type: "sell", symbol: "CVX", shares: 12, pricePerShare: 104.1, fees: 20, transactionCost: 1229.2 },
  { id: "93", date: "2021-07-13", type: "sell", symbol: "CSCO", shares: 15, pricePerShare: 53.5, fees: 20, transactionCost: 782.5 },
  { id: "94", date: "2021-07-23", type: "buy", symbol: "DIDI", shares: 60, pricePerShare: 10.5, fees: 20, transactionCost: 650 },
  { id: "95", date: "2021-08-09", type: "buy", symbol: "RDFN", shares: 15, pricePerShare: 55.78, fees: 20, transactionCost: 856.7 },
  { id: "96", date: "2021-08-18", type: "buy", symbol: "SOFI", shares: 40, pricePerShare: 14.3, fees: 20, transactionCost: 592 },
  { id: "97", date: "2021-08-23", type: "buy", symbol: "COIN", shares: 2, pricePerShare: 258, fees: 20, transactionCost: 536 },
  { id: "98", date: "2021-08-26", type: "buy", symbol: "BABA", shares: 4, pricePerShare: 169.1, fees: 20, transactionCost: 696.4 },
  { id: "99", date: "2021-09-08", type: "buy", symbol: "COIN", shares: 2, pricePerShare: 259, fees: 20, transactionCost: 538 },
  { id: "100", date: "2021-09-10", type: "buy", symbol: "COIN", shares: 1, pricePerShare: 255, fees: 20, transactionCost: 275 },
  { id: "101", date: "2021-09-21", type: "buy", symbol: "COIN", shares: 2, pricePerShare: 233.5, fees: 20, transactionCost: 487 },
  { id: "102", date: "2021-11-30", type: "buy", symbol: "XYZ", shares: 3, pricePerShare: 207, fees: 20, transactionCost: 641 },
  { id: "103", date: "2021-12-09", type: "buy", symbol: "SOFI", shares: 40, pricePerShare: 16.08, fees: 20, transactionCost: 663.2 },
  { id: "104", date: "2021-12-13", type: "sell", symbol: "PFE", shares: 30, pricePerShare: 53.6, fees: 20, transactionCost: 1588 },
  { id: "105", date: "2021-12-13", type: "buy", symbol: "COIN", shares: 2, pricePerShare: 253, fees: 20, transactionCost: 526 },
  { id: "106", date: "2021-12-14", type: "buy", symbol: "COIN", shares: 2, pricePerShare: 247.99, fees: 20, transactionCost: 515.98 },
  { id: "107", date: "2022-01-03", type: "buy", symbol: "COIN", shares: 4, pricePerShare: 253, fees: 20, transactionCost: 1032 },
  { id: "108", date: "2022-01-11", type: "buy", symbol: "COIN", shares: 4, pricePerShare: 225, fees: 20, transactionCost: 920 },
  { id: "109", date: "2022-01-11", type: "buy", symbol: "XYZ", shares: 6, pricePerShare: 144, fees: 20, transactionCost: 884 },
  { id: "110", date: "2022-02-01", type: "buy", symbol: "COIN", shares: 7, pricePerShare: 190, fees: 20, transactionCost: 1350 },
  { id: "111", date: "2022-03-07", type: "buy", symbol: "COIN", shares: 4, pricePerShare: 162, fees: 20, transactionCost: 668 },
  { id: "112", date: "2022-04-07", type: "buy", symbol: "COIN", shares: 3, pricePerShare: 166, fees: 20, transactionCost: 518 },
  { id: "113", date: "2022-05-06", type: "buy", symbol: "COIN", shares: 10, pricePerShare: 107, fees: 20, transactionCost: 1090 },
  { id: "114", date: "2022-05-06", type: "buy", symbol: "DIS", shares: 10, pricePerShare: 110, fees: 20, transactionCost: 1120 },
  { id: "115", date: "2022-05-13", type: "sell", symbol: "JNJ", shares: 8, pricePerShare: 178.89, fees: 20, transactionCost: 1411.12 },
  { id: "116", date: "2022-05-13", type: "sell", symbol: "LMT", shares: 2, pricePerShare: 435, fees: 20, transactionCost: 850 },
  { id: "117", date: "2022-05-14", type: "buy", symbol: "COIN", shares: 25, pricePerShare: 69, fees: 20, transactionCost: 1745 },
  { id: "118", date: "2022-05-16", type: "buy", symbol: "SNOW", shares: 5, pricePerShare: 155.8, fees: 20, transactionCost: 799 },
  { id: "119", date: "2022-06-13", type: "buy", symbol: "DNA", shares: 50, pricePerShare: 2.6, fees: 20, transactionCost: 150 },
  { id: "120", date: "2022-06-14", type: "buy", symbol: "COIN", shares: 4, pricePerShare: 52, fees: 20, transactionCost: 228 },
  { id: "121", date: "2022-08-22", type: "buy", symbol: "RKLB", shares: 50, pricePerShare: 5.65, fees: 20, transactionCost: 302.5 },
  { id: "122", date: "2022-08-30", type: "buy", symbol: "COIN", shares: 10, pricePerShare: 66, fees: 20, transactionCost: 680 },
  { id: "123", date: "2022-09-22", type: "buy", symbol: "RKLB", shares: 110, pricePerShare: 4.92, fees: 20, transactionCost: 561.2 },
  { id: "124", date: "2022-10-05", type: "buy", symbol: "ADBE", shares: 2, pricePerShare: 291.44, fees: 20, transactionCost: 602.88 },
  { id: "125", date: "2022-11-01", type: "buy", symbol: "COIN", shares: 10, pricePerShare: 66, fees: 20, transactionCost: 680 },
  { id: "126", date: "2022-11-09", type: "buy", symbol: "COIN", shares: 10, pricePerShare: 46, fees: 20, transactionCost: 480 },
  { id: "127", date: "2022-11-23", type: "buy", symbol: "SNOW", shares: 4, pricePerShare: 142, fees: 20, transactionCost: 588 },
  { id: "128", date: "2022-12-12", type: "buy", symbol: "COIN", shares: 10, pricePerShare: 39.9, fees: 20, transactionCost: 419 },
  { id: "129", date: "2023-02-02", type: "sell", symbol: "ADBE", shares: 2, pricePerShare: 396, fees: 20, transactionCost: 772 },
  { id: "130", date: "2023-08-10", type: "buy", symbol: "COIN", shares: 8, pricePerShare: 83, fees: 7, transactionCost: 671 },
  { id: "131", date: "2023-09-13", type: "buy", symbol: "RKLB", shares: 150, pricePerShare: 5.3, fees: 20, transactionCost: 815 },
  { id: "132", date: "2023-09-20", type: "buy", symbol: "RKLB", shares: 150, pricePerShare: 4.5, fees: 20, transactionCost: 695 },
  { id: "133", date: "2023-12-14", type: "sell", symbol: "SNOW", shares: 9, pricePerShare: 196, fees: 20, transactionCost: 1744 },
  { id: "134", date: "2024-01-12", type: "buy", symbol: "COIN", shares: 20, pricePerShare: 140, fees: 20, transactionCost: 2820 },
  { id: "135", date: "2024-01-16", type: "buy", symbol: "COIN", shares: 10, pricePerShare: 129.15, fees: 20, transactionCost: 1311.5 },
  { id: "136", date: "2024-01-19", type: "buy", symbol: "COIN", shares: 10, pricePerShare: 124, fees: 20, transactionCost: 1260 },
  { id: "137", date: "2024-03-11", type: "sell", symbol: "COIN", shares: 40, pricePerShare: 270, fees: 60, transactionCost: 10740 },
  { id: "138", date: "2024-03-15", type: "buy", symbol: "COIN", shares: 30, pricePerShare: 225.35, fees: 20, transactionCost: 6780.5 },
  { id: "139", date: "2024-03-19", type: "buy", symbol: "COIN", shares: 10, pricePerShare: 223.24, fees: 20, transactionCost: 2252.4 },
  { id: "140", date: "2024-04-01", type: "sell", symbol: "DIS", shares: 10, pricePerShare: 122, fees: 20, transactionCost: 1200 },
  { id: "141", date: "2024-04-12", type: "buy", symbol: "RKLB", shares: 500, pricePerShare: 3.8, fees: 20, transactionCost: 1920 },
  { id: "142", date: "2024-04-17", type: "buy", symbol: "COIN", shares: 10, pricePerShare: 218, fees: 20, transactionCost: 2200 },
  { id: "143", date: "2024-05-01", type: "buy", symbol: "COIN", shares: 10, pricePerShare: 199, fees: 20, transactionCost: 2010 },
  { id: "144", date: "2024-05-10", type: "sell", symbol: "MO", shares: 14, pricePerShare: 45, fees: 7, transactionCost: 623 },
  { id: "145", date: "2024-05-10", type: "sell", symbol: "ENB", shares: 5, pricePerShare: 38, fees: 3, transactionCost: 187 },
  { id: "146", date: "2024-05-14", type: "sell", symbol: "COIN", shares: 5, pricePerShare: 200, fees: 10, transactionCost: 990 },
  { id: "147", date: "2024-05-31", type: "sell", symbol: "DLR", shares: 5, pricePerShare: 145, fees: 4, transactionCost: 721 },
  { id: "148", date: "2024-06-26", type: "buy", symbol: "GTLB", shares: 20, pricePerShare: 49, fees: 10, transactionCost: 990 },
  { id: "149", date: "2024-07-24", type: "buy", symbol: "CRWD", shares: 4, pricePerShare: 268, fees: 10, transactionCost: 1082 },
  { id: "150", date: "2024-07-26", type: "buy", symbol: "CRWD", shares: 4, pricePerShare: 254, fees: 10, transactionCost: 1026 },
  { id: "151", date: "2024-07-30", type: "buy", symbol: "CRWD", shares: 4, pricePerShare: 231, fees: 10, transactionCost: 934 },
  { id: "152", date: "2024-07-31", type: "sell", symbol: "NVTA", shares: 13, pricePerShare: 0, fees: 0, transactionCost: 0 },
  { id: "153", date: "2024-08-05", type: "buy", symbol: "COIN", shares: 5, pricePerShare: 192, fees: 10, transactionCost: 970 },
  { id: "154", date: "2024-08-07", type: "buy", symbol: "GTLB", shares: 10, pricePerShare: 43, fees: 10, transactionCost: 440 },
  { id: "155", date: "2024-08-07", type: "buy", symbol: "COIN", shares: 5, pricePerShare: 179, fees: 10, transactionCost: 905 },
  { id: "156", date: "2024-08-20", type: "sell", symbol: "RKLB", shares: 300, pricePerShare: 7.2, fees: 20, transactionCost: 2140 },
  { id: "157", date: "2024-08-21", type: "sell", symbol: "DNA", shares: 49, pricePerShare: 0, fees: 0, transactionCost: 0 },
  { id: "158", date: "2024-08-21", type: "sell", symbol: "CRWD", shares: 12, pricePerShare: 272, fees: 10, transactionCost: 3254 },
  { id: "159", date: "2024-09-03", type: "buy", symbol: "COIN", shares: 5, pricePerShare: 182, fees: 10, transactionCost: 920 },
  { id: "160", date: "2024-09-03", type: "buy", symbol: "BABA", shares: 10, pricePerShare: 81.73, fees: 10, transactionCost: 827.3 },
  { id: "161", date: "2024-09-03", type: "buy", symbol: "COIN", shares: 5, pricePerShare: 170.7, fees: 10, transactionCost: 863.5 },
  { id: "162", date: "2024-09-05", type: "buy", symbol: "COIN", shares: 5, pricePerShare: 161.62, fees: 10, transactionCost: 818.1 },
  { id: "163", date: "2024-09-19", type: "sell", symbol: "RKLB", shares: 602, pricePerShare: 7.5, fees: 20, transactionCost: 4495 },
  { id: "164", date: "2024-09-25", type: "sell", symbol: "RKLB", shares: 58, pricePerShare: 7.59, fees: 20, transactionCost: 420.22 },
  { id: "165", date: "2024-09-26", type: "buy", symbol: "GTLB", shares: 10, pricePerShare: 50.9, fees: 10, transactionCost: 519 },
  { id: "166", date: "2024-09-27", type: "buy", symbol: "SNOW", shares: 20, pricePerShare: 113.7, fees: 20, transactionCost: 2294 },
  { id: "167", date: "2024-09-30", type: "buy", symbol: "BABA", shares: 10, pricePerShare: 106.5, fees: 10, transactionCost: 1075 },
  { id: "168", date: "2024-09-30", type: "buy", symbol: "COIN", shares: 10, pricePerShare: 178.3, fees: 10, transactionCost: 1793 },
  { id: "169", date: "2024-10-01", type: "buy", symbol: "GTLB", shares: 20, pricePerShare: 50.39, fees: 10, transactionCost: 1017.8 },
  { id: "170", date: "2024-10-01", type: "buy", symbol: "COIN", shares: 10, pricePerShare: 163.3, fees: 10, transactionCost: 1643 },
  { id: "171", date: "2024-10-11", type: "buy", symbol: "ADYEN", shares: 1, pricePerShare: 1366, fees: 10, transactionCost: 1376 },
  { id: "172", date: "2024-10-18", type: "buy", symbol: "BABA", shares: 10, pricePerShare: 101.96, fees: 10, transactionCost: 1029.6 },
  { id: "173", date: "2024-11-29", type: "buy", symbol: "BABA", shares: 30, pricePerShare: 86, fees: 10, transactionCost: 2590 },
  { id: "174", date: "2024-12-04", type: "sell", symbol: "SNOW", shares: 15, pricePerShare: 183, fees: 10, transactionCost: 2735 },
  { id: "175", date: "2024-12-04", type: "sell", symbol: "GTLB", shares: 50, pricePerShare: 67.16, fees: 10, transactionCost: 3348 },
  { id: "176", date: "2024-12-04", type: "sell", symbol: "COIN", shares: 100, pricePerShare: 325, fees: 10, transactionCost: 32490 },
  { id: "177", date: "2024-12-17", type: "buy", symbol: "BABA", shares: 50, pricePerShare: 85.7785, fees: 10, transactionCost: 4298.925 },
  { id: "178", date: "2025-01-31", type: "sell", symbol: "GTLB", shares: 10, pricePerShare: 73.5, fees: 10, transactionCost: 725 },
  { id: "179", date: "2025-01-31", type: "sell", symbol: "SNOW", shares: 5, pricePerShare: 185.5, fees: 10, transactionCost: 917.5 },
  { id: "180", date: "2025-02-19", type: "sell", symbol: "ADYEN", shares: 1, pricePerShare: 1933.47, fees: 10, transactionCost: 1923.47 },
  { id: "181", date: "2025-02-21", type: "buy", symbol: "COIN", shares: 40, pricePerShare: 257, fees: 10, transactionCost: 10290 },
  { id: "182", date: "2025-02-24", type: "buy", symbol: "COIN", shares: 20, pricePerShare: 236, fees: 10, transactionCost: 4730 },
  { id: "183", date: "2025-02-25", type: "buy", symbol: "COIN", shares: 20, pricePerShare: 209, fees: 10, transactionCost: 4190 },
  { id: "184", date: "2025-03-03", type: "buy", symbol: "COIN", shares: 20, pricePerShare: 211, fees: 10, transactionCost: 4230 },
  { id: "185", date: "2025-03-11", type: "buy", symbol: "COIN", shares: 10, pricePerShare: 191, fees: 10, transactionCost: 1920 },
  { id: "186", date: "2025-03-13", type: "buy", symbol: "SNPS", shares: 5, pricePerShare: 431.63, fees: 10, transactionCost: 2168.15 },
  { id: "187", date: "2025-04-01", type: "buy", symbol: "COIN", shares: 10, pricePerShare: 172.5, fees: 10, transactionCost: 1735 },
  { id: "188", date: "2025-04-07", type: "buy", symbol: "SNPS", shares: 5, pricePerShare: 375.96, fees: 10, transactionCost: 1889.8 },
  { id: "189", date: "2025-04-07", type: "buy", symbol: "COIN", shares: 10, pricePerShare: 146, fees: 10, transactionCost: 1470 },
  { id: "190", date: "2025-04-09", type: "buy", symbol: "BABA", shares: 25, pricePerShare: 99, fees: 10, transactionCost: 2485 },
  { id: "191", date: "2025-06-03", type: "buy", symbol: "SNPS", shares: 4, pricePerShare: 464.56, fees: 10, transactionCost: 1868.24 },
  { id: "192", date: "2025-06-13", type: "buy", symbol: "GTLB", shares: 100, pricePerShare: 42.82, fees: 10, transactionCost: 4292 },
  { id: "193", date: "2025-06-19", type: "buy", symbol: "LVMHF", shares: 5, pricePerShare: 520.43, fees: 10, transactionCost: 2612.15 },
  { id: "194", date: "2025-06-24", type: "sell", symbol: "COIN", shares: 100, pricePerShare: 338, fees: 165, transactionCost: 33635 },
  { id: "195", date: "2025-06-26", type: "sell", symbol: "COIN", shares: 20, pricePerShare: 372, fees: 40, transactionCost: 7400 },
  { id: "196", date: "2025-07-02", type: "sell", symbol: "SOFI", shares: 20, pricePerShare: 18, fees: 10, transactionCost: 350 },
  { id: "197", date: "2025-07-02", type: "sell", symbol: "RDFN", shares: 15, pricePerShare: 0, fees: 0, transactionCost: 0, comments: "Redfin completes merger with Rocket Companies, delisting from Nasdaq" },
  { id: "198", date: "2025-07-02", type: "buy", symbol: "RKT", shares: 12, pricePerShare: 0, fees: 0, transactionCost: 0, comments: "Redfin completes merger with Rocket Companies, delisting from Nasdaq" },
  { id: "199", date: "2025-07-03", type: "buy", symbol: "ASML", shares: 10, pricePerShare: 799, fees: 10, transactionCost: 8000 },
]

// Current approximate prices (you can update these - will be overwritten by live Yahoo Finance prices)
export const currentPrices: Record<string, number> = {
  BABA: 130.50,
  COIN: 285.00,
  DIDI: 4.20,
  GTLB: 58.50,
  LTC: 35.00,
  SNPS: 520.00,
  SOFI: 18.00,
  PRLB: 50.00,
  XYZ: 65.00,
  VZ: 42.00,
  DNA: 0.00,
  ASML: 820.00,
  RKT: 15.00,
  LVMHF: 530.00,
}

// Calculate current holdings from transactions
// livePrices parameter allows passing real-time prices from Yahoo Finance
export function calculateHoldings(livePrices?: Record<string, number>): Holding[] {
  const prices = livePrices && Object.keys(livePrices).length > 0 ? livePrices : currentPrices
  const holdingsMap = new Map<string, { shares: number; totalCost: number }>()

  for (const tx of transactions) {
    const current = holdingsMap.get(tx.symbol) || { shares: 0, totalCost: 0 }
    
    if (tx.type === "buy") {
      current.shares += tx.shares
      current.totalCost += tx.transactionCost
    } else {
      // For sells, reduce shares and proportionally reduce cost basis
      const avgCost = current.shares > 0 ? current.totalCost / current.shares : 0
      current.shares -= tx.shares
      current.totalCost = Math.max(0, current.shares * avgCost)
    }
    
    holdingsMap.set(tx.symbol, current)
  }

  const holdings: Holding[] = []
  
  holdingsMap.forEach((value, symbol) => {
    if (value.shares > 0.01) {
      const currentPrice = prices[symbol] || 0
      const currentValue = value.shares * currentPrice
      const gainLoss = currentValue - value.totalCost
      const gainLossPercent = value.totalCost > 0 ? (gainLoss / value.totalCost) * 100 : 0

      holdings.push({
        symbol,
        shares: value.shares,
        avgCost: value.totalCost / value.shares,
        totalCost: value.totalCost,
        currentPrice,
        currentValue,
        gainLoss,
        gainLossPercent,
      })
    }
  })

  return holdings.sort((a, b) => b.currentValue - a.currentValue)
}

// Helper: Calculate IRR using Newton-Raphson method
function calculateIRR(cashFlows: { date: Date; amount: number }[], guess = 0.1): number {
  if (cashFlows.length < 2) return 0
  
  const sortedFlows = [...cashFlows].sort((a, b) => a.date.getTime() - b.date.getTime())
  const firstDate = sortedFlows[0].date
  
  // Convert to years from first date
  const flows = sortedFlows.map(cf => ({
    years: (cf.date.getTime() - firstDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000),
    amount: cf.amount
  }))
  
  // Newton-Raphson iteration
  let rate = guess
  for (let i = 0; i < 100; i++) {
    let npv = 0
    let dnpv = 0
    
    for (const flow of flows) {
      const factor = Math.pow(1 + rate, -flow.years)
      npv += flow.amount * factor
      dnpv -= flow.years * flow.amount * factor / (1 + rate)
    }
    
    if (Math.abs(npv) < 0.0001) break
    if (dnpv === 0) break
    
    rate = rate - npv / dnpv
    
    // Prevent extreme values
    if (rate < -0.99) rate = -0.99
    if (rate > 10) rate = 10
  }
  
  return rate * 100 // Return as percentage
}

// Calculate total portfolio stats
// livePrices parameter allows passing real-time prices from Yahoo Finance
export function calculatePortfolioStats(livePrices?: Record<string, number>) {
  const holdings = calculateHoldings(livePrices)
  const prices = livePrices && Object.keys(livePrices).length > 0 ? livePrices : currentPrices
  
  const totalValue = holdings.reduce((sum, h) => sum + h.currentValue, 0)
  const totalCost = holdings.reduce((sum, h) => sum + h.totalCost, 0)
  const totalGainLoss = totalValue - totalCost
  const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0

  // Calculate realized gains from all sell transactions
  let realizedGains = 0
  const costBasis = new Map<string, number[]>()

  for (const tx of transactions) {
    if (tx.type === "buy" && tx.transactionCost > 0) {
      const costs = costBasis.get(tx.symbol) || []
      for (let i = 0; i < tx.shares; i++) {
        costs.push(tx.pricePerShare + tx.fees / tx.shares)
      }
      costBasis.set(tx.symbol, costs)
    } else if (tx.type === "sell" && tx.transactionCost > 0) {
      const costs = costBasis.get(tx.symbol) || []
      for (let i = 0; i < tx.shares && costs.length > 0; i++) {
        const cost = costs.shift() || 0
        realizedGains += tx.pricePerShare - cost
      }
      realizedGains -= tx.fees
      costBasis.set(tx.symbol, costs)
    }
  }

  // Best and worst performers
  const sortedByGain = [...holdings].sort((a, b) => b.gainLossPercent - a.gainLossPercent)
  const bestPerformer = sortedByGain[0] || null
  const worstPerformer = sortedByGain[sortedByGain.length - 1] || null

  // Largest holding by value
  const largestHolding = holdings[0] || null

  // Average gain/loss per position
  const avgGainLossPercent = holdings.length > 0 
    ? holdings.reduce((sum, h) => sum + h.gainLossPercent, 0) / holdings.length 
    : 0

  // Total return (unrealized + realized)
  const totalReturn = totalGainLoss + realizedGains
  const totalReturnPercent = totalCost > 0 ? (totalReturn / totalCost) * 100 : 0

  // Winners vs Losers count
  const winners = holdings.filter(h => h.gainLoss >= 0).length
  const losers = holdings.filter(h => h.gainLoss < 0).length

  // Total fees paid
  const totalFees = transactions.reduce((sum, tx) => sum + tx.fees, 0)

  // === ADVANCED KPIs ===
  
  // 1. CAGR (Compound Annual Growth Rate)
  const sortedTx = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  const firstTxDate = sortedTx.length > 0 ? new Date(sortedTx[0].date) : new Date()
  const today = new Date()
  const yearsInvested = Math.max(0.01, (today.getTime() - firstTxDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
  
  // Total invested over time (sum of all buys)
  const totalInvested = transactions
    .filter(tx => tx.type === "buy")
    .reduce((sum, tx) => sum + tx.transactionCost, 0)
  
  // Total withdrawn (sum of all sells)
  const totalWithdrawn = transactions
    .filter(tx => tx.type === "sell")
    .reduce((sum, tx) => sum + tx.transactionCost, 0)
  
  // Net invested = buys - sells
  const netInvested = totalInvested - totalWithdrawn
  
  // CAGR based on portfolio value vs net invested
  const cagr = netInvested > 0 
    ? (Math.pow(totalValue / netInvested, 1 / yearsInvested) - 1) * 100 
    : 0
  
  // 2. IRR (Internal Rate of Return) - Money-Weighted Return
  const cashFlows: { date: Date; amount: number }[] = transactions.map(tx => ({
    date: new Date(tx.date),
    amount: tx.type === "buy" ? -tx.transactionCost : tx.transactionCost
  }))
  // Add current portfolio value as final cash flow
  cashFlows.push({ date: today, amount: totalValue })
  
  const irr = calculateIRR(cashFlows)
  
  // 3. Win Rate
  const winRate = holdings.length > 0 ? (winners / holdings.length) * 100 : 0
  
  // 4. Profit Factor (gross profits / gross losses)
  const grossProfits = holdings.filter(h => h.gainLoss > 0).reduce((sum, h) => sum + h.gainLoss, 0)
  const grossLosses = Math.abs(holdings.filter(h => h.gainLoss < 0).reduce((sum, h) => sum + h.gainLoss, 0))
  const profitFactor = grossLosses > 0 ? grossProfits / grossLosses : grossProfits > 0 ? Infinity : 0
  
  // 5. Average Win vs Average Loss
  const avgWin = winners > 0 
    ? holdings.filter(h => h.gainLoss > 0).reduce((sum, h) => sum + h.gainLoss, 0) / winners 
    : 0
  const avgLoss = losers > 0 
    ? Math.abs(holdings.filter(h => h.gainLoss < 0).reduce((sum, h) => sum + h.gainLoss, 0) / losers)
    : 0
  
  // 6. Risk/Reward Ratio
  const riskRewardRatio = avgLoss > 0 ? avgWin / avgLoss : avgWin > 0 ? Infinity : 0
  
  // 7. Portfolio Concentration (Herfindahl-Hirschman Index)
  // HHI ranges from 0 to 10000, higher = more concentrated
  const hhi = totalValue > 0 
    ? holdings.reduce((sum, h) => {
        const weight = (h.currentValue / totalValue) * 100
        return sum + weight * weight
      }, 0)
    : 0
  
  // 8. Top 5 Concentration (% of portfolio in top 5 holdings)
  const top5Value = holdings.slice(0, 5).reduce((sum, h) => sum + h.currentValue, 0)
  const top5Concentration = totalValue > 0 ? (top5Value / totalValue) * 100 : 0
  
  // 9. Portfolio Beta estimate (simplified - based on tech-heavy holdings)
  // This is a rough estimate; real beta would require historical price data
  const techSymbols = ["AAPL", "MSFT", "NVDA", "GOOGL", "META", "AMZN", "COIN", "SNOW", "CRWD", "GTLB", "RKLB"]
  const techValue = holdings
    .filter(h => techSymbols.includes(h.symbol))
    .reduce((sum, h) => sum + h.currentValue, 0)
  const techWeight = totalValue > 0 ? techValue / totalValue : 0
  const estimatedBeta = 1 + (techWeight * 0.5) // Tech adds volatility
  
  // 10. Dividend Yield estimate (for dividend-paying stocks we had)
  const dividendStocks = ["VZ", "PFE", "JNJ", "XOM", "CVX", "MO", "LTC"]
  const dividendValue = holdings
    .filter(h => dividendStocks.includes(h.symbol))
    .reduce((sum, h) => sum + h.currentValue, 0)
  const dividendYieldEstimate = totalValue > 0 ? (dividendValue / totalValue) * 3.5 : 0 // Rough 3.5% yield for div stocks
  
  // 11. Total Capital Deployed (lifetime)
  const totalCapitalDeployed = totalInvested
  
  // 12. Capital Efficiency (current value / total capital ever deployed)
  const capitalEfficiency = totalCapitalDeployed > 0 ? (totalValue / totalCapitalDeployed) * 100 : 0
  
  // 13. Time in Market (days)
  const daysInMarket = Math.floor((today.getTime() - firstTxDate.getTime()) / (24 * 60 * 60 * 1000))
  
  // 14. Average Position Size
  const avgPositionSize = holdings.length > 0 ? totalValue / holdings.length : 0
  
  // 15. Volatility of returns (standard deviation of position returns)
  const returns = holdings.map(h => h.gainLossPercent)
  const meanReturn = returns.length > 0 ? returns.reduce((a, b) => a + b, 0) / returns.length : 0
  const variance = returns.length > 1 
    ? returns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) / (returns.length - 1)
    : 0
  const volatility = Math.sqrt(variance)
  
  // 16. Sharpe-like Ratio (using 5% as risk-free rate proxy)
  const riskFreeRate = 5
  const sharpeRatio = volatility > 0 ? (avgGainLossPercent - riskFreeRate) / volatility : 0

  return {
    totalValue,
    totalCost,
    totalGainLoss,
    totalGainLossPercent,
    realizedGains,
    holdingsCount: holdings.length,
    totalTransactions: transactions.length,
    bestPerformer,
    worstPerformer,
    largestHolding,
    avgGainLossPercent,
    totalReturn,
    totalReturnPercent,
    winners,
    losers,
    totalFees,
    // Advanced KPIs
    cagr,
    irr,
    winRate,
    profitFactor,
    avgWin,
    avgLoss,
    riskRewardRatio,
    hhi,
    top5Concentration,
    estimatedBeta,
    dividendYieldEstimate,
    totalCapitalDeployed,
    capitalEfficiency,
    daysInMarket,
    yearsInvested,
    avgPositionSize,
    volatility,
    sharpeRatio,
    netInvested,
  }
}

// Get transactions for a specific symbol
export function getTransactionsBySymbol(symbol: string): Transaction[] {
  return transactions.filter((tx) => tx.symbol === symbol)
}

// Get recent transactions
export function getRecentTransactions(limit = 10): Transaction[] {
  return [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, limit)
}
