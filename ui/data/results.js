window.POC_DATA = {
 "generated": "2026-08-19",
 "instrument": "gold",
 "target": "gold, RUB/gram, CBR daily fix",
 "window": {
  "from": "2026-01-13",
  "to": "2026-08-12",
  "days": 147,
  "clean_from": "2026-01-01"
 },
 "context": 512,
 "n_min_provisional": 20,
 "fred_join": "knowledge day (value date +1)",
 "errors": "paired per day, Newey-West lag = horizon-1",
 "horizons": [
  "1",
  "5"
 ],
 "buckets": [
  "large down",
  "small down",
  "flat",
  "small up",
  "large up"
 ],
 "rungs": [
  "climatology",
  "cond_climatology",
  "chronos_uni",
  "timesfm_uni",
  "chronos_cov",
  "timesfm_cov",
  "all_flat"
 ],
 "ladder": {
  "1": [
   {
    "rung": "cond_climatology",
    "mean": 0.1362,
    "diff": -7.2e-05,
    "lo": -0.001964,
    "hi": 0.00182,
    "verdict": "no detectable difference",
    "wins": 80,
    "n": 147
   },
   {
    "rung": "climatology",
    "mean": 0.136272,
    "baseline": true
   },
   {
    "rung": "timesfm_uni",
    "mean": 0.139471,
    "diff": 0.003199,
    "lo": -0.001635,
    "hi": 0.008033,
    "verdict": "no detectable difference",
    "wins": 45,
    "n": 147
   },
   {
    "rung": "chronos_uni",
    "mean": 0.14114,
    "diff": 0.004868,
    "lo": -0.00243,
    "hi": 0.012167,
    "verdict": "no detectable difference",
    "wins": 68,
    "n": 147
   },
   {
    "rung": "timesfm_cov",
    "mean": 0.146522,
    "diff": 0.01025,
    "lo": 0.003153,
    "hi": 0.017348,
    "verdict": "worse",
    "wins": 63,
    "n": 147
   },
   {
    "rung": "chronos_cov",
    "mean": 0.155234,
    "diff": 0.018962,
    "lo": 0.005795,
    "hi": 0.03213,
    "verdict": "worse",
    "wins": 54,
    "n": 147
   },
   {
    "rung": "all_flat",
    "mean": 0.178571,
    "diff": 0.042299,
    "lo": 0.03018,
    "hi": 0.054418,
    "verdict": "worse",
    "wins": 65,
    "n": 147
   }
  ],
  "5": [
   {
    "rung": "chronos_uni",
    "mean": 0.144816,
    "diff": -0.001882,
    "lo": -0.009296,
    "hi": 0.005532,
    "verdict": "no detectable difference",
    "wins": 96,
    "n": 147
   },
   {
    "rung": "climatology",
    "mean": 0.146699,
    "baseline": true
   },
   {
    "rung": "timesfm_uni",
    "mean": 0.148222,
    "diff": 0.001523,
    "lo": -0.005248,
    "hi": 0.008295,
    "verdict": "no detectable difference",
    "wins": 70,
    "n": 147
   },
   {
    "rung": "cond_climatology",
    "mean": 0.148465,
    "diff": 0.001766,
    "lo": -0.005439,
    "hi": 0.008972,
    "verdict": "no detectable difference",
    "wins": 71,
    "n": 147
   },
   {
    "rung": "chronos_cov",
    "mean": 0.161837,
    "diff": 0.015139,
    "lo": -0.001843,
    "hi": 0.03212,
    "verdict": "no detectable difference",
    "wins": 78,
    "n": 147
   },
   {
    "rung": "timesfm_cov",
    "mean": 0.164993,
    "diff": 0.018294,
    "lo": -0.002109,
    "hi": 0.038697,
    "verdict": "no detectable difference",
    "wins": 66,
    "n": 147
   },
   {
    "rung": "all_flat",
    "mean": 0.192176,
    "diff": 0.045477,
    "lo": 0.025641,
    "hi": 0.065314,
    "verdict": "worse",
    "wins": 63,
    "n": 147
   }
  ]
 },
 "daily": [
  {
   "date": "2026-01-13",
   "outcome": {
    "1": 4,
    "5": 2
   },
   "rps": {
    "1": {
     "climatology": 0.355443,
     "cond_climatology": 0.375196,
     "chronos_uni": 0.452063,
     "timesfm_uni": 0.402123,
     "chronos_cov": 0.282581,
     "timesfm_cov": 0.211522,
     "all_flat": 0.499999
    },
    "5": {
     "climatology": 0.050472,
     "cond_climatology": 0.042123,
     "chronos_uni": 0.045319,
     "timesfm_uni": 0.045783,
     "chronos_cov": 0.050837,
     "timesfm_cov": 0.160406,
     "all_flat": 0.0
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0561,
      0.1981,
      0.4505,
      0.2213,
      0.074
     ],
     "cond_climatology": [
      0.049,
      0.2028,
      0.472,
      0.2308,
      0.0455
     ],
     "chronos_uni": [
      0.211,
      0.2759,
      0.3049,
      0.1566,
      0.0516
     ],
     "chronos_cov": [
      0.1226,
      0.1762,
      0.3054,
      0.2089,
      0.187
     ],
     "timesfm_uni": [
      0.0742,
      0.2893,
      0.3844,
      0.2068,
      0.0453
     ],
     "timesfm_cov": [
      0.1429,
      0.1275,
      0.2144,
      0.2347,
      0.2806
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0547,
      0.2201,
      0.3894,
      0.2329,
      0.103
     ],
     "cond_climatology": [
      0.0909,
      0.2552,
      0.458,
      0.1503,
      0.0455
     ],
     "chronos_uni": [
      0.077,
      0.2775,
      0.4235,
      0.2026,
      0.0194
     ],
     "chronos_cov": [
      0.0967,
      0.2584,
      0.389,
      0.2068,
      0.0491
     ],
     "timesfm_uni": [
      0.0747,
      0.2615,
      0.4146,
      0.2004,
      0.0488
     ],
     "timesfm_cov": [
      0.0532,
      0.0908,
      0.1783,
      0.2792,
      0.3985
     ]
    }
   }
  },
  {
   "date": "2026-01-14",
   "outcome": {
    "1": 2,
    "5": 2
   },
   "rps": {
    "1": {
     "climatology": 0.040155,
     "cond_climatology": 0.040716,
     "chronos_uni": 0.090509,
     "timesfm_uni": 0.054393,
     "chronos_cov": 0.086885,
     "timesfm_cov": 0.090333,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.050497,
     "cond_climatology": 0.051145,
     "chronos_uni": 0.051192,
     "timesfm_uni": 0.049345,
     "chronos_cov": 0.057301,
     "timesfm_cov": 0.117571,
     "all_flat": 0.0
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0561,
      0.1981,
      0.4503,
      0.2212,
      0.0744
     ],
     "cond_climatology": [
      0.0369,
      0.1749,
      0.4532,
      0.2685,
      0.0665
     ],
     "chronos_uni": [
      0.2333,
      0.263,
      0.2685,
      0.1579,
      0.0773
     ],
     "chronos_cov": [
      0.0968,
      0.168,
      0.2792,
      0.2109,
      0.2452
     ],
     "timesfm_uni": [
      0.0874,
      0.2886,
      0.3698,
      0.1912,
      0.063
     ],
     "timesfm_cov": [
      0.1528,
      0.1466,
      0.2516,
      0.2328,
      0.2162
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0546,
      0.2201,
      0.3892,
      0.2332,
      0.1029
     ],
     "cond_climatology": [
      0.0517,
      0.1847,
      0.3892,
      0.298,
      0.0764
     ],
     "chronos_uni": [
      0.0958,
      0.2875,
      0.3972,
      0.1979,
      0.0216
     ],
     "chronos_cov": [
      0.1154,
      0.2547,
      0.3609,
      0.1878,
      0.0812
     ],
     "timesfm_uni": [
      0.0817,
      0.2601,
      0.3933,
      0.2041,
      0.0608
     ],
     "timesfm_cov": [
      0.0802,
      0.1129,
      0.2236,
      0.2897,
      0.2937
     ]
    }
   }
  },
  {
   "date": "2026-01-15",
   "outcome": {
    "1": 2,
    "5": 2
   },
   "rps": {
    "1": {
     "climatology": 0.040125,
     "cond_climatology": 0.040516,
     "chronos_uni": 0.076678,
     "timesfm_uni": 0.043557,
     "chronos_cov": 0.062813,
     "timesfm_cov": 0.070316,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.050522,
     "cond_climatology": 0.051354,
     "chronos_uni": 0.041912,
     "timesfm_uni": 0.044919,
     "chronos_cov": 0.043836,
     "timesfm_cov": 0.088205,
     "all_flat": 0.0
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.056,
      0.198,
      0.4505,
      0.2211,
      0.0743
     ],
     "cond_climatology": [
      0.0369,
      0.1744,
      0.4545,
      0.2678,
      0.0663
     ],
     "chronos_uni": [
      0.1781,
      0.2669,
      0.2891,
      0.1866,
      0.0793
     ],
     "chronos_cov": [
      0.0612,
      0.1782,
      0.3563,
      0.2408,
      0.1635
     ],
     "timesfm_uni": [
      0.0588,
      0.2614,
      0.4227,
      0.2111,
      0.0459
     ],
     "timesfm_cov": [
      0.1274,
      0.1749,
      0.3106,
      0.2328,
      0.1543
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0546,
      0.22,
      0.3891,
      0.2334,
      0.1029
     ],
     "cond_climatology": [
      0.0516,
      0.1843,
      0.3882,
      0.2998,
      0.0762
     ],
     "chronos_uni": [
      0.0601,
      0.2684,
      0.4353,
      0.2175,
      0.0187
     ],
     "chronos_cov": [
      0.0722,
      0.2522,
      0.4237,
      0.2141,
      0.0379
     ],
     "timesfm_uni": [
      0.0751,
      0.248,
      0.417,
      0.2143,
      0.0457
     ],
     "timesfm_cov": [
      0.0681,
      0.1404,
      0.281,
      0.3004,
      0.2101
     ]
    }
   }
  },
  {
   "date": "2026-01-16",
   "outcome": {
    "1": 2,
    "5": 3
   },
   "rps": {
    "1": {
     "climatology": 0.040095,
     "cond_climatology": 0.040318,
     "chronos_uni": 0.074259,
     "timesfm_uni": 0.041256,
     "chronos_cov": 0.064691,
     "timesfm_cov": 0.111141,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.13226,
     "cond_climatology": 0.112838,
     "chronos_uni": 0.157244,
     "timesfm_uni": 0.167174,
     "chronos_cov": 0.201109,
     "timesfm_cov": 0.084551,
     "all_flat": 0.249999
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.056,
      0.1979,
      0.4507,
      0.2211,
      0.0743
     ],
     "cond_climatology": [
      0.0368,
      0.174,
      0.4559,
      0.2672,
      0.0662
     ],
     "chronos_uni": [
      0.1657,
      0.2624,
      0.2904,
      0.1976,
      0.0839
     ],
     "chronos_cov": [
      0.1184,
      0.2513,
      0.3204,
      0.2003,
      0.1096
     ],
     "timesfm_uni": [
      0.0483,
      0.2542,
      0.4353,
      0.2128,
      0.0493
     ],
     "timesfm_cov": [
      0.1898,
      0.134,
      0.1994,
      0.2006,
      0.2763
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0546,
      0.2199,
      0.3889,
      0.2337,
      0.1028
     ],
     "cond_climatology": [
      0.0515,
      0.1838,
      0.3873,
      0.3015,
      0.076
     ],
     "chronos_uni": [
      0.0502,
      0.2454,
      0.4382,
      0.2421,
      0.0241
     ],
     "chronos_cov": [
      0.1119,
      0.2837,
      0.4011,
      0.1804,
      0.0229
     ],
     "timesfm_uni": [
      0.0704,
      0.2456,
      0.4334,
      0.2044,
      0.0461
     ],
     "timesfm_cov": [
      0.1008,
      0.1007,
      0.188,
      0.2421,
      0.3684
     ]
    }
   }
  },
  {
   "date": "2026-01-17",
   "outcome": {
    "1": 2,
    "5": 3
   },
   "rps": {
    "1": {
     "climatology": 0.040065,
     "cond_climatology": 0.040121,
     "chronos_uni": 0.066417,
     "timesfm_uni": 0.041904,
     "chronos_cov": 0.050557,
     "timesfm_cov": 0.083035,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.13218,
     "cond_climatology": 0.112381,
     "chronos_uni": 0.145491,
     "timesfm_uni": 0.169614,
     "chronos_cov": 0.179743,
     "timesfm_cov": 0.09423,
     "all_flat": 0.249999
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.056,
      0.1978,
      0.4509,
      0.221,
      0.0743
     ],
     "cond_climatology": [
      0.0367,
      0.1736,
      0.4572,
      0.2665,
      0.066
     ],
     "chronos_uni": [
      0.1299,
      0.2419,
      0.3096,
      0.2233,
      0.0952
     ],
     "chronos_cov": [
      0.062,
      0.199,
      0.3971,
      0.2262,
      0.1157
     ],
     "timesfm_uni": [
      0.0546,
      0.2532,
      0.4322,
      0.2118,
      0.0482
     ],
     "timesfm_cov": [
      0.1759,
      0.1675,
      0.2694,
      0.2045,
      0.1827
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0546,
      0.2198,
      0.3888,
      0.2336,
      0.1032
     ],
     "cond_climatology": [
      0.0513,
      0.1834,
      0.3863,
      0.3007,
      0.0782
     ],
     "chronos_uni": [
      0.0394,
      0.2257,
      0.4487,
      0.2609,
      0.0253
     ],
     "chronos_cov": [
      0.0862,
      0.261,
      0.421,
      0.2055,
      0.0262
     ],
     "timesfm_uni": [
      0.0782,
      0.2608,
      0.4061,
      0.2093,
      0.0455
     ],
     "timesfm_cov": [
      0.1056,
      0.1405,
      0.2519,
      0.2629,
      0.2391
     ]
    }
   }
  },
  {
   "date": "2026-01-20",
   "outcome": {
    "1": 3,
    "5": 3
   },
   "rps": {
    "1": {
     "climatology": 0.14246,
     "cond_climatology": 0.124072,
     "chronos_uni": 0.144666,
     "timesfm_uni": 0.151904,
     "chronos_cov": 0.132704,
     "timesfm_cov": 0.102446,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.132205,
     "cond_climatology": 0.112591,
     "chronos_uni": 0.136043,
     "timesfm_uni": 0.155906,
     "chronos_cov": 0.169976,
     "timesfm_cov": 0.07974,
     "all_flat": 0.249999
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.056,
      0.1978,
      0.4511,
      0.2209,
      0.0743
     ],
     "cond_climatology": [
      0.0366,
      0.1732,
      0.4585,
      0.2659,
      0.0659
     ],
     "chronos_uni": [
      0.1136,
      0.2255,
      0.3239,
      0.2315,
      0.1055
     ],
     "chronos_cov": [
      0.037,
      0.2006,
      0.4467,
      0.2467,
      0.0691
     ],
     "timesfm_uni": [
      0.0425,
      0.2227,
      0.4651,
      0.2243,
      0.0453
     ],
     "timesfm_cov": [
      0.072,
      0.1568,
      0.3456,
      0.2759,
      0.1497
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0546,
      0.2197,
      0.389,
      0.2336,
      0.1031
     ],
     "cond_climatology": [
      0.0512,
      0.1829,
      0.3878,
      0.3,
      0.078
     ],
     "chronos_uni": [
      0.0307,
      0.2121,
      0.4525,
      0.2757,
      0.0291
     ],
     "chronos_cov": [
      0.047,
      0.2468,
      0.475,
      0.2166,
      0.0146
     ],
     "timesfm_uni": [
      0.0639,
      0.2439,
      0.4147,
      0.2242,
      0.0533
     ],
     "timesfm_cov": [
      0.0391,
      0.143,
      0.3142,
      0.3089,
      0.1949
     ]
    }
   }
  },
  {
   "date": "2026-01-21",
   "outcome": {
    "1": 3,
    "5": 4
   },
   "rps": {
    "1": {
     "climatology": 0.142354,
     "cond_climatology": 0.123469,
     "chronos_uni": 0.168164,
     "timesfm_uni": 0.150874,
     "chronos_cov": 0.113051,
     "timesfm_cov": 0.11727,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.33068,
     "cond_climatology": 0.32387,
     "chronos_uni": 0.373794,
     "timesfm_uni": 0.34972,
     "chronos_cov": 0.372352,
     "timesfm_cov": 0.291902,
     "all_flat": 0.499999
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0559,
      0.1977,
      0.451,
      0.2212,
      0.0742
     ],
     "cond_climatology": [
      0.0365,
      0.1727,
      0.4574,
      0.2676,
      0.0657
     ],
     "chronos_uni": [
      0.1348,
      0.2604,
      0.3053,
      0.2123,
      0.0871
     ],
     "chronos_cov": [
      0.0236,
      0.1832,
      0.4248,
      0.2681,
      0.1003
     ],
     "timesfm_uni": [
      0.0343,
      0.2157,
      0.484,
      0.2324,
      0.0337
     ],
     "timesfm_cov": [
      0.0417,
      0.1784,
      0.4214,
      0.2726,
      0.0859
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0545,
      0.2196,
      0.3892,
      0.2335,
      0.1031
     ],
     "cond_climatology": [
      0.0511,
      0.1825,
      0.3893,
      0.2993,
      0.0779
     ],
     "chronos_uni": [
      0.0404,
      0.2229,
      0.4379,
      0.2644,
      0.0344
     ],
     "chronos_cov": [
      0.0246,
      0.2017,
      0.4773,
      0.2673,
      0.0291
     ],
     "timesfm_uni": [
      0.0444,
      0.2159,
      0.4159,
      0.2574,
      0.0663
     ],
     "timesfm_cov": [
      0.0276,
      0.1708,
      0.3853,
      0.3034,
      0.113
     ]
    }
   }
  },
  {
   "date": "2026-01-22",
   "outcome": {
    "1": 2,
    "5": 3
   },
   "rps": {
    "1": {
     "climatology": 0.040085,
     "cond_climatology": 0.040346,
     "chronos_uni": 0.075966,
     "timesfm_uni": 0.037228,
     "chronos_cov": 0.071618,
     "timesfm_cov": 0.038318,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.132255,
     "cond_climatology": 0.113008,
     "chronos_uni": 0.137319,
     "timesfm_uni": 0.124692,
     "chronos_cov": 0.104553,
     "timesfm_cov": 0.093426,
     "all_flat": 0.249999
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0559,
      0.1976,
      0.4508,
      0.2215,
      0.0742
     ],
     "cond_climatology": [
      0.0364,
      0.1723,
      0.4563,
      0.2694,
      0.0655
     ],
     "chronos_uni": [
      0.1597,
      0.247,
      0.276,
      0.2065,
      0.1109
     ],
     "chronos_cov": [
      0.0341,
      0.1666,
      0.3262,
      0.3275,
      0.1457
     ],
     "timesfm_uni": [
      0.0372,
      0.2348,
      0.4598,
      0.2279,
      0.0402
     ],
     "timesfm_cov": [
      0.0443,
      0.2037,
      0.4571,
      0.2416,
      0.0533
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0545,
      0.2196,
      0.3895,
      0.2334,
      0.1031
     ],
     "cond_climatology": [
      0.051,
      0.182,
      0.3908,
      0.2985,
      0.0777
     ],
     "chronos_uni": [
      0.0415,
      0.2213,
      0.4278,
      0.2715,
      0.0379
     ],
     "chronos_cov": [
      0.0218,
      0.1717,
      0.4195,
      0.3201,
      0.0668
     ],
     "timesfm_uni": [
      0.0424,
      0.1991,
      0.4168,
      0.2694,
      0.0722
     ],
     "timesfm_cov": [
      0.0132,
      0.1471,
      0.4228,
      0.3284,
      0.0885
     ]
    }
   }
  },
  {
   "date": "2026-01-23",
   "outcome": {
    "1": 1,
    "5": 4
   },
   "rps": {
    "1": {
     "climatology": 0.163331,
     "cond_climatology": 0.171171,
     "chronos_uni": 0.170325,
     "timesfm_uni": 0.188486,
     "chronos_cov": 0.24547,
     "timesfm_cov": 0.171816,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.330645,
     "cond_climatology": 0.337395,
     "chronos_uni": 0.334386,
     "timesfm_uni": 0.314889,
     "chronos_cov": 0.297635,
     "timesfm_cov": 0.310185,
     "all_flat": 0.499999
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0559,
      0.1975,
      0.451,
      0.2214,
      0.0742
     ],
     "cond_climatology": [
      0.0419,
      0.1885,
      0.4764,
      0.2251,
      0.0681
     ],
     "chronos_uni": [
      0.1131,
      0.189,
      0.3017,
      0.2395,
      0.1566
     ],
     "chronos_cov": [
      0.0327,
      0.1491,
      0.2938,
      0.3332,
      0.1911
     ],
     "timesfm_uni": [
      0.0201,
      0.1689,
      0.5058,
      0.2531,
      0.0521
     ],
     "timesfm_cov": [
      0.0322,
      0.1974,
      0.47,
      0.2494,
      0.051
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0545,
      0.2195,
      0.3893,
      0.2337,
      0.103
     ],
     "cond_climatology": [
      0.0785,
      0.1728,
      0.3979,
      0.2775,
      0.0733
     ],
     "chronos_uni": [
      0.0313,
      0.194,
      0.4084,
      0.3066,
      0.0597
     ],
     "chronos_cov": [
      0.0234,
      0.1661,
      0.3889,
      0.3268,
      0.0948
     ],
     "timesfm_uni": [
      0.0323,
      0.165,
      0.4127,
      0.3106,
      0.0794
     ],
     "timesfm_cov": [
      0.009,
      0.1403,
      0.4496,
      0.3283,
      0.0728
     ]
    }
   }
  },
  {
   "date": "2026-01-24",
   "outcome": {
    "1": 4,
    "5": 4
   },
   "rps": {
    "1": {
     "climatology": 0.355274,
     "cond_climatology": 0.358949,
     "chronos_uni": 0.292016,
     "timesfm_uni": 0.377478,
     "chronos_cov": 0.248095,
     "timesfm_cov": 0.293006,
     "all_flat": 0.499999
    },
    "5": {
     "climatology": 0.330566,
     "cond_climatology": 0.316818,
     "chronos_uni": 0.323021,
     "timesfm_uni": 0.349371,
     "chronos_cov": 0.315033,
     "timesfm_cov": 0.240999,
     "all_flat": 0.499999
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0559,
      0.1978,
      0.4508,
      0.2213,
      0.0741
     ],
     "cond_climatology": [
      0.0576,
      0.2302,
      0.4388,
      0.1799,
      0.0935
     ],
     "chronos_uni": [
      0.0961,
      0.1848,
      0.3144,
      0.2565,
      0.1482
     ],
     "chronos_cov": [
      0.0431,
      0.1618,
      0.3078,
      0.3153,
      0.172
     ],
     "timesfm_uni": [
      0.0281,
      0.2156,
      0.4776,
      0.2426,
      0.036
     ],
     "timesfm_cov": [
      0.0479,
      0.1663,
      0.3833,
      0.2783,
      0.1243
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0545,
      0.2194,
      0.3892,
      0.234,
      0.103
     ],
     "cond_climatology": [
      0.0144,
      0.2446,
      0.3453,
      0.3094,
      0.0863
     ],
     "chronos_uni": [
      0.0309,
      0.184,
      0.3985,
      0.3185,
      0.068
     ],
     "chronos_cov": [
      0.036,
      0.1845,
      0.3893,
      0.3058,
      0.0844
     ],
     "timesfm_uni": [
      0.0424,
      0.1938,
      0.4397,
      0.2638,
      0.0603
     ],
     "timesfm_cov": [
      0.0157,
      0.1218,
      0.3575,
      0.3414,
      0.1635
     ]
    }
   }
  },
  {
   "date": "2026-01-27",
   "outcome": {
    "1": 4,
    "5": 3
   },
   "rps": {
    "1": {
     "climatology": 0.355009,
     "cond_climatology": 0.338458,
     "chronos_uni": 0.336473,
     "timesfm_uni": 0.362881,
     "chronos_cov": 0.229292,
     "timesfm_cov": 0.287735,
     "all_flat": 0.499999
    },
    "5": {
     "climatology": 0.13196,
     "cond_climatology": 0.112462,
     "chronos_uni": 0.126874,
     "timesfm_uni": 0.102511,
     "chronos_cov": 0.076267,
     "timesfm_cov": 0.068565,
     "all_flat": 0.249999
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0559,
      0.1978,
      0.4507,
      0.2212,
      0.0745
     ],
     "cond_climatology": [
      0.0363,
      0.1719,
      0.4552,
      0.2688,
      0.0678
     ],
     "chronos_uni": [
      0.1633,
      0.2286,
      0.2602,
      0.2086,
      0.1394
     ],
     "chronos_cov": [
      0.0674,
      0.158,
      0.2671,
      0.2943,
      0.2131
     ],
     "timesfm_uni": [
      0.0201,
      0.1991,
      0.4797,
      0.2573,
      0.0437
     ],
     "timesfm_cov": [
      0.0274,
      0.1494,
      0.4031,
      0.3046,
      0.1154
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0545,
      0.2193,
      0.389,
      0.2342,
      0.1029
     ],
     "cond_climatology": [
      0.0508,
      0.1816,
      0.3898,
      0.3002,
      0.0775
     ],
     "chronos_uni": [
      0.0728,
      0.2081,
      0.3629,
      0.2624,
      0.0938
     ],
     "chronos_cov": [
      0.03,
      0.1493,
      0.3026,
      0.3187,
      0.1994
     ],
     "timesfm_uni": [
      0.0461,
      0.1789,
      0.3631,
      0.3048,
      0.1071
     ],
     "timesfm_cov": [
      0.011,
      0.1097,
      0.361,
      0.3524,
      0.1659
     ]
    }
   }
  },
  {
   "date": "2026-01-28",
   "outcome": {
    "1": 1,
    "5": 0
   },
   "rps": {
    "1": {
     "climatology": 0.163382,
     "cond_climatology": 0.187067,
     "chronos_uni": 0.109416,
     "timesfm_uni": 0.132394,
     "chronos_cov": 0.430117,
     "timesfm_cov": 0.209396,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.386541,
     "cond_climatology": 0.410323,
     "chronos_uni": 0.329562,
     "timesfm_uni": 0.376944,
     "chronos_cov": 0.680632,
     "timesfm_cov": 0.491181,
     "all_flat": 0.499999
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0558,
      0.1977,
      0.4505,
      0.2211,
      0.0748
     ],
     "cond_climatology": [
      0.0362,
      0.1715,
      0.4541,
      0.2681,
      0.07
     ],
     "chronos_uni": [
      0.2447,
      0.2287,
      0.2362,
      0.1634,
      0.127
     ],
     "chronos_cov": [
      0.0244,
      0.0691,
      0.1354,
      0.2203,
      0.5509
     ],
     "timesfm_uni": [
      0.1136,
      0.2435,
      0.3439,
      0.1809,
      0.1181
     ],
     "timesfm_cov": [
      0.0193,
      0.1465,
      0.4636,
      0.3069,
      0.0636
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0544,
      0.2192,
      0.3889,
      0.2342,
      0.1033
     ],
     "cond_climatology": [
      0.0507,
      0.1812,
      0.3889,
      0.2995,
      0.0797
     ],
     "chronos_uni": [
      0.1317,
      0.2095,
      0.3188,
      0.2195,
      0.1205
     ],
     "chronos_cov": [
      0.0171,
      0.0592,
      0.1495,
      0.2229,
      0.5513
     ],
     "timesfm_uni": [
      0.1059,
      0.1854,
      0.2881,
      0.2493,
      0.1712
     ],
     "timesfm_cov": [
      0.0129,
      0.1263,
      0.3801,
      0.3448,
      0.1359
     ]
    }
   }
  },
  {
   "date": "2026-01-29",
   "outcome": {
    "1": 4,
    "5": 1
   },
   "rps": {
    "1": {
     "climatology": 0.354831,
     "cond_climatology": 0.337371,
     "chronos_uni": 0.363447,
     "timesfm_uni": 0.424303,
     "chronos_cov": 0.154993,
     "timesfm_cov": 0.322828,
     "all_flat": 0.499999
    },
    "5": {
     "climatology": 0.163836,
     "cond_climatology": 0.186174,
     "chronos_uni": 0.159588,
     "timesfm_uni": 0.1319,
     "chronos_cov": 0.272291,
     "timesfm_cov": 0.245843,
     "all_flat": 0.249999
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0558,
      0.198,
      0.4503,
      0.2211,
      0.0748
     ],
     "cond_climatology": [
      0.0361,
      0.1735,
      0.453,
      0.2675,
      0.0699
     ],
     "chronos_uni": [
      0.189,
      0.2387,
      0.2563,
      0.192,
      0.124
     ],
     "chronos_cov": [
      0.0547,
      0.1238,
      0.2226,
      0.2504,
      0.3486
     ],
     "timesfm_uni": [
      0.1096,
      0.3012,
      0.347,
      0.2128,
      0.0294
     ],
     "timesfm_cov": [
      0.0155,
      0.134,
      0.4746,
      0.3136,
      0.0623
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0544,
      0.2192,
      0.3887,
      0.2344,
      0.1032
     ],
     "cond_climatology": [
      0.0506,
      0.1807,
      0.388,
      0.3012,
      0.0795
     ],
     "chronos_uni": [
      0.1016,
      0.2027,
      0.3351,
      0.2423,
      0.1183
     ],
     "chronos_cov": [
      0.0569,
      0.1373,
      0.2179,
      0.2863,
      0.3016
     ],
     "timesfm_uni": [
      0.1274,
      0.2348,
      0.3303,
      0.2072,
      0.1003
     ],
     "timesfm_cov": [
      0.0108,
      0.1238,
      0.397,
      0.3461,
      0.1223
     ]
    }
   }
  },
  {
   "date": "2026-01-30",
   "outcome": {
    "1": 3,
    "5": 0
   },
   "rps": {
    "1": {
     "climatology": 0.142142,
     "cond_climatology": 0.121809,
     "chronos_uni": 0.212704,
     "timesfm_uni": 0.165279,
     "chronos_cov": 0.084949,
     "timesfm_cov": 0.190385,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.386733,
     "cond_climatology": 0.411517,
     "chronos_uni": 0.296343,
     "timesfm_uni": 0.347555,
     "chronos_cov": 0.514791,
     "timesfm_cov": 0.359059,
     "all_flat": 0.499999
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0558,
      0.1979,
      0.4501,
      0.221,
      0.0751
     ],
     "cond_climatology": [
      0.0361,
      0.1731,
      0.4519,
      0.2668,
      0.0721
     ],
     "chronos_uni": [
      0.2846,
      0.213,
      0.2102,
      0.1457,
      0.1466
     ],
     "chronos_cov": [
      0.0343,
      0.0918,
      0.1424,
      0.2309,
      0.5006
     ],
     "timesfm_uni": [
      0.1315,
      0.2374,
      0.332,
      0.1707,
      0.1284
     ],
     "timesfm_cov": [
      0.0972,
      0.2652,
      0.4249,
      0.1851,
      0.0275
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0544,
      0.2191,
      0.3886,
      0.2344,
      0.1036
     ],
     "cond_climatology": [
      0.0505,
      0.1803,
      0.387,
      0.3005,
      0.0817
     ],
     "chronos_uni": [
      0.17,
      0.214,
      0.2967,
      0.1956,
      0.1236
     ],
     "chronos_cov": [
      0.0577,
      0.1319,
      0.1955,
      0.2453,
      0.3696
     ],
     "timesfm_uni": [
      0.1423,
      0.1851,
      0.258,
      0.2409,
      0.1737
     ],
     "timesfm_cov": [
      0.0558,
      0.2619,
      0.404,
      0.2392,
      0.0392
     ]
    }
   }
  },
  {
   "date": "2026-01-31",
   "outcome": {
    "1": 0,
    "5": 0
   },
   "rps": {
    "1": {
     "climatology": 0.385528,
     "cond_climatology": 0.401326,
     "chronos_uni": 0.273732,
     "timesfm_uni": 0.312778,
     "chronos_cov": 0.852425,
     "timesfm_cov": 0.408165,
     "all_flat": 0.499999
    },
    "5": {
     "climatology": 0.386839,
     "cond_climatology": 0.385973,
     "chronos_uni": 0.332808,
     "timesfm_uni": 0.371755,
     "chronos_cov": 0.625843,
     "timesfm_cov": 0.436359,
     "all_flat": 0.499999
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0558,
      0.1978,
      0.45,
      0.2213,
      0.0751
     ],
     "cond_climatology": [
      0.0417,
      0.1875,
      0.474,
      0.2292,
      0.0677
     ],
     "chronos_uni": [
      0.233,
      0.2022,
      0.1871,
      0.1657,
      0.2121
     ],
     "chronos_cov": [
      0.0052,
      0.0152,
      0.06,
      0.1359,
      0.7838
     ],
     "timesfm_uni": [
      0.1346,
      0.228,
      0.3465,
      0.184,
      0.1068
     ],
     "timesfm_cov": [
      0.0355,
      0.1865,
      0.4694,
      0.2682,
      0.0404
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0544,
      0.219,
      0.3885,
      0.2343,
      0.1039
     ],
     "cond_climatology": [
      0.0781,
      0.1719,
      0.3958,
      0.276,
      0.0781
     ],
     "chronos_uni": [
      0.1322,
      0.2081,
      0.3072,
      0.2165,
      0.1361
     ],
     "chronos_cov": [
      0.0241,
      0.0844,
      0.166,
      0.246,
      0.4794
     ],
     "timesfm_uni": [
      0.112,
      0.1826,
      0.286,
      0.2618,
      0.1576
     ],
     "timesfm_cov": [
      0.0138,
      0.1743,
      0.4761,
      0.302,
      0.0337
     ]
    }
   }
  },
  {
   "date": "2026-02-03",
   "outcome": {
    "1": 0,
    "5": 2
   },
   "rps": {
    "1": {
     "climatology": 0.385241,
     "cond_climatology": 0.397178,
     "chronos_uni": 0.287849,
     "timesfm_uni": 0.304814,
     "chronos_cov": 0.220632,
     "timesfm_cov": 0.407254,
     "all_flat": 0.499999
    },
    "5": {
     "climatology": 0.050737,
     "cond_climatology": 0.050438,
     "chronos_uni": 0.06211,
     "timesfm_uni": 0.08312,
     "chronos_cov": 0.120371,
     "timesfm_cov": 0.041056,
     "all_flat": 0.0
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0561,
      0.1978,
      0.4498,
      0.2212,
      0.0751
     ],
     "cond_climatology": [
      0.0466,
      0.1865,
      0.4715,
      0.228,
      0.0674
     ],
     "chronos_uni": [
      0.1835,
      0.2251,
      0.252,
      0.1985,
      0.1408
     ],
     "chronos_cov": [
      0.272,
      0.2504,
      0.1772,
      0.1156,
      0.1848
     ],
     "timesfm_uni": [
      0.1475,
      0.2347,
      0.3112,
      0.1764,
      0.1302
     ],
     "timesfm_cov": [
      0.0268,
      0.1885,
      0.5281,
      0.2368,
      0.0198
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0544,
      0.2189,
      0.3883,
      0.2345,
      0.1039
     ],
     "cond_climatology": [
      0.0777,
      0.171,
      0.3938,
      0.2798,
      0.0777
     ],
     "chronos_uni": [
      0.106,
      0.206,
      0.3329,
      0.2379,
      0.1173
     ],
     "chronos_cov": [
      0.3047,
      0.2367,
      0.188,
      0.1211,
      0.1494
     ],
     "timesfm_uni": [
      0.198,
      0.2321,
      0.2657,
      0.1786,
      0.1256
     ],
     "timesfm_cov": [
      0.0156,
      0.1694,
      0.4571,
      0.318,
      0.04
     ]
    }
   }
  },
  {
   "date": "2026-02-04",
   "outcome": {
    "1": 4,
    "5": 4
   },
   "rps": {
    "1": {
     "climatology": 0.354669,
     "cond_climatology": 0.357012,
     "chronos_uni": 0.232363,
     "timesfm_uni": 0.334087,
     "chronos_cov": 0.526169,
     "timesfm_cov": 0.375089,
     "all_flat": 0.499999
    },
    "5": {
     "climatology": 0.329696,
     "cond_climatology": 0.334274,
     "chronos_uni": 0.225191,
     "timesfm_uni": 0.363034,
     "chronos_cov": 0.507907,
     "timesfm_cov": 0.339126,
     "all_flat": 0.499999
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0565,
      0.1977,
      0.4496,
      0.2211,
      0.0751
     ],
     "cond_climatology": [
      0.0515,
      0.1856,
      0.4691,
      0.2268,
      0.067
     ],
     "chronos_uni": [
      0.0499,
      0.1608,
      0.2718,
      0.3235,
      0.1939
     ],
     "chronos_cov": [
      0.4471,
      0.2152,
      0.1485,
      0.0885,
      0.1007
     ],
     "timesfm_uni": [
      0.1419,
      0.2155,
      0.3146,
      0.1864,
      0.1416
     ],
     "timesfm_cov": [
      0.0187,
      0.1632,
      0.5311,
      0.266,
      0.021
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0547,
      0.2188,
      0.3882,
      0.2345,
      0.1038
     ],
     "cond_climatology": [
      0.0825,
      0.1701,
      0.3918,
      0.2784,
      0.0773
     ],
     "chronos_uni": [
      0.044,
      0.1555,
      0.2876,
      0.3014,
      0.2115
     ],
     "chronos_cov": [
      0.4154,
      0.2184,
      0.1596,
      0.1165,
      0.0901
     ],
     "timesfm_uni": [
      0.1924,
      0.2342,
      0.2627,
      0.1814,
      0.1293
     ],
     "timesfm_cov": [
      0.0116,
      0.1555,
      0.4659,
      0.3303,
      0.0367
     ]
    }
   }
  },
  {
   "date": "2026-02-05",
   "outcome": {
    "1": 2,
    "5": 3
   },
   "rps": {
    "1": {
     "climatology": 0.040327,
     "cond_climatology": 0.037975,
     "chronos_uni": 0.066467,
     "timesfm_uni": 0.062822,
     "chronos_cov": 0.068915,
     "timesfm_cov": 0.028753,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.131689,
     "cond_climatology": 0.123978,
     "chronos_uni": 0.128043,
     "timesfm_uni": 0.154534,
     "chronos_cov": 0.178009,
     "timesfm_cov": 0.141524,
     "all_flat": 0.249999
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0565,
      0.1976,
      0.4495,
      0.221,
      0.0754
     ],
     "cond_climatology": [
      0.0513,
      0.1846,
      0.4667,
      0.2256,
      0.0718
     ],
     "chronos_uni": [
      0.1244,
      0.2148,
      0.3126,
      0.2294,
      0.1188
     ],
     "chronos_cov": [
      0.0994,
      0.2088,
      0.3212,
      0.1878,
      0.1828
     ],
     "timesfm_uni": [
      0.101,
      0.2131,
      0.3377,
      0.2026,
      0.1455
     ],
     "timesfm_cov": [
      0.0396,
      0.2216,
      0.5266,
      0.1992,
      0.013
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0547,
      0.2191,
      0.388,
      0.2344,
      0.1038
     ],
     "cond_climatology": [
      0.0821,
      0.1744,
      0.3897,
      0.2769,
      0.0769
     ],
     "chronos_uni": [
      0.0732,
      0.2105,
      0.3624,
      0.2604,
      0.0934
     ],
     "chronos_cov": [
      0.1791,
      0.2359,
      0.284,
      0.1629,
      0.138
     ],
     "timesfm_uni": [
      0.1537,
      0.2284,
      0.272,
      0.2019,
      0.1441
     ],
     "timesfm_cov": [
      0.0276,
      0.2118,
      0.4732,
      0.2689,
      0.0185
     ]
    }
   }
  },
  {
   "date": "2026-02-06",
   "outcome": {
    "1": 1,
    "5": 3
   },
   "rps": {
    "1": {
     "climatology": 0.163301,
     "cond_climatology": 0.186766,
     "chronos_uni": 0.099564,
     "timesfm_uni": 0.150332,
     "chronos_cov": 0.19864,
     "timesfm_cov": 0.140566,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.131775,
     "cond_climatology": 0.111584,
     "chronos_uni": 0.160734,
     "timesfm_uni": 0.153975,
     "chronos_cov": 0.155963,
     "timesfm_cov": 0.164188,
     "all_flat": 0.249999
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0564,
      0.1975,
      0.4497,
      0.2209,
      0.0754
     ],
     "cond_climatology": [
      0.036,
      0.1727,
      0.4532,
      0.2662,
      0.0719
     ],
     "chronos_uni": [
      0.1645,
      0.2779,
      0.319,
      0.181,
      0.0576
     ],
     "chronos_cov": [
      0.0472,
      0.1918,
      0.347,
      0.2094,
      0.2046
     ],
     "timesfm_uni": [
      0.0813,
      0.2238,
      0.3819,
      0.1957,
      0.1174
     ],
     "timesfm_cov": [
      0.0383,
      0.2335,
      0.5536,
      0.1673,
      0.0073
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.055,
      0.219,
      0.3879,
      0.2343,
      0.1038
     ],
     "cond_climatology": [
      0.0528,
      0.1799,
      0.3861,
      0.2998,
      0.0815
     ],
     "chronos_uni": [
      0.0856,
      0.2462,
      0.3915,
      0.2296,
      0.047
     ],
     "chronos_cov": [
      0.1191,
      0.2379,
      0.3233,
      0.1806,
      0.139
     ],
     "timesfm_uni": [
      0.1343,
      0.236,
      0.296,
      0.2046,
      0.129
     ],
     "timesfm_cov": [
      0.0256,
      0.2286,
      0.5149,
      0.2216,
      0.0094
     ]
    }
   }
  },
  {
   "date": "2026-02-07",
   "outcome": {
    "1": 3,
    "5": 3
   },
   "rps": {
    "1": {
     "climatology": 0.142207,
     "cond_climatology": 0.140235,
     "chronos_uni": 0.124874,
     "timesfm_uni": 0.164994,
     "chronos_cov": 0.200272,
     "timesfm_cov": 0.212071,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.131861,
     "cond_climatology": 0.125234,
     "chronos_uni": 0.112061,
     "timesfm_uni": 0.159804,
     "chronos_cov": 0.242076,
     "timesfm_cov": 0.201638,
     "all_flat": 0.249999
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0564,
      0.1978,
      0.4495,
      0.2209,
      0.0754
     ],
     "cond_climatology": [
      0.051,
      0.1888,
      0.4643,
      0.2245,
      0.0714
     ],
     "chronos_uni": [
      0.0798,
      0.2014,
      0.3532,
      0.2578,
      0.1078
     ],
     "chronos_cov": [
      0.1498,
      0.3019,
      0.3016,
      0.1618,
      0.0849
     ],
     "timesfm_uni": [
      0.0792,
      0.2557,
      0.3981,
      0.2017,
      0.0653
     ],
     "timesfm_cov": [
      0.0582,
      0.2746,
      0.524,
      0.1361,
      0.0071
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0554,
      0.219,
      0.3877,
      0.2342,
      0.1037
     ],
     "cond_climatology": [
      0.0867,
      0.1735,
      0.3878,
      0.2755,
      0.0765
     ],
     "chronos_uni": [
      0.0381,
      0.1935,
      0.3906,
      0.2995,
      0.0783
     ],
     "chronos_cov": [
      0.1917,
      0.3241,
      0.2994,
      0.1518,
      0.0331
     ],
     "timesfm_uni": [
      0.1017,
      0.2608,
      0.3351,
      0.1983,
      0.1041
     ],
     "timesfm_cov": [
      0.0384,
      0.2815,
      0.5184,
      0.1567,
      0.005
     ]
    }
   }
  },
  {
   "date": "2026-02-10",
   "outcome": {
    "1": 3,
    "5": 2
   },
   "rps": {
    "1": {
     "climatology": 0.142102,
     "cond_climatology": 0.138814,
     "chronos_uni": 0.130786,
     "timesfm_uni": 0.15005,
     "chronos_cov": 0.135213,
     "timesfm_cov": 0.230167,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.050783,
     "cond_climatology": 0.050736,
     "chronos_uni": 0.048802,
     "timesfm_uni": 0.062458,
     "chronos_cov": 0.066283,
     "timesfm_cov": 0.07987,
     "all_flat": 0.0
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0564,
      0.1978,
      0.4494,
      0.2212,
      0.0753
     ],
     "cond_climatology": [
      0.0508,
      0.1878,
      0.4619,
      0.2284,
      0.0711
     ],
     "chronos_uni": [
      0.0932,
      0.2073,
      0.3403,
      0.2429,
      0.1162
     ],
     "chronos_cov": [
      0.1113,
      0.2055,
      0.3146,
      0.1966,
      0.1721
     ],
     "timesfm_uni": [
      0.0638,
      0.2296,
      0.415,
      0.201,
      0.0906
     ],
     "timesfm_cov": [
      0.1143,
      0.3065,
      0.4339,
      0.1319,
      0.0135
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0554,
      0.2189,
      0.388,
      0.2341,
      0.1037
     ],
     "cond_climatology": [
      0.0863,
      0.1726,
      0.3909,
      0.2741,
      0.0761
     ],
     "chronos_uni": [
      0.0392,
      0.2039,
      0.3969,
      0.2895,
      0.0705
     ],
     "chronos_cov": [
      0.1476,
      0.2775,
      0.3324,
      0.1806,
      0.0619
     ],
     "timesfm_uni": [
      0.0932,
      0.2258,
      0.3301,
      0.2232,
      0.1276
     ],
     "timesfm_cov": [
      0.1512,
      0.3878,
      0.383,
      0.0738,
      0.0041
     ]
    }
   }
  },
  {
   "date": "2026-02-11",
   "outcome": {
    "1": 2,
    "5": 1
   },
   "rps": {
    "1": {
     "climatology": 0.040364,
     "cond_climatology": 0.038931,
     "chronos_uni": 0.069082,
     "timesfm_uni": 0.056085,
     "chronos_cov": 0.077013,
     "timesfm_cov": 0.067387,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.163754,
     "cond_climatology": 0.172521,
     "chronos_uni": 0.150117,
     "timesfm_uni": 0.131009,
     "chronos_cov": 0.100166,
     "timesfm_cov": 0.045072,
     "all_flat": 0.249999
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0564,
      0.1977,
      0.4492,
      0.2214,
      0.0753
     ],
     "cond_climatology": [
      0.0505,
      0.1869,
      0.4596,
      0.2323,
      0.0707
     ],
     "chronos_uni": [
      0.1428,
      0.2726,
      0.307,
      0.1982,
      0.0794
     ],
     "chronos_cov": [
      0.1586,
      0.2615,
      0.2768,
      0.1825,
      0.1206
     ],
     "timesfm_uni": [
      0.0966,
      0.2901,
      0.3628,
      0.1982,
      0.0523
     ],
     "timesfm_cov": [
      0.1534,
      0.3188,
      0.3775,
      0.1294,
      0.0209
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0553,
      0.2188,
      0.3878,
      0.234,
      0.104
     ],
     "cond_climatology": [
      0.0859,
      0.1717,
      0.3889,
      0.2727,
      0.0808
     ],
     "chronos_uni": [
      0.0456,
      0.2384,
      0.4259,
      0.2518,
      0.0384
     ],
     "chronos_cov": [
      0.1484,
      0.281,
      0.3441,
      0.1849,
      0.0416
     ],
     "timesfm_uni": [
      0.1087,
      0.2515,
      0.3373,
      0.1965,
      0.1061
     ],
     "timesfm_cov": [
      0.2508,
      0.4109,
      0.2841,
      0.0499,
      0.0043
     ]
    }
   }
  },
  {
   "date": "2026-02-12",
   "outcome": {
    "1": 2,
    "5": 1
   },
   "rps": {
    "1": {
     "climatology": 0.040334,
     "cond_climatology": 0.038541,
     "chronos_uni": 0.064815,
     "timesfm_uni": 0.039953,
     "chronos_cov": 0.072148,
     "timesfm_cov": 0.062377,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.16383,
     "cond_climatology": 0.173544,
     "chronos_uni": 0.152998,
     "timesfm_uni": 0.14802,
     "chronos_cov": 0.112821,
     "timesfm_cov": 0.04578,
     "all_flat": 0.249999
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0564,
      0.1976,
      0.4494,
      0.2214,
      0.0753
     ],
     "cond_climatology": [
      0.0503,
      0.1859,
      0.4623,
      0.2312,
      0.0704
     ],
     "chronos_uni": [
      0.1324,
      0.272,
      0.3245,
      0.2027,
      0.0683
     ],
     "chronos_cov": [
      0.1466,
      0.2786,
      0.2974,
      0.1809,
      0.0964
     ],
     "timesfm_uni": [
      0.0436,
      0.2546,
      0.4431,
      0.2131,
      0.0456
     ],
     "timesfm_cov": [
      0.1201,
      0.3526,
      0.4197,
      0.0988,
      0.0088
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0553,
      0.2187,
      0.3877,
      0.2343,
      0.104
     ],
     "cond_climatology": [
      0.0854,
      0.1709,
      0.3869,
      0.2764,
      0.0804
     ],
     "chronos_uni": [
      0.0535,
      0.2303,
      0.41,
      0.2556,
      0.0505
     ],
     "chronos_cov": [
      0.1138,
      0.2714,
      0.3724,
      0.2033,
      0.0391
     ],
     "timesfm_uni": [
      0.0886,
      0.2259,
      0.3647,
      0.2146,
      0.1063
     ],
     "timesfm_cov": [
      0.1872,
      0.4311,
      0.333,
      0.046,
      0.0026
     ]
    }
   }
  },
  {
   "date": "2026-02-13",
   "outcome": {
    "1": 2,
    "5": 1
   },
   "rps": {
    "1": {
     "climatology": 0.040304,
     "cond_climatology": 0.038156,
     "chronos_uni": 0.058444,
     "timesfm_uni": 0.040173,
     "chronos_cov": 0.065887,
     "timesfm_cov": 0.039716,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.163906,
     "cond_climatology": 0.174563,
     "chronos_uni": 0.175189,
     "timesfm_uni": 0.147781,
     "chronos_cov": 0.139054,
     "timesfm_cov": 0.054634,
     "all_flat": 0.249999
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0563,
      0.1976,
      0.4496,
      0.2213,
      0.0752
     ],
     "cond_climatology": [
      0.05,
      0.185,
      0.465,
      0.23,
      0.07
     ],
     "chronos_uni": [
      0.0889,
      0.2118,
      0.3478,
      0.2425,
      0.109
     ],
     "chronos_cov": [
      0.0709,
      0.179,
      0.3376,
      0.2516,
      0.161
     ],
     "timesfm_uni": [
      0.0453,
      0.2346,
      0.4439,
      0.2129,
      0.0633
     ],
     "timesfm_cov": [
      0.0787,
      0.2956,
      0.5137,
      0.1062,
      0.0058
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0553,
      0.2186,
      0.3875,
      0.2346,
      0.1039
     ],
     "cond_climatology": [
      0.085,
      0.17,
      0.385,
      0.28,
      0.08
     ],
     "chronos_uni": [
      0.0348,
      0.2054,
      0.4135,
      0.2978,
      0.0485
     ],
     "chronos_cov": [
      0.0887,
      0.2334,
      0.3875,
      0.2239,
      0.0665
     ],
     "timesfm_uni": [
      0.0982,
      0.2286,
      0.3355,
      0.2182,
      0.1195
     ],
     "timesfm_cov": [
      0.1672,
      0.4,
      0.376,
      0.0542,
      0.0026
     ]
    }
   }
  },
  {
   "date": "2026-02-14",
   "outcome": {
    "1": 1,
    "5": 2
   },
   "rps": {
    "1": {
     "climatology": 0.163376,
     "cond_climatology": 0.170862,
     "chronos_uni": 0.180538,
     "timesfm_uni": 0.170921,
     "chronos_cov": 0.200159,
     "timesfm_cov": 0.097993,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.050902,
     "cond_climatology": 0.052443,
     "chronos_uni": 0.042922,
     "timesfm_uni": 0.052073,
     "chronos_cov": 0.041081,
     "timesfm_cov": 0.08249,
     "all_flat": 0.0
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0563,
      0.1975,
      0.4498,
      0.2212,
      0.0752
     ],
     "cond_climatology": [
      0.0498,
      0.1841,
      0.4677,
      0.2289,
      0.0697
     ],
     "chronos_uni": [
      0.0557,
      0.1976,
      0.3609,
      0.2729,
      0.1129
     ],
     "chronos_cov": [
      0.0406,
      0.1737,
      0.3758,
      0.2936,
      0.1164
     ],
     "timesfm_uni": [
      0.0225,
      0.1946,
      0.52,
      0.2294,
      0.0335
     ],
     "timesfm_cov": [
      0.0826,
      0.3093,
      0.4845,
      0.115,
      0.0086
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0553,
      0.2186,
      0.3874,
      0.2349,
      0.1039
     ],
     "cond_climatology": [
      0.0846,
      0.1692,
      0.3831,
      0.2836,
      0.0796
     ],
     "chronos_uni": [
      0.0245,
      0.1885,
      0.4346,
      0.3138,
      0.0387
     ],
     "chronos_cov": [
      0.0524,
      0.2234,
      0.4348,
      0.2471,
      0.0423
     ],
     "timesfm_uni": [
      0.0792,
      0.2223,
      0.3788,
      0.2253,
      0.0944
     ],
     "timesfm_cov": [
      0.1438,
      0.4094,
      0.3895,
      0.0548,
      0.0025
     ]
    }
   }
  },
  {
   "date": "2026-02-17",
   "outcome": {
    "1": 2,
    "5": 3
   },
   "rps": {
    "1": {
     "climatology": 0.040292,
     "cond_climatology": 0.043299,
     "chronos_uni": 0.049324,
     "timesfm_uni": 0.041561,
     "chronos_cov": 0.064527,
     "timesfm_cov": 0.032305,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.131539,
     "cond_climatology": 0.100119,
     "chronos_uni": 0.1354,
     "timesfm_uni": 0.169279,
     "chronos_cov": 0.202312,
     "timesfm_cov": 0.275216,
     "all_flat": 0.249999
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0563,
      0.1978,
      0.4496,
      0.2211,
      0.0752
     ],
     "cond_climatology": [
      0.0623,
      0.1685,
      0.4432,
      0.2271,
      0.0989
     ],
     "chronos_uni": [
      0.0801,
      0.2229,
      0.389,
      0.2434,
      0.0646
     ],
     "chronos_cov": [
      0.1375,
      0.308,
      0.3561,
      0.1618,
      0.0367
     ],
     "timesfm_uni": [
      0.0444,
      0.2397,
      0.4354,
      0.2107,
      0.0698
     ],
     "timesfm_cov": [
      0.0486,
      0.2898,
      0.5506,
      0.1065,
      0.0045
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0553,
      0.2185,
      0.3876,
      0.2348,
      0.1039
     ],
     "cond_climatology": [
      0.0256,
      0.1868,
      0.348,
      0.2381,
      0.2015
     ],
     "chronos_uni": [
      0.0373,
      0.2128,
      0.4401,
      0.2753,
      0.0345
     ],
     "chronos_cov": [
      0.1276,
      0.285,
      0.3761,
      0.1838,
      0.0275
     ],
     "timesfm_uni": [
      0.1278,
      0.253,
      0.3306,
      0.1909,
      0.0976
     ],
     "timesfm_cov": [
      0.0928,
      0.3737,
      0.4686,
      0.0629,
      0.0019
     ]
    }
   }
  },
  {
   "date": "2026-02-18",
   "outcome": {
    "1": 1,
    "5": 3
   },
   "rps": {
    "1": {
     "climatology": 0.163272,
     "cond_climatology": 0.17802,
     "chronos_uni": 0.155619,
     "timesfm_uni": 0.159202,
     "chronos_cov": 0.102117,
     "timesfm_cov": 0.127078,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.131615,
     "cond_climatology": 0.100801,
     "chronos_uni": 0.136774,
     "timesfm_uni": 0.152709,
     "chronos_cov": 0.206516,
     "timesfm_cov": 0.278332,
     "all_flat": 0.249999
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0563,
      0.1977,
      0.4498,
      0.221,
      0.0752
     ],
     "cond_climatology": [
      0.062,
      0.1679,
      0.4453,
      0.2263,
      0.0985
     ],
     "chronos_uni": [
      0.0773,
      0.2135,
      0.381,
      0.252,
      0.0762
     ],
     "chronos_cov": [
      0.0941,
      0.3154,
      0.3692,
      0.1774,
      0.0439
     ],
     "timesfm_uni": [
      0.0337,
      0.2258,
      0.4542,
      0.2123,
      0.074
     ],
     "timesfm_cov": [
      0.0371,
      0.2583,
      0.6022,
      0.1001,
      0.0023
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0552,
      0.2188,
      0.3875,
      0.2347,
      0.1038
     ],
     "cond_climatology": [
      0.0255,
      0.1898,
      0.3467,
      0.2372,
      0.2007
     ],
     "chronos_uni": [
      0.0417,
      0.2153,
      0.4343,
      0.2713,
      0.0374
     ],
     "chronos_cov": [
      0.1125,
      0.2967,
      0.3943,
      0.1759,
      0.0206
     ],
     "timesfm_uni": [
      0.0902,
      0.2586,
      0.336,
      0.205,
      0.1103
     ],
     "timesfm_cov": [
      0.0865,
      0.3671,
      0.4952,
      0.0503,
      0.001
     ]
    }
   }
  },
  {
   "date": "2026-02-19",
   "outcome": {
    "1": 4,
    "5": 4
   },
   "rps": {
    "1": {
     "climatology": 0.354676,
     "cond_climatology": 0.332182,
     "chronos_uni": 0.486138,
     "timesfm_uni": 0.368972,
     "chronos_cov": 0.676353,
     "timesfm_cov": 0.464979,
     "all_flat": 0.499999
    },
    "5": {
     "climatology": 0.329801,
     "cond_climatology": 0.251484,
     "chronos_uni": 0.408012,
     "timesfm_uni": 0.376118,
     "chronos_cov": 0.561461,
     "timesfm_cov": 0.508392,
     "all_flat": 0.499999
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0563,
      0.198,
      0.4497,
      0.2209,
      0.0751
     ],
     "cond_climatology": [
      0.0618,
      0.1709,
      0.4436,
      0.2255,
      0.0982
     ],
     "chronos_uni": [
      0.1808,
      0.3034,
      0.3642,
      0.1302,
      0.0214
     ],
     "chronos_cov": [
      0.4393,
      0.3497,
      0.1628,
      0.0404,
      0.0079
     ],
     "timesfm_uni": [
      0.1019,
      0.2457,
      0.3717,
      0.1901,
      0.0905
     ],
     "timesfm_cov": [
      0.0708,
      0.2842,
      0.5078,
      0.1295,
      0.0078
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0552,
      0.2191,
      0.3873,
      0.2346,
      0.1038
     ],
     "cond_climatology": [
      0.0255,
      0.1927,
      0.3455,
      0.2364,
      0.2
     ],
     "chronos_uni": [
      0.1129,
      0.2541,
      0.3812,
      0.2135,
      0.0383
     ],
     "chronos_cov": [
      0.2529,
      0.3841,
      0.2569,
      0.0946,
      0.0115
     ],
     "timesfm_uni": [
      0.1558,
      0.251,
      0.3075,
      0.1826,
      0.1031
     ],
     "timesfm_cov": [
      0.0936,
      0.3524,
      0.466,
      0.0851,
      0.0029
     ]
    }
   }
  },
  {
   "date": "2026-02-20",
   "outcome": {
    "1": 2,
    "5": 3
   },
   "rps": {
    "1": {
     "climatology": 0.040318,
     "cond_climatology": 0.043547,
     "chronos_uni": 0.064497,
     "timesfm_uni": 0.045941,
     "chronos_cov": 0.066123,
     "timesfm_cov": 0.047398,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.131767,
     "cond_climatology": 0.102168,
     "chronos_uni": 0.157907,
     "timesfm_uni": 0.151359,
     "chronos_cov": 0.189985,
     "timesfm_cov": 0.292045,
     "all_flat": 0.249999
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0562,
      0.1979,
      0.4495,
      0.2209,
      0.0755
     ],
     "cond_climatology": [
      0.0616,
      0.1703,
      0.442,
      0.2246,
      0.1014
     ],
     "chronos_uni": [
      0.1332,
      0.2706,
      0.3263,
      0.2042,
      0.0657
     ],
     "chronos_cov": [
      0.118,
      0.3028,
      0.319,
      0.1844,
      0.0757
     ],
     "timesfm_uni": [
      0.0564,
      0.2555,
      0.4103,
      0.1994,
      0.0783
     ],
     "timesfm_cov": [
      0.0798,
      0.3401,
      0.4969,
      0.08,
      0.0033
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0552,
      0.2193,
      0.3872,
      0.2345,
      0.1037
     ],
     "cond_climatology": [
      0.0254,
      0.1957,
      0.3442,
      0.2355,
      0.1993
     ],
     "chronos_uni": [
      0.0834,
      0.2401,
      0.3961,
      0.2335,
      0.0469
     ],
     "chronos_cov": [
      0.1186,
      0.2745,
      0.3749,
      0.193,
      0.039
     ],
     "timesfm_uni": [
      0.0969,
      0.2469,
      0.3379,
      0.2033,
      0.1151
     ],
     "timesfm_cov": [
      0.1096,
      0.3949,
      0.445,
      0.049,
      0.0014
     ]
    }
   }
  },
  {
   "date": "2026-02-21",
   "outcome": {
    "1": 4,
    "5": 3
   },
   "rps": {
    "1": {
     "climatology": 0.354452,
     "cond_climatology": 0.330237,
     "chronos_uni": 0.439643,
     "timesfm_uni": 0.385499,
     "chronos_cov": 0.420876,
     "timesfm_cov": 0.477142,
     "all_flat": 0.499999
    },
    "5": {
     "climatology": 0.131792,
     "cond_climatology": 0.102451,
     "chronos_uni": 0.171692,
     "timesfm_uni": 0.149228,
     "chronos_cov": 0.192545,
     "timesfm_cov": 0.273487,
     "all_flat": 0.249999
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0562,
      0.1979,
      0.4497,
      0.2208,
      0.0754
     ],
     "cond_climatology": [
      0.0614,
      0.1697,
      0.444,
      0.2238,
      0.1011
     ],
     "chronos_uni": [
      0.1544,
      0.2896,
      0.3411,
      0.1746,
      0.0403
     ],
     "chronos_cov": [
      0.0914,
      0.3193,
      0.3629,
      0.1793,
      0.0471
     ],
     "timesfm_uni": [
      0.0581,
      0.2645,
      0.4157,
      0.2049,
      0.0568
     ],
     "timesfm_cov": [
      0.0497,
      0.2938,
      0.5482,
      0.1049,
      0.0035
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0552,
      0.2193,
      0.3874,
      0.2344,
      0.1037
     ],
     "cond_climatology": [
      0.0253,
      0.1949,
      0.3466,
      0.2347,
      0.1986
     ],
     "chronos_uni": [
      0.0774,
      0.2595,
      0.4158,
      0.2215,
      0.0258
     ],
     "chronos_cov": [
      0.0946,
      0.2869,
      0.4026,
      0.1879,
      0.028
     ],
     "timesfm_uni": [
      0.0785,
      0.2507,
      0.3572,
      0.2077,
      0.1058
     ],
     "timesfm_cov": [
      0.0851,
      0.368,
      0.4858,
      0.0597,
      0.0015
     ]
    }
   }
  },
  {
   "date": "2026-02-25",
   "outcome": {
    "1": 1,
    "5": 3
   },
   "rps": {
    "1": {
     "climatology": 0.16334,
     "cond_climatology": 0.144631,
     "chronos_uni": 0.109676,
     "timesfm_uni": 0.128103,
     "chronos_cov": 0.191689,
     "timesfm_cov": 0.086681,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.131694,
     "cond_climatology": 0.138916,
     "chronos_uni": 0.159496,
     "timesfm_uni": 0.156382,
     "chronos_cov": 0.162969,
     "timesfm_cov": 0.300952,
     "all_flat": 0.249999
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0562,
      0.1978,
      0.4495,
      0.2207,
      0.0758
     ],
     "cond_climatology": [
      0.0697,
      0.2295,
      0.4221,
      0.209,
      0.0697
     ],
     "chronos_uni": [
      0.1457,
      0.2743,
      0.3054,
      0.1994,
      0.0752
     ],
     "chronos_cov": [
      0.054,
      0.189,
      0.3541,
      0.2337,
      0.1691
     ],
     "timesfm_uni": [
      0.0895,
      0.2581,
      0.3839,
      0.1869,
      0.0815
     ],
     "timesfm_cov": [
      0.0792,
      0.3457,
      0.4763,
      0.094,
      0.0047
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0552,
      0.2192,
      0.3873,
      0.2347,
      0.1037
     ],
     "cond_climatology": [
      0.0574,
      0.2254,
      0.3934,
      0.2008,
      0.123
     ],
     "chronos_uni": [
      0.0792,
      0.2486,
      0.3951,
      0.2356,
      0.0416
     ],
     "chronos_cov": [
      0.1197,
      0.2367,
      0.3525,
      0.2016,
      0.0895
     ],
     "timesfm_uni": [
      0.1034,
      0.2504,
      0.3364,
      0.1947,
      0.1151
     ],
     "timesfm_cov": [
      0.1239,
      0.4142,
      0.4099,
      0.0501,
      0.0019
     ]
    }
   }
  },
  {
   "date": "2026-02-26",
   "outcome": {
    "1": 3,
    "5": 2
   },
   "rps": {
    "1": {
     "climatology": 0.142155,
     "cond_climatology": 0.155698,
     "chronos_uni": 0.167272,
     "timesfm_uni": 0.168654,
     "chronos_cov": 0.176926,
     "timesfm_cov": 0.205807,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.050916,
     "cond_climatology": 0.05105,
     "chronos_uni": 0.036444,
     "timesfm_uni": 0.061019,
     "chronos_cov": 0.051556,
     "timesfm_cov": 0.045002,
     "all_flat": 0.0
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0562,
      0.1981,
      0.4494,
      0.2206,
      0.0758
     ],
     "cond_climatology": [
      0.0694,
      0.2327,
      0.4204,
      0.2082,
      0.0694
     ],
     "chronos_uni": [
      0.0835,
      0.2709,
      0.3762,
      0.2168,
      0.0526
     ],
     "chronos_cov": [
      0.1085,
      0.2807,
      0.3449,
      0.1911,
      0.0748
     ],
     "timesfm_uni": [
      0.0803,
      0.2611,
      0.3989,
      0.1985,
      0.0613
     ],
     "timesfm_cov": [
      0.0512,
      0.2747,
      0.5193,
      0.1466,
      0.0082
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0551,
      0.2191,
      0.3871,
      0.235,
      0.1036
     ],
     "cond_climatology": [
      0.0571,
      0.2245,
      0.3918,
      0.2041,
      0.1224
     ],
     "chronos_uni": [
      0.0276,
      0.2159,
      0.4647,
      0.2684,
      0.0235
     ],
     "chronos_cov": [
      0.0971,
      0.2547,
      0.3849,
      0.2024,
      0.061
     ],
     "timesfm_uni": [
      0.1083,
      0.2652,
      0.3391,
      0.186,
      0.1013
     ],
     "timesfm_cov": [
      0.0719,
      0.3346,
      0.4957,
      0.0951,
      0.0027
     ]
    }
   }
  },
  {
   "date": "2026-02-27",
   "outcome": {
    "1": 2,
    "5": 2
   },
   "rps": {
    "1": {
     "climatology": 0.040369,
     "cond_climatology": 0.043508,
     "chronos_uni": 0.0638,
     "timesfm_uni": 0.044072,
     "chronos_cov": 0.078992,
     "timesfm_cov": 0.037465,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.05096,
     "cond_climatology": 0.069701,
     "chronos_uni": 0.040017,
     "timesfm_uni": 0.053061,
     "chronos_cov": 0.068872,
     "timesfm_cov": 0.050355,
     "all_flat": 0.0
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0562,
      0.198,
      0.4492,
      0.2209,
      0.0757
     ],
     "cond_climatology": [
      0.0612,
      0.1691,
      0.4424,
      0.2266,
      0.1007
     ],
     "chronos_uni": [
      0.1222,
      0.2765,
      0.3245,
      0.2083,
      0.0685
     ],
     "chronos_cov": [
      0.0828,
      0.1625,
      0.2985,
      0.2541,
      0.2021
     ],
     "timesfm_uni": [
      0.0642,
      0.241,
      0.4222,
      0.204,
      0.0687
     ],
     "timesfm_cov": [
      0.0549,
      0.3094,
      0.517,
      0.1132,
      0.0056
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0551,
      0.219,
      0.387,
      0.2349,
      0.104
     ],
     "cond_climatology": [
      0.0252,
      0.1942,
      0.3453,
      0.2338,
      0.2014
     ],
     "chronos_uni": [
      0.0374,
      0.2286,
      0.4391,
      0.264,
      0.0309
     ],
     "chronos_cov": [
      0.0872,
      0.2018,
      0.3148,
      0.2305,
      0.1656
     ],
     "timesfm_uni": [
      0.0722,
      0.2513,
      0.3737,
      0.1993,
      0.1034
     ],
     "timesfm_cov": [
      0.0722,
      0.3649,
      0.4915,
      0.0695,
      0.0018
     ]
    }
   }
  },
  {
   "date": "2026-02-28",
   "outcome": {
    "1": 2,
    "5": 2
   },
   "rps": {
    "1": {
     "climatology": 0.04034,
     "cond_climatology": 0.043197,
     "chronos_uni": 0.052534,
     "timesfm_uni": 0.042412,
     "chronos_cov": 0.068006,
     "timesfm_cov": 0.044278,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.050985,
     "cond_climatology": 0.069982,
     "chronos_uni": 0.034483,
     "timesfm_uni": 0.049155,
     "chronos_cov": 0.052473,
     "timesfm_cov": 0.066283,
     "all_flat": 0.0
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0561,
      0.1979,
      0.4494,
      0.2208,
      0.0757
     ],
     "cond_climatology": [
      0.0609,
      0.1685,
      0.4444,
      0.2258,
      0.1004
     ],
     "chronos_uni": [
      0.0854,
      0.2731,
      0.3739,
      0.2158,
      0.0518
     ],
     "chronos_cov": [
      0.1428,
      0.2987,
      0.3272,
      0.1745,
      0.0568
     ],
     "timesfm_uni": [
      0.0537,
      0.2494,
      0.4296,
      0.2084,
      0.0589
     ],
     "timesfm_cov": [
      0.0659,
      0.3375,
      0.4965,
      0.0956,
      0.0045
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0551,
      0.2189,
      0.3868,
      0.2352,
      0.1039
     ],
     "cond_climatology": [
      0.0251,
      0.1935,
      0.3441,
      0.2366,
      0.2007
     ],
     "chronos_uni": [
      0.0248,
      0.2173,
      0.4779,
      0.2621,
      0.0179
     ],
     "chronos_cov": [
      0.1049,
      0.2618,
      0.3834,
      0.2059,
      0.044
     ],
     "timesfm_uni": [
      0.0627,
      0.2545,
      0.3928,
      0.2006,
      0.0894
     ],
     "timesfm_cov": [
      0.095,
      0.409,
      0.4498,
      0.0451,
      0.0012
     ]
    }
   }
  },
  {
   "date": "2026-03-03",
   "outcome": {
    "1": 3,
    "5": 2
   },
   "rps": {
    "1": {
     "climatology": 0.1421,
     "cond_climatology": 0.130389,
     "chronos_uni": 0.206913,
     "timesfm_uni": 0.162549,
     "chronos_cov": 0.171118,
     "timesfm_cov": 0.23927,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.05101,
     "cond_climatology": 0.070265,
     "chronos_uni": 0.035811,
     "timesfm_uni": 0.055037,
     "chronos_cov": 0.050313,
     "timesfm_cov": 0.05425,
     "all_flat": 0.0
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0561,
      0.1979,
      0.4496,
      0.2207,
      0.0757
     ],
     "cond_climatology": [
      0.0607,
      0.1679,
      0.4464,
      0.225,
      0.1
     ],
     "chronos_uni": [
      0.1198,
      0.312,
      0.3591,
      0.174,
      0.035
     ],
     "chronos_cov": [
      0.1066,
      0.2806,
      0.3312,
      0.1964,
      0.0853
     ],
     "timesfm_uni": [
      0.071,
      0.2598,
      0.3982,
      0.2047,
      0.0663
     ],
     "timesfm_cov": [
      0.0407,
      0.3155,
      0.554,
      0.0869,
      0.0029
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0551,
      0.2189,
      0.3867,
      0.2355,
      0.1039
     ],
     "cond_climatology": [
      0.025,
      0.1929,
      0.3429,
      0.2393,
      0.2
     ],
     "chronos_uni": [
      0.0365,
      0.2476,
      0.469,
      0.2313,
      0.0156
     ],
     "chronos_cov": [
      0.0915,
      0.2515,
      0.3877,
      0.2173,
      0.052
     ],
     "timesfm_uni": [
      0.0704,
      0.2463,
      0.3612,
      0.2166,
      0.1055
     ],
     "timesfm_cov": [
      0.0595,
      0.4009,
      0.5018,
      0.0371,
      0.0006
     ]
    }
   }
  },
  {
   "date": "2026-03-04",
   "outcome": {
    "1": 0,
    "5": 2
   },
   "rps": {
    "1": {
     "climatology": 0.385353,
     "cond_climatology": 0.399036,
     "chronos_uni": 0.255767,
     "timesfm_uni": 0.320644,
     "chronos_cov": 0.299671,
     "timesfm_cov": 0.3329,
     "all_flat": 0.499999
    },
    "5": {
     "climatology": 0.051035,
     "cond_climatology": 0.070547,
     "chronos_uni": 0.046498,
     "timesfm_uni": 0.063665,
     "chronos_cov": 0.05237,
     "timesfm_cov": 0.052259,
     "all_flat": 0.0
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0561,
      0.1978,
      0.4494,
      0.221,
      0.0756
     ],
     "cond_climatology": [
      0.0605,
      0.1673,
      0.4448,
      0.2278,
      0.0996
     ],
     "chronos_uni": [
      0.1803,
      0.2807,
      0.3009,
      0.1754,
      0.0627
     ],
     "chronos_cov": [
      0.1333,
      0.2731,
      0.3023,
      0.1904,
      0.1009
     ],
     "timesfm_uni": [
      0.1036,
      0.2697,
      0.3511,
      0.1744,
      0.1012
     ],
     "timesfm_cov": [
      0.0407,
      0.322,
      0.5656,
      0.0699,
      0.0018
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0551,
      0.2188,
      0.3865,
      0.2358,
      0.1038
     ],
     "cond_climatology": [
      0.0249,
      0.1922,
      0.3416,
      0.242,
      0.1993
     ],
     "chronos_uni": [
      0.0777,
      0.2683,
      0.4098,
      0.2199,
      0.0243
     ],
     "chronos_cov": [
      0.1063,
      0.2601,
      0.385,
      0.2026,
      0.046
     ],
     "timesfm_uni": [
      0.1071,
      0.2475,
      0.3259,
      0.1956,
      0.1239
     ],
     "timesfm_cov": [
      0.0592,
      0.3926,
      0.5107,
      0.037,
      0.0005
     ]
    }
   }
  },
  {
   "date": "2026-03-05",
   "outcome": {
    "1": 3,
    "5": 3
   },
   "rps": {
    "1": {
     "climatology": 0.142077,
     "cond_climatology": 0.130253,
     "chronos_uni": 0.165251,
     "timesfm_uni": 0.12299,
     "chronos_cov": 0.266744,
     "timesfm_cov": 0.201305,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.131252,
     "cond_climatology": 0.10019,
     "chronos_uni": 0.138752,
     "timesfm_uni": 0.140972,
     "chronos_cov": 0.243118,
     "timesfm_cov": 0.229264,
     "all_flat": 0.249999
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0564,
      0.1977,
      0.4493,
      0.221,
      0.0756
     ],
     "cond_climatology": [
      0.0638,
      0.1667,
      0.4433,
      0.227,
      0.0993
     ],
     "chronos_uni": [
      0.0984,
      0.2509,
      0.3762,
      0.2211,
      0.0533
     ],
     "chronos_cov": [
      0.2421,
      0.3184,
      0.2717,
      0.1292,
      0.0385
     ],
     "timesfm_uni": [
      0.0706,
      0.2077,
      0.3378,
      0.2109,
      0.1729
     ],
     "timesfm_cov": [
      0.0228,
      0.2446,
      0.5889,
      0.1381,
      0.0057
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.055,
      0.2187,
      0.3868,
      0.2357,
      0.1038
     ],
     "cond_climatology": [
      0.0248,
      0.1915,
      0.344,
      0.2411,
      0.1986
     ],
     "chronos_uni": [
      0.0483,
      0.2205,
      0.423,
      0.2653,
      0.0429
     ],
     "chronos_cov": [
      0.1769,
      0.3317,
      0.3173,
      0.1504,
      0.0237
     ],
     "timesfm_uni": [
      0.1137,
      0.2308,
      0.2976,
      0.2164,
      0.1416
     ],
     "timesfm_cov": [
      0.0339,
      0.3088,
      0.5509,
      0.1043,
      0.0021
     ]
    }
   }
  },
  {
   "date": "2026-03-06",
   "outcome": {
    "1": 2,
    "5": 3
   },
   "rps": {
    "1": {
     "climatology": 0.040387,
     "cond_climatology": 0.043645,
     "chronos_uni": 0.066949,
     "timesfm_uni": 0.054602,
     "chronos_cov": 0.068818,
     "timesfm_cov": 0.020987,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.131277,
     "cond_climatology": 0.100473,
     "chronos_uni": 0.162735,
     "timesfm_uni": 0.143939,
     "chronos_cov": 0.207177,
     "timesfm_cov": 0.224272,
     "all_flat": 0.249999
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0564,
      0.1976,
      0.4491,
      0.2212,
      0.0756
     ],
     "cond_climatology": [
      0.0636,
      0.1661,
      0.4417,
      0.2297,
      0.0989
     ],
     "chronos_uni": [
      0.1494,
      0.2856,
      0.3326,
      0.1851,
      0.0474
     ],
     "chronos_cov": [
      0.1463,
      0.3003,
      0.3265,
      0.1731,
      0.0538
     ],
     "timesfm_uni": [
      0.0678,
      0.2243,
      0.3748,
      0.2006,
      0.1325
     ],
     "timesfm_cov": [
      0.0177,
      0.2481,
      0.6204,
      0.1106,
      0.0032
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.055,
      0.2186,
      0.387,
      0.2356,
      0.1038
     ],
     "cond_climatology": [
      0.0247,
      0.1908,
      0.3463,
      0.2403,
      0.1979
     ],
     "chronos_uni": [
      0.0654,
      0.2506,
      0.423,
      0.2328,
      0.0283
     ],
     "chronos_cov": [
      0.1217,
      0.2979,
      0.3788,
      0.1812,
      0.0204
     ],
     "timesfm_uni": [
      0.0954,
      0.2469,
      0.315,
      0.2111,
      0.1316
     ],
     "timesfm_cov": [
      0.0197,
      0.2723,
      0.6087,
      0.098,
      0.0012
     ]
    }
   }
  },
  {
   "date": "2026-03-07",
   "outcome": {
    "1": 2,
    "5": 2
   },
   "rps": {
    "1": {
     "climatology": 0.040357,
     "cond_climatology": 0.043338,
     "chronos_uni": 0.059429,
     "timesfm_uni": 0.049001,
     "chronos_cov": 0.046757,
     "timesfm_cov": 0.015186,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.050922,
     "cond_climatology": 0.069065,
     "chronos_uni": 0.041125,
     "timesfm_uni": 0.060043,
     "chronos_cov": 0.044298,
     "timesfm_cov": 0.018086,
     "all_flat": 0.0
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0564,
      0.1976,
      0.4493,
      0.2212,
      0.0756
     ],
     "cond_climatology": [
      0.0634,
      0.1655,
      0.4437,
      0.2289,
      0.0986
     ],
     "chronos_uni": [
      0.114,
      0.3046,
      0.3619,
      0.1831,
      0.0364
     ],
     "chronos_cov": [
      0.0651,
      0.2716,
      0.4052,
      0.205,
      0.0531
     ],
     "timesfm_uni": [
      0.0674,
      0.2635,
      0.3919,
      0.2057,
      0.0715
     ],
     "timesfm_cov": [
      0.0112,
      0.2072,
      0.6679,
      0.1117,
      0.0021
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.055,
      0.2185,
      0.3872,
      0.2355,
      0.1037
     ],
     "cond_climatology": [
      0.0246,
      0.1901,
      0.3486,
      0.2394,
      0.1972
     ],
     "chronos_uni": [
      0.0611,
      0.2578,
      0.4389,
      0.2225,
      0.0197
     ],
     "chronos_cov": [
      0.0718,
      0.2815,
      0.4304,
      0.1956,
      0.0207
     ],
     "timesfm_uni": [
      0.11,
      0.2686,
      0.3436,
      0.1909,
      0.087
     ],
     "timesfm_cov": [
      0.013,
      0.2347,
      0.6483,
      0.1032,
      0.0008
     ]
    }
   }
  },
  {
   "date": "2026-03-11",
   "outcome": {
    "1": 3,
    "5": 3
   },
   "rps": {
    "1": {
     "climatology": 0.142023,
     "cond_climatology": 0.129877,
     "chronos_uni": 0.188366,
     "timesfm_uni": 0.158671,
     "chronos_cov": 0.137213,
     "timesfm_cov": 0.200957,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.131327,
     "cond_climatology": 0.101037,
     "chronos_uni": 0.153317,
     "timesfm_uni": 0.164937,
     "chronos_cov": 0.172347,
     "timesfm_cov": 0.202133,
     "all_flat": 0.249999
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0564,
      0.1975,
      0.4495,
      0.2211,
      0.0755
     ],
     "cond_climatology": [
      0.0632,
      0.1649,
      0.4456,
      0.2281,
      0.0982
     ],
     "chronos_uni": [
      0.1063,
      0.2889,
      0.3693,
      0.1974,
      0.038
     ],
     "chronos_cov": [
      0.0754,
      0.2179,
      0.3745,
      0.2266,
      0.1056
     ],
     "timesfm_uni": [
      0.0592,
      0.257,
      0.409,
      0.2021,
      0.0727
     ],
     "timesfm_cov": [
      0.013,
      0.2108,
      0.6443,
      0.1288,
      0.0031
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.055,
      0.2185,
      0.3875,
      0.2354,
      0.1037
     ],
     "cond_climatology": [
      0.0246,
      0.1895,
      0.3509,
      0.2386,
      0.1965
     ],
     "chronos_uni": [
      0.0519,
      0.2366,
      0.4372,
      0.2472,
      0.0271
     ],
     "chronos_cov": [
      0.0935,
      0.2562,
      0.3965,
      0.2136,
      0.0402
     ],
     "timesfm_uni": [
      0.0781,
      0.2785,
      0.3641,
      0.195,
      0.0844
     ],
     "timesfm_cov": [
      0.0126,
      0.2223,
      0.633,
      0.1306,
      0.0015
     ]
    }
   }
  },
  {
   "date": "2026-03-12",
   "outcome": {
    "1": 2,
    "5": 2
   },
   "rps": {
    "1": {
     "climatology": 0.040353,
     "cond_climatology": 0.042781,
     "chronos_uni": 0.061052,
     "timesfm_uni": 0.04811,
     "chronos_cov": 0.058838,
     "timesfm_cov": 0.013375,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.050847,
     "cond_climatology": 0.057003,
     "chronos_uni": 0.041052,
     "timesfm_uni": 0.058615,
     "chronos_cov": 0.052099,
     "timesfm_cov": 0.013497,
     "all_flat": 0.0
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0564,
      0.1974,
      0.4494,
      0.2214,
      0.0755
     ],
     "cond_climatology": [
      0.0571,
      0.2286,
      0.4357,
      0.1857,
      0.0929
     ],
     "chronos_uni": [
      0.1112,
      0.3112,
      0.3503,
      0.1859,
      0.0414
     ],
     "chronos_cov": [
      0.0936,
      0.2398,
      0.3448,
      0.2127,
      0.1091
     ],
     "timesfm_uni": [
      0.0743,
      0.266,
      0.3993,
      0.2027,
      0.0578
     ],
     "timesfm_cov": [
      0.0069,
      0.2015,
      0.6915,
      0.0985,
      0.0016
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.055,
      0.2184,
      0.3877,
      0.2353,
      0.1037
     ],
     "cond_climatology": [
      0.0143,
      0.2429,
      0.35,
      0.3071,
      0.0857
     ],
     "chronos_uni": [
      0.0593,
      0.2582,
      0.4386,
      0.2248,
      0.0191
     ],
     "chronos_cov": [
      0.106,
      0.2643,
      0.3879,
      0.2023,
      0.0394
     ],
     "timesfm_uni": [
      0.1167,
      0.2816,
      0.3603,
      0.1789,
      0.0624
     ],
     "timesfm_cov": [
      0.0073,
      0.2001,
      0.6881,
      0.1039,
      0.0006
     ]
    }
   }
  },
  {
   "date": "2026-03-13",
   "outcome": {
    "1": 2,
    "5": 2
   },
   "rps": {
    "1": {
     "climatology": 0.040323,
     "cond_climatology": 0.042734,
     "chronos_uni": 0.048429,
     "timesfm_uni": 0.045744,
     "chronos_cov": 0.051735,
     "timesfm_cov": 0.051938,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.050872,
     "cond_climatology": 0.068863,
     "chronos_uni": 0.037423,
     "timesfm_uni": 0.050191,
     "chronos_cov": 0.051873,
     "timesfm_cov": 0.065316,
     "all_flat": 0.0
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0563,
      0.1973,
      0.4496,
      0.2213,
      0.0755
     ],
     "cond_climatology": [
      0.0629,
      0.1643,
      0.4476,
      0.2273,
      0.0979
     ],
     "chronos_uni": [
      0.0761,
      0.2605,
      0.3948,
      0.2187,
      0.0498
     ],
     "chronos_cov": [
      0.0747,
      0.2528,
      0.377,
      0.2131,
      0.0824
     ],
     "timesfm_uni": [
      0.0618,
      0.2756,
      0.4096,
      0.2168,
      0.0361
     ],
     "timesfm_cov": [
      0.0502,
      0.3975,
      0.4828,
      0.0665,
      0.003
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0549,
      0.2183,
      0.3875,
      0.2356,
      0.1036
     ],
     "cond_climatology": [
      0.0245,
      0.1888,
      0.3497,
      0.2413,
      0.1958
     ],
     "chronos_uni": [
      0.0393,
      0.2306,
      0.4567,
      0.2496,
      0.0238
     ],
     "chronos_cov": [
      0.1051,
      0.2707,
      0.3916,
      0.1988,
      0.0339
     ],
     "timesfm_uni": [
      0.0855,
      0.2709,
      0.3935,
      0.1877,
      0.0624
     ],
     "timesfm_cov": [
      0.0612,
      0.445,
      0.459,
      0.034,
      0.0008
     ]
    }
   }
  },
  {
   "date": "2026-03-14",
   "outcome": {
    "1": 2,
    "5": 0
   },
   "rps": {
    "1": {
     "climatology": 0.040293,
     "cond_climatology": 0.042176,
     "chronos_uni": 0.048318,
     "timesfm_uni": 0.038214,
     "chronos_cov": 0.062704,
     "timesfm_cov": 0.072221,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.386872,
     "cond_climatology": 0.422841,
     "chronos_uni": 0.379481,
     "timesfm_uni": 0.358452,
     "chronos_cov": 0.267751,
     "timesfm_cov": 0.242041,
     "all_flat": 0.499999
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0563,
      0.1973,
      0.4498,
      0.2212,
      0.0755
     ],
     "cond_climatology": [
      0.0567,
      0.227,
      0.4397,
      0.1844,
      0.0922
     ],
     "chronos_uni": [
      0.074,
      0.2549,
      0.3942,
      0.2226,
      0.0542
     ],
     "chronos_cov": [
      0.1054,
      0.307,
      0.3322,
      0.1894,
      0.066
     ],
     "timesfm_uni": [
      0.0408,
      0.2379,
      0.4514,
      0.2435,
      0.0264
     ],
     "timesfm_cov": [
      0.0957,
      0.4274,
      0.399,
      0.0728,
      0.0052
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0549,
      0.2182,
      0.3874,
      0.2359,
      0.1036
     ],
     "cond_climatology": [
      0.0142,
      0.2411,
      0.3475,
      0.3121,
      0.0851
     ],
     "chronos_uni": [
      0.0417,
      0.2331,
      0.4548,
      0.2477,
      0.0227
     ],
     "chronos_cov": [
      0.1457,
      0.3036,
      0.3576,
      0.1696,
      0.0236
     ],
     "timesfm_uni": [
      0.0642,
      0.2431,
      0.4192,
      0.2145,
      0.0589
     ],
     "timesfm_cov": [
      0.1123,
      0.4651,
      0.3817,
      0.0393,
      0.0016
     ]
    }
   }
  },
  {
   "date": "2026-03-17",
   "outcome": {
    "1": 2,
    "5": 0
   },
   "rps": {
    "1": {
     "climatology": 0.040264,
     "cond_climatology": 0.03951,
     "chronos_uni": 0.040161,
     "timesfm_uni": 0.035863,
     "chronos_cov": 0.05357,
     "timesfm_cov": 0.061949,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.386895,
     "cond_climatology": 0.362187,
     "chronos_uni": 0.383891,
     "timesfm_uni": 0.363267,
     "chronos_cov": 0.30536,
     "timesfm_cov": 0.252007,
     "all_flat": 0.499999
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0563,
      0.1972,
      0.45,
      0.2211,
      0.0754
     ],
     "cond_climatology": [
      0.0704,
      0.2111,
      0.4604,
      0.173,
      0.085
     ],
     "chronos_uni": [
      0.0533,
      0.2611,
      0.4451,
      0.2072,
      0.0334
     ],
     "chronos_cov": [
      0.0827,
      0.221,
      0.3737,
      0.217,
      0.1056
     ],
     "timesfm_uni": [
      0.0262,
      0.2486,
      0.4664,
      0.2418,
      0.017
     ],
     "timesfm_cov": [
      0.0809,
      0.4033,
      0.4336,
      0.0772,
      0.005
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0549,
      0.2181,
      0.3876,
      0.2358,
      0.1035
     ],
     "cond_climatology": [
      0.0499,
      0.2874,
      0.349,
      0.2229,
      0.0909
     ],
     "chronos_uni": [
      0.0313,
      0.2358,
      0.4886,
      0.233,
      0.0114
     ],
     "chronos_cov": [
      0.1243,
      0.2511,
      0.3748,
      0.2045,
      0.0453
     ],
     "timesfm_uni": [
      0.0565,
      0.2414,
      0.443,
      0.2058,
      0.0533
     ],
     "timesfm_cov": [
      0.1032,
      0.4475,
      0.4044,
      0.0432,
      0.0017
     ]
    }
   }
  },
  {
   "date": "2026-03-18",
   "outcome": {
    "1": 3,
    "5": 0
   },
   "rps": {
    "1": {
     "climatology": 0.142018,
     "cond_climatology": 0.160624,
     "chronos_uni": 0.193109,
     "timesfm_uni": 0.174183,
     "chronos_cov": 0.168048,
     "timesfm_cov": 0.265504,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.38698,
     "cond_climatology": 0.362887,
     "chronos_uni": 0.374675,
     "timesfm_uni": 0.344327,
     "chronos_cov": 0.315747,
     "timesfm_cov": 0.193507,
     "all_flat": 0.499999
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0563,
      0.1971,
      0.4502,
      0.221,
      0.0754
     ],
     "cond_climatology": [
      0.0702,
      0.2105,
      0.462,
      0.1725,
      0.0848
     ],
     "chronos_uni": [
      0.0734,
      0.3055,
      0.4102,
      0.184,
      0.0269
     ],
     "chronos_cov": [
      0.0947,
      0.2665,
      0.3661,
      0.2104,
      0.0623
     ],
     "timesfm_uni": [
      0.0555,
      0.2768,
      0.4313,
      0.2271,
      0.0093
     ],
     "timesfm_cov": [
      0.1224,
      0.3898,
      0.3735,
      0.1006,
      0.0137
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0549,
      0.218,
      0.3875,
      0.2361,
      0.1035
     ],
     "cond_climatology": [
      0.0497,
      0.2865,
      0.348,
      0.2251,
      0.0906
     ],
     "chronos_uni": [
      0.0395,
      0.2414,
      0.4762,
      0.2296,
      0.0133
     ],
     "chronos_cov": [
      0.1131,
      0.2467,
      0.3857,
      0.2114,
      0.0431
     ],
     "timesfm_uni": [
      0.0724,
      0.2525,
      0.4316,
      0.2013,
      0.0421
     ],
     "timesfm_cov": [
      0.1963,
      0.4505,
      0.2955,
      0.0528,
      0.0049
     ]
    }
   }
  },
  {
   "date": "2026-03-19",
   "outcome": {
    "1": 2,
    "5": 0
   },
   "rps": {
    "1": {
     "climatology": 0.040259,
     "cond_climatology": 0.039427,
     "chronos_uni": 0.058469,
     "timesfm_uni": 0.053465,
     "chronos_cov": 0.055347,
     "timesfm_cov": 0.041042,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.387003,
     "cond_climatology": 0.363125,
     "chronos_uni": 0.357546,
     "timesfm_uni": 0.331421,
     "chronos_cov": 0.31833,
     "timesfm_cov": 0.320546,
     "all_flat": 0.499999
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0563,
      0.1971,
      0.45,
      0.2213,
      0.0754
     ],
     "cond_climatology": [
      0.07,
      0.2099,
      0.4606,
      0.1749,
      0.0845
     ],
     "chronos_uni": [
      0.0952,
      0.3293,
      0.3669,
      0.1752,
      0.0334
     ],
     "chronos_cov": [
      0.0795,
      0.2164,
      0.3661,
      0.223,
      0.1151
     ],
     "timesfm_uni": [
      0.0984,
      0.2971,
      0.3865,
      0.2023,
      0.0157
     ],
     "timesfm_cov": [
      0.045,
      0.3422,
      0.5023,
      0.1043,
      0.0063
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0549,
      0.218,
      0.3877,
      0.236,
      0.1035
     ],
     "cond_climatology": [
      0.0496,
      0.2857,
      0.3499,
      0.2245,
      0.0904
     ],
     "chronos_uni": [
      0.0488,
      0.2626,
      0.4626,
      0.213,
      0.013
     ],
     "chronos_cov": [
      0.1096,
      0.2489,
      0.3835,
      0.2077,
      0.0502
     ],
     "timesfm_uni": [
      0.0936,
      0.2464,
      0.4056,
      0.1921,
      0.0623
     ],
     "timesfm_cov": [
      0.045,
      0.3551,
      0.4991,
      0.0973,
      0.0035
     ]
    }
   }
  },
  {
   "date": "2026-03-20",
   "outcome": {
    "1": 0,
    "5": 0
   },
   "rps": {
    "1": {
     "climatology": 0.385507,
     "cond_climatology": 0.364779,
     "chronos_uni": 0.318585,
     "timesfm_uni": 0.353053,
     "chronos_cov": 0.314248,
     "timesfm_cov": 0.358793,
     "all_flat": 0.499999
    },
    "5": {
     "climatology": 0.387026,
     "cond_climatology": 0.363362,
     "chronos_uni": 0.37789,
     "timesfm_uni": 0.347275,
     "chronos_cov": 0.28557,
     "timesfm_cov": 0.338262,
     "all_flat": 0.499999
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0562,
      0.197,
      0.4502,
      0.2212,
      0.0753
     ],
     "cond_climatology": [
      0.0698,
      0.2093,
      0.4622,
      0.1744,
      0.0843
     ],
     "chronos_uni": [
      0.0785,
      0.3086,
      0.3929,
      0.1876,
      0.0325
     ],
     "chronos_cov": [
      0.0952,
      0.2988,
      0.347,
      0.1976,
      0.0615
     ],
     "timesfm_uni": [
      0.0495,
      0.2748,
      0.4472,
      0.2249,
      0.0035
     ],
     "timesfm_cov": [
      0.0207,
      0.2957,
      0.5893,
      0.0912,
      0.003
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0548,
      0.2179,
      0.3879,
      0.2359,
      0.1034
     ],
     "cond_climatology": [
      0.0494,
      0.2849,
      0.3517,
      0.2238,
      0.0901
     ],
     "chronos_uni": [
      0.0375,
      0.2393,
      0.4743,
      0.2349,
      0.014
     ],
     "chronos_cov": [
      0.1433,
      0.2631,
      0.36,
      0.1948,
      0.0387
     ],
     "timesfm_uni": [
      0.0769,
      0.2363,
      0.436,
      0.2027,
      0.0481
     ],
     "timesfm_cov": [
      0.0297,
      0.3335,
      0.5592,
      0.0761,
      0.0015
     ]
    }
   }
  },
  {
   "date": "2026-03-21",
   "outcome": {
    "1": 1,
    "5": 0
   },
   "rps": {
    "1": {
     "climatology": 0.163512,
     "cond_climatology": 0.148899,
     "chronos_uni": 0.239717,
     "timesfm_uni": 0.219996,
     "chronos_cov": 0.166474,
     "timesfm_cov": 0.134943,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.386741,
     "cond_climatology": 0.361258,
     "chronos_uni": 0.47608,
     "timesfm_uni": 0.415661,
     "chronos_cov": 0.335174,
     "timesfm_cov": 0.357951,
     "all_flat": 0.499999
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0566,
      0.1969,
      0.45,
      0.2212,
      0.0753
     ],
     "cond_climatology": [
      0.0725,
      0.2087,
      0.4609,
      0.1739,
      0.0841
     ],
     "chronos_uni": [
      0.0179,
      0.1416,
      0.3483,
      0.393,
      0.0992
     ],
     "chronos_cov": [
      0.0712,
      0.2054,
      0.3703,
      0.2395,
      0.1136
     ],
     "timesfm_uni": [
      0.0593,
      0.1676,
      0.2887,
      0.274,
      0.2103
     ],
     "timesfm_cov": [
      0.0164,
      0.2574,
      0.6163,
      0.1064,
      0.0035
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0552,
      0.2178,
      0.3878,
      0.2358,
      0.1034
     ],
     "cond_climatology": [
      0.0522,
      0.2841,
      0.3507,
      0.2232,
      0.0899
     ],
     "chronos_uni": [
      0.0225,
      0.1437,
      0.3469,
      0.3571,
      0.1296
     ],
     "chronos_cov": [
      0.1149,
      0.2179,
      0.3474,
      0.2202,
      0.0995
     ],
     "timesfm_uni": [
      0.0681,
      0.1859,
      0.2904,
      0.2816,
      0.1739
     ],
     "timesfm_cov": [
      0.0252,
      0.2893,
      0.5779,
      0.1055,
      0.0022
     ]
    }
   }
  },
  {
   "date": "2026-03-24",
   "outcome": {
    "1": 1,
    "5": 2
   },
   "rps": {
    "1": {
     "climatology": 0.163391,
     "cond_climatology": 0.14804,
     "chronos_uni": 0.285697,
     "timesfm_uni": 0.184895,
     "chronos_cov": 0.312005,
     "timesfm_cov": 0.192058,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.050856,
     "cond_climatology": 0.055705,
     "chronos_uni": 0.095151,
     "timesfm_uni": 0.080435,
     "chronos_cov": 0.092037,
     "timesfm_cov": 0.035967,
     "all_flat": 0.0
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0566,
      0.1972,
      0.4499,
      0.2211,
      0.0753
     ],
     "cond_climatology": [
      0.0723,
      0.211,
      0.4595,
      0.1734,
      0.0838
     ],
     "chronos_uni": [
      0.0119,
      0.1028,
      0.31,
      0.4089,
      0.1665
     ],
     "chronos_cov": [
      0.0167,
      0.0985,
      0.2547,
      0.3701,
      0.2601
     ],
     "timesfm_uni": [
      0.094,
      0.1855,
      0.3084,
      0.2076,
      0.2044
     ],
     "timesfm_cov": [
      0.0184,
      0.1639,
      0.5043,
      0.2795,
      0.0338
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0555,
      0.2177,
      0.3876,
      0.2357,
      0.1033
     ],
     "cond_climatology": [
      0.0549,
      0.2832,
      0.3497,
      0.2225,
      0.0896
     ],
     "chronos_uni": [
      0.0198,
      0.1231,
      0.2913,
      0.3664,
      0.1993
     ],
     "chronos_cov": [
      0.0313,
      0.1416,
      0.2883,
      0.322,
      0.2168
     ],
     "timesfm_uni": [
      0.0985,
      0.1874,
      0.2734,
      0.2508,
      0.19
     ],
     "timesfm_cov": [
      0.011,
      0.1415,
      0.5011,
      0.3248,
      0.0216
     ]
    }
   }
  },
  {
   "date": "2026-03-25",
   "outcome": {
    "1": 1,
    "5": 2
   },
   "rps": {
    "1": {
     "climatology": 0.163272,
     "cond_climatology": 0.147188,
     "chronos_uni": 0.212595,
     "timesfm_uni": 0.132436,
     "chronos_cov": 0.259821,
     "timesfm_cov": 0.202415,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.050879,
     "cond_climatology": 0.055953,
     "chronos_uni": 0.06835,
     "timesfm_uni": 0.073929,
     "chronos_cov": 0.074231,
     "timesfm_cov": 0.053467,
     "all_flat": 0.0
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0565,
      0.1975,
      0.4497,
      0.221,
      0.0753
     ],
     "cond_climatology": [
      0.072,
      0.2133,
      0.4582,
      0.1729,
      0.0836
     ],
     "chronos_uni": [
      0.0246,
      0.1547,
      0.4069,
      0.3424,
      0.0713
     ],
     "chronos_cov": [
      0.023,
      0.132,
      0.3026,
      0.3681,
      0.1743
     ],
     "timesfm_uni": [
      0.1531,
      0.221,
      0.3185,
      0.1654,
      0.1419
     ],
     "timesfm_cov": [
      0.025,
      0.1621,
      0.4346,
      0.3073,
      0.0711
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0559,
      0.2176,
      0.3875,
      0.2357,
      0.1033
     ],
     "cond_climatology": [
      0.0576,
      0.2824,
      0.3487,
      0.2219,
      0.0893
     ],
     "chronos_uni": [
      0.0312,
      0.1597,
      0.3458,
      0.3175,
      0.1459
     ],
     "chronos_cov": [
      0.0326,
      0.1588,
      0.3286,
      0.3102,
      0.1698
     ],
     "timesfm_uni": [
      0.1678,
      0.2273,
      0.2925,
      0.1947,
      0.1177
     ],
     "timesfm_cov": [
      0.0085,
      0.1097,
      0.4372,
      0.3982,
      0.0464
     ]
    }
   }
  },
  {
   "date": "2026-03-26",
   "outcome": {
    "1": 4,
    "5": 3
   },
   "rps": {
    "1": {
     "climatology": 0.35462,
     "cond_climatology": 0.370481,
     "chronos_uni": 0.281515,
     "timesfm_uni": 0.356659,
     "chronos_cov": 0.161183,
     "timesfm_cov": 0.277096,
     "all_flat": 0.499999
    },
    "5": {
     "climatology": 0.131479,
     "cond_climatology": 0.151033,
     "chronos_uni": 0.088449,
     "timesfm_uni": 0.165836,
     "chronos_cov": 0.067962,
     "timesfm_cov": 0.07257,
     "all_flat": 0.249999
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0565,
      0.1978,
      0.4495,
      0.2209,
      0.0752
     ],
     "cond_climatology": [
      0.0718,
      0.2155,
      0.4569,
      0.1724,
      0.0833
     ],
     "chronos_uni": [
      0.0121,
      0.1213,
      0.3769,
      0.4104,
      0.0793
     ],
     "chronos_cov": [
      0.0055,
      0.0515,
      0.2405,
      0.4462,
      0.2564
     ],
     "timesfm_uni": [
      0.1071,
      0.2485,
      0.3514,
      0.1812,
      0.1118
     ],
     "timesfm_cov": [
      0.0292,
      0.1481,
      0.3752,
      0.3254,
      0.122
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0562,
      0.2176,
      0.3874,
      0.2356,
      0.1033
     ],
     "cond_climatology": [
      0.0603,
      0.2816,
      0.3477,
      0.2213,
      0.0891
     ],
     "chronos_uni": [
      0.0155,
      0.1487,
      0.4,
      0.345,
      0.0908
     ],
     "chronos_cov": [
      0.011,
      0.1151,
      0.3562,
      0.3655,
      0.1522
     ],
     "timesfm_uni": [
      0.0902,
      0.267,
      0.3653,
      0.202,
      0.0755
     ],
     "timesfm_cov": [
      0.007,
      0.0981,
      0.42,
      0.416,
      0.0589
     ]
    }
   }
  },
  {
   "date": "2026-03-27",
   "outcome": {
    "1": 1,
    "5": 2
   },
   "rps": {
    "1": {
     "climatology": 0.163237,
     "cond_climatology": 0.147014,
     "chronos_uni": 0.224695,
     "timesfm_uni": 0.15757,
     "chronos_cov": 0.341738,
     "timesfm_cov": 0.219049,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.050925,
     "cond_climatology": 0.056463,
     "chronos_uni": 0.045208,
     "timesfm_uni": 0.043213,
     "chronos_cov": 0.059243,
     "timesfm_cov": 0.017648,
     "all_flat": 0.0
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0565,
      0.1977,
      0.4494,
      0.2208,
      0.0756
     ],
     "cond_climatology": [
      0.0716,
      0.2149,
      0.4556,
      0.1719,
      0.086
     ],
     "chronos_uni": [
      0.0202,
      0.1555,
      0.3692,
      0.346,
      0.1091
     ],
     "chronos_cov": [
      0.0087,
      0.0702,
      0.253,
      0.3996,
      0.2685
     ],
     "timesfm_uni": [
      0.0766,
      0.2147,
      0.3809,
      0.2065,
      0.1212
     ],
     "timesfm_cov": [
      0.0081,
      0.127,
      0.509,
      0.3167,
      0.0392
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0566,
      0.2175,
      0.3872,
      0.2355,
      0.1032
     ],
     "cond_climatology": [
      0.063,
      0.2808,
      0.3467,
      0.2206,
      0.0888
     ],
     "chronos_uni": [
      0.0171,
      0.1666,
      0.4367,
      0.3276,
      0.052
     ],
     "chronos_cov": [
      0.0119,
      0.1306,
      0.403,
      0.355,
      0.0996
     ],
     "timesfm_uni": [
      0.0447,
      0.246,
      0.4224,
      0.2235,
      0.0635
     ],
     "timesfm_cov": [
      0.0059,
      0.1655,
      0.6257,
      0.1984,
      0.0045
     ]
    }
   }
  },
  {
   "date": "2026-03-28",
   "outcome": {
    "1": 2,
    "5": 2
   },
   "rps": {
    "1": {
     "climatology": 0.040363,
     "cond_climatology": 0.040461,
     "chronos_uni": 0.033097,
     "timesfm_uni": 0.05503,
     "chronos_cov": 0.066792,
     "timesfm_cov": 0.04861,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.050949,
     "cond_climatology": 0.056724,
     "chronos_uni": 0.039957,
     "timesfm_uni": 0.05387,
     "chronos_cov": 0.040024,
     "timesfm_cov": 0.041207,
     "all_flat": 0.0
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0565,
      0.198,
      0.4492,
      0.2208,
      0.0755
     ],
     "cond_climatology": [
      0.0714,
      0.2171,
      0.4543,
      0.1714,
      0.0857
     ],
     "chronos_uni": [
      0.0288,
      0.2108,
      0.4893,
      0.2453,
      0.0258
     ],
     "chronos_cov": [
      0.013,
      0.1284,
      0.3749,
      0.3697,
      0.114
     ],
     "timesfm_uni": [
      0.0791,
      0.229,
      0.3705,
      0.1963,
      0.1251
     ],
     "timesfm_cov": [
      0.0201,
      0.1512,
      0.4319,
      0.312,
      0.0848
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0569,
      0.2174,
      0.3871,
      0.2354,
      0.1032
     ],
     "cond_climatology": [
      0.0657,
      0.28,
      0.3457,
      0.22,
      0.0886
     ],
     "chronos_uni": [
      0.0195,
      0.1908,
      0.4525,
      0.2984,
      0.0388
     ],
     "chronos_cov": [
      0.0117,
      0.1602,
      0.4712,
      0.3024,
      0.0546
     ],
     "timesfm_uni": [
      0.0593,
      0.2389,
      0.3657,
      0.2356,
      0.1005
     ],
     "timesfm_cov": [
      0.0057,
      0.1139,
      0.4937,
      0.3562,
      0.0305
     ]
    }
   }
  },
  {
   "date": "2026-03-31",
   "outcome": {
    "1": 2,
    "5": 2
   },
   "rps": {
    "1": {
     "climatology": 0.040334,
     "cond_climatology": 0.040231,
     "chronos_uni": 0.038236,
     "timesfm_uni": 0.049197,
     "chronos_cov": 0.085738,
     "timesfm_cov": 0.034263,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.050911,
     "cond_climatology": 0.056402,
     "chronos_uni": 0.035996,
     "timesfm_uni": 0.043214,
     "chronos_cov": 0.04396,
     "timesfm_cov": 0.033743,
     "all_flat": 0.0
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0565,
      0.1979,
      0.4494,
      0.2207,
      0.0755
     ],
     "cond_climatology": [
      0.0712,
      0.2165,
      0.4558,
      0.1709,
      0.0855
     ],
     "chronos_uni": [
      0.0328,
      0.2027,
      0.4564,
      0.2699,
      0.0382
     ],
     "chronos_cov": [
      0.0103,
      0.1,
      0.3342,
      0.407,
      0.1485
     ],
     "timesfm_uni": [
      0.0605,
      0.2316,
      0.3976,
      0.2029,
      0.1074
     ],
     "timesfm_cov": [
      0.0183,
      0.173,
      0.4959,
      0.2648,
      0.048
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0569,
      0.2173,
      0.3873,
      0.2353,
      0.1032
     ],
     "cond_climatology": [
      0.0655,
      0.2792,
      0.3476,
      0.2194,
      0.0883
     ],
     "chronos_uni": [
      0.0184,
      0.1952,
      0.475,
      0.2788,
      0.0326
     ],
     "chronos_cov": [
      0.0093,
      0.1391,
      0.4633,
      0.3339,
      0.0544
     ],
     "timesfm_uni": [
      0.0334,
      0.2392,
      0.4239,
      0.2305,
      0.073
     ],
     "timesfm_cov": [
      0.0038,
      0.1091,
      0.5382,
      0.3272,
      0.0217
     ]
    }
   }
  },
  {
   "date": "2026-04-01",
   "outcome": {
    "1": 2,
    "5": 2
   },
   "rps": {
    "1": {
     "climatology": 0.040304,
     "cond_climatology": 0.040003,
     "chronos_uni": 0.029867,
     "timesfm_uni": 0.050293,
     "chronos_cov": 0.062949,
     "timesfm_cov": 0.051314,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.050874,
     "cond_climatology": 0.056082,
     "chronos_uni": 0.03126,
     "timesfm_uni": 0.043404,
     "chronos_cov": 0.049026,
     "timesfm_cov": 0.065458,
     "all_flat": 0.0
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0564,
      0.1979,
      0.4496,
      0.2206,
      0.0755
     ],
     "cond_climatology": [
      0.071,
      0.2159,
      0.4574,
      0.1705,
      0.0852
     ],
     "chronos_uni": [
      0.0388,
      0.2595,
      0.5318,
      0.1592,
      0.0107
     ],
     "chronos_cov": [
      0.0093,
      0.1159,
      0.3985,
      0.3802,
      0.096
     ],
     "timesfm_uni": [
      0.0547,
      0.2491,
      0.3903,
      0.1951,
      0.1108
     ],
     "timesfm_cov": [
      0.0366,
      0.1671,
      0.4057,
      0.2916,
      0.0991
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0569,
      0.2172,
      0.3875,
      0.2352,
      0.1031
     ],
     "cond_climatology": [
      0.0653,
      0.2784,
      0.3494,
      0.2188,
      0.0881
     ],
     "chronos_uni": [
      0.0208,
      0.2251,
      0.5013,
      0.2374,
      0.0154
     ],
     "chronos_cov": [
      0.0066,
      0.1195,
      0.455,
      0.3504,
      0.0684
     ],
     "timesfm_uni": [
      0.032,
      0.2386,
      0.424,
      0.2272,
      0.0781
     ],
     "timesfm_cov": [
      0.0053,
      0.0843,
      0.4118,
      0.4274,
      0.0713
     ]
    }
   }
  },
  {
   "date": "2026-04-02",
   "outcome": {
    "1": 3,
    "5": 1
   },
   "rps": {
    "1": {
     "climatology": 0.142289,
     "cond_climatology": 0.162298,
     "chronos_uni": 0.193997,
     "timesfm_uni": 0.152701,
     "chronos_cov": 0.09271,
     "timesfm_cov": 0.120585,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.163885,
     "cond_climatology": 0.134812,
     "chronos_uni": 0.160989,
     "timesfm_uni": 0.156065,
     "chronos_cov": 0.221711,
     "timesfm_cov": 0.238836,
     "all_flat": 0.249999
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0564,
      0.1978,
      0.4498,
      0.2205,
      0.0755
     ],
     "cond_climatology": [
      0.0708,
      0.2153,
      0.4589,
      0.17,
      0.085
     ],
     "chronos_uni": [
      0.0399,
      0.2592,
      0.5285,
      0.1618,
      0.0106
     ],
     "chronos_cov": [
      0.0137,
      0.1416,
      0.4275,
      0.3341,
      0.0831
     ],
     "timesfm_uni": [
      0.059,
      0.2543,
      0.3943,
      0.2005,
      0.0919
     ],
     "timesfm_cov": [
      0.0187,
      0.165,
      0.4836,
      0.2792,
      0.0534
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0569,
      0.2172,
      0.3874,
      0.2355,
      0.1031
     ],
     "cond_climatology": [
      0.0652,
      0.2776,
      0.3484,
      0.221,
      0.0878
     ],
     "chronos_uni": [
      0.021,
      0.22,
      0.4999,
      0.2427,
      0.0164
     ],
     "chronos_cov": [
      0.0087,
      0.1379,
      0.4601,
      0.3328,
      0.0605
     ],
     "timesfm_uni": [
      0.0279,
      0.2403,
      0.4424,
      0.2239,
      0.0654
     ],
     "timesfm_cov": [
      0.0034,
      0.0971,
      0.5183,
      0.3539,
      0.0273
     ]
    }
   }
  },
  {
   "date": "2026-04-03",
   "outcome": {
    "1": 1,
    "5": 2
   },
   "rps": {
    "1": {
     "climatology": 0.16324,
     "cond_climatology": 0.147258,
     "chronos_uni": 0.157887,
     "timesfm_uni": 0.140141,
     "chronos_cov": 0.228369,
     "timesfm_cov": 0.162866,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.050861,
     "cond_climatology": 0.055883,
     "chronos_uni": 0.033047,
     "timesfm_uni": 0.042428,
     "chronos_cov": 0.048493,
     "timesfm_cov": 0.025005,
     "all_flat": 0.0
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0564,
      0.1977,
      0.4497,
      0.2208,
      0.0754
     ],
     "cond_climatology": [
      0.0706,
      0.2147,
      0.4576,
      0.1723,
      0.0847
     ],
     "chronos_uni": [
      0.0329,
      0.2217,
      0.4734,
      0.2417,
      0.0302
     ],
     "chronos_cov": [
      0.0186,
      0.1507,
      0.3714,
      0.3487,
      0.1105
     ],
     "timesfm_uni": [
      0.0761,
      0.2499,
      0.3748,
      0.1949,
      0.1044
     ],
     "timesfm_cov": [
      0.0257,
      0.2089,
      0.5122,
      0.2225,
      0.0307
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0568,
      0.2171,
      0.3876,
      0.2354,
      0.103
     ],
     "cond_climatology": [
      0.065,
      0.2768,
      0.3503,
      0.2203,
      0.0876
     ],
     "chronos_uni": [
      0.0213,
      0.2085,
      0.4902,
      0.2568,
      0.0232
     ],
     "chronos_cov": [
      0.0125,
      0.1516,
      0.4328,
      0.3365,
      0.0665
     ],
     "timesfm_uni": [
      0.0417,
      0.2501,
      0.4273,
      0.2182,
      0.0627
     ],
     "timesfm_cov": [
      0.0047,
      0.1343,
      0.5772,
      0.2716,
      0.0122
     ]
    }
   }
  },
  {
   "date": "2026-04-04",
   "outcome": {
    "1": 2,
    "5": 2
   },
   "rps": {
    "1": {
     "climatology": 0.040316,
     "cond_climatology": 0.040091,
     "chronos_uni": 0.029443,
     "timesfm_uni": 0.050599,
     "chronos_cov": 0.0484,
     "timesfm_cov": 0.023661,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.050824,
     "cond_climatology": 0.055568,
     "chronos_uni": 0.034499,
     "timesfm_uni": 0.043536,
     "chronos_cov": 0.041838,
     "timesfm_cov": 0.01828,
     "all_flat": 0.0
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0564,
      0.198,
      0.4495,
      0.2207,
      0.0754
     ],
     "cond_climatology": [
      0.0704,
      0.2169,
      0.4563,
      0.1718,
      0.0845
     ],
     "chronos_uni": [
      0.0398,
      0.2519,
      0.5322,
      0.1658,
      0.0103
     ],
     "chronos_cov": [
      0.0184,
      0.1636,
      0.4269,
      0.3063,
      0.0848
     ],
     "timesfm_uni": [
      0.0547,
      0.2424,
      0.3877,
      0.2065,
      0.1087
     ],
     "timesfm_cov": [
      0.0189,
      0.2196,
      0.5687,
      0.1781,
      0.0147
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0568,
      0.217,
      0.3878,
      0.2353,
      0.103
     ],
     "cond_climatology": [
      0.0648,
      0.2761,
      0.3521,
      0.2197,
      0.0873
     ],
     "chronos_uni": [
      0.0252,
      0.224,
      0.4774,
      0.2502,
      0.0232
     ],
     "chronos_cov": [
      0.0151,
      0.1758,
      0.4524,
      0.298,
      0.0587
     ],
     "timesfm_uni": [
      0.0315,
      0.2326,
      0.4226,
      0.2406,
      0.0726
     ],
     "timesfm_cov": [
      0.0037,
      0.1417,
      0.6267,
      0.2208,
      0.007
     ]
    }
   }
  },
  {
   "date": "2026-04-07",
   "outcome": {
    "1": 2,
    "5": 2
   },
   "rps": {
    "1": {
     "climatology": 0.040287,
     "cond_climatology": 0.039866,
     "chronos_uni": 0.032383,
     "timesfm_uni": 0.048843,
     "chronos_cov": 0.047076,
     "timesfm_cov": 0.032303,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.050787,
     "cond_climatology": 0.055257,
     "chronos_uni": 0.036177,
     "timesfm_uni": 0.044711,
     "chronos_cov": 0.039841,
     "timesfm_cov": 0.022323,
     "all_flat": 0.0
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0563,
      0.198,
      0.4497,
      0.2206,
      0.0754
     ],
     "cond_climatology": [
      0.0702,
      0.2163,
      0.4579,
      0.1713,
      0.0843
     ],
     "chronos_uni": [
      0.0452,
      0.2605,
      0.5104,
      0.1701,
      0.0137
     ],
     "chronos_cov": [
      0.0235,
      0.1771,
      0.425,
      0.2889,
      0.0855
     ],
     "timesfm_uni": [
      0.036,
      0.2373,
      0.404,
      0.1993,
      0.1234
     ],
     "timesfm_cov": [
      0.0429,
      0.2662,
      0.5132,
      0.1625,
      0.0151
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0568,
      0.2169,
      0.3881,
      0.2353,
      0.103
     ],
     "cond_climatology": [
      0.0646,
      0.2753,
      0.3539,
      0.2191,
      0.0871
     ],
     "chronos_uni": [
      0.0272,
      0.2291,
      0.4651,
      0.253,
      0.0255
     ],
     "chronos_cov": [
      0.0171,
      0.186,
      0.4575,
      0.2884,
      0.051
     ],
     "timesfm_uni": [
      0.0257,
      0.2431,
      0.4177,
      0.2261,
      0.0874
     ],
     "timesfm_cov": [
      0.0138,
      0.2378,
      0.5879,
      0.1559,
      0.0046
     ]
    }
   }
  },
  {
   "date": "2026-04-08",
   "outcome": {
    "1": 2,
    "5": 2
   },
   "rps": {
    "1": {
     "climatology": 0.040257,
     "cond_climatology": 0.039643,
     "chronos_uni": 0.033177,
     "timesfm_uni": 0.044903,
     "chronos_cov": 0.049155,
     "timesfm_cov": 0.047264,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.05075,
     "cond_climatology": 0.054947,
     "chronos_uni": 0.030885,
     "timesfm_uni": 0.041385,
     "chronos_cov": 0.041453,
     "timesfm_cov": 0.044544,
     "all_flat": 0.0
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0563,
      0.1979,
      0.4499,
      0.2206,
      0.0753
     ],
     "cond_climatology": [
      0.07,
      0.2157,
      0.4594,
      0.1709,
      0.084
     ],
     "chronos_uni": [
      0.0398,
      0.2994,
      0.5342,
      0.1203,
      0.0064
     ],
     "chronos_cov": [
      0.0153,
      0.1501,
      0.4329,
      0.3141,
      0.0876
     ],
     "timesfm_uni": [
      0.0417,
      0.2318,
      0.4223,
      0.2014,
      0.1027
     ],
     "timesfm_cov": [
      0.0865,
      0.3069,
      0.4438,
      0.1441,
      0.0187
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0568,
      0.2168,
      0.3883,
      0.2352,
      0.1029
     ],
     "cond_climatology": [
      0.0644,
      0.2745,
      0.3557,
      0.2185,
      0.0868
     ],
     "chronos_uni": [
      0.02,
      0.2275,
      0.5041,
      0.2353,
      0.0132
     ],
     "chronos_cov": [
      0.0135,
      0.1682,
      0.4587,
      0.3021,
      0.0575
     ],
     "timesfm_uni": [
      0.0284,
      0.2442,
      0.4341,
      0.2271,
      0.0662
     ],
     "timesfm_cov": [
      0.0468,
      0.36,
      0.4907,
      0.099,
      0.0036
     ]
    }
   }
  },
  {
   "date": "2026-04-09",
   "outcome": {
    "1": 3,
    "5": 2
   },
   "rps": {
    "1": {
     "climatology": 0.14233,
     "cond_climatology": 0.162327,
     "chronos_uni": 0.271503,
     "timesfm_uni": 0.156184,
     "chronos_cov": 0.169653,
     "timesfm_cov": 0.215005,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.050762,
     "cond_climatology": 0.055115,
     "chronos_uni": 0.035556,
     "timesfm_uni": 0.041319,
     "chronos_cov": 0.034524,
     "timesfm_cov": 0.033654,
     "all_flat": 0.0
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0563,
      0.1978,
      0.4501,
      0.2205,
      0.0753
     ],
     "cond_climatology": [
      0.0698,
      0.2151,
      0.4609,
      0.1704,
      0.0838
     ],
     "chronos_uni": [
      0.0946,
      0.3774,
      0.4523,
      0.0719,
      0.0038
     ],
     "chronos_cov": [
      0.0367,
      0.2433,
      0.4933,
      0.1959,
      0.0309
     ],
     "timesfm_uni": [
      0.0332,
      0.2586,
      0.4382,
      0.1951,
      0.0749
     ],
     "timesfm_cov": [
      0.0682,
      0.2957,
      0.4863,
      0.1381,
      0.0117
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0568,
      0.2171,
      0.3881,
      0.2351,
      0.1029
     ],
     "cond_climatology": [
      0.0642,
      0.2765,
      0.3547,
      0.2179,
      0.0866
     ],
     "chronos_uni": [
      0.0341,
      0.2866,
      0.484,
      0.1861,
      0.0093
     ],
     "chronos_cov": [
      0.0201,
      0.2173,
      0.4796,
      0.2473,
      0.0356
     ],
     "timesfm_uni": [
      0.0316,
      0.2671,
      0.4337,
      0.209,
      0.0586
     ],
     "timesfm_cov": [
      0.0313,
      0.3193,
      0.5459,
      0.101,
      0.0025
     ]
    }
   }
  },
  {
   "date": "2026-04-10",
   "outcome": {
    "1": 1,
    "5": 2
   },
   "rps": {
    "1": {
     "climatology": 0.163242,
     "cond_climatology": 0.147497,
     "chronos_uni": 0.126426,
     "timesfm_uni": 0.133068,
     "chronos_cov": 0.248719,
     "timesfm_cov": 0.113986,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.050725,
     "cond_climatology": 0.054808,
     "chronos_uni": 0.033332,
     "timesfm_uni": 0.041559,
     "chronos_cov": 0.042843,
     "timesfm_cov": 0.046947,
     "all_flat": 0.0
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0563,
      0.1977,
      0.4499,
      0.2208,
      0.0753
     ],
     "cond_climatology": [
      0.0696,
      0.2145,
      0.4596,
      0.1727,
      0.0836
     ],
     "chronos_uni": [
      0.0521,
      0.269,
      0.4746,
      0.1841,
      0.0201
     ],
     "chronos_cov": [
      0.0146,
      0.1351,
      0.3508,
      0.3507,
      0.1488
     ],
     "timesfm_uni": [
      0.054,
      0.2761,
      0.3985,
      0.1891,
      0.0824
     ],
     "timesfm_cov": [
      0.0643,
      0.2846,
      0.4851,
      0.1511,
      0.0149
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0567,
      0.2171,
      0.3884,
      0.235,
      0.1029
     ],
     "cond_climatology": [
      0.0641,
      0.2758,
      0.3565,
      0.2173,
      0.0864
     ],
     "chronos_uni": [
      0.0302,
      0.2453,
      0.4873,
      0.2215,
      0.0157
     ],
     "chronos_cov": [
      0.0162,
      0.1779,
      0.4461,
      0.2973,
      0.0626
     ],
     "timesfm_uni": [
      0.029,
      0.2631,
      0.4315,
      0.2159,
      0.0606
     ],
     "timesfm_cov": [
      0.0497,
      0.3728,
      0.4951,
      0.0799,
      0.0025
     ]
    }
   }
  },
  {
   "date": "2026-04-11",
   "outcome": {
    "1": 2,
    "5": 2
   },
   "rps": {
    "1": {
     "climatology": 0.04027,
     "cond_climatology": 0.039734,
     "chronos_uni": 0.046489,
     "timesfm_uni": 0.044028,
     "chronos_cov": 0.044516,
     "timesfm_cov": 0.061666,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.050688,
     "cond_climatology": 0.054504,
     "chronos_uni": 0.031484,
     "timesfm_uni": 0.038185,
     "chronos_cov": 0.034036,
     "timesfm_cov": 0.080046,
     "all_flat": 0.0
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0563,
      0.198,
      0.4498,
      0.2207,
      0.0753
     ],
     "cond_climatology": [
      0.0694,
      0.2167,
      0.4583,
      0.1722,
      0.0833
     ],
     "chronos_uni": [
      0.0625,
      0.3507,
      0.4806,
      0.1012,
      0.005
     ],
     "chronos_cov": [
      0.0164,
      0.1685,
      0.4477,
      0.2741,
      0.0932
     ],
     "timesfm_uni": [
      0.0463,
      0.2829,
      0.4211,
      0.1928,
      0.0568
     ],
     "timesfm_cov": [
      0.1126,
      0.3595,
      0.4227,
      0.0975,
      0.0077
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0567,
      0.217,
      0.3886,
      0.2349,
      0.1028
     ],
     "cond_climatology": [
      0.0639,
      0.275,
      0.3583,
      0.2167,
      0.0861
     ],
     "chronos_uni": [
      0.0288,
      0.2744,
      0.5147,
      0.1757,
      0.0064
     ],
     "chronos_cov": [
      0.0152,
      0.192,
      0.4901,
      0.2661,
      0.0366
     ],
     "timesfm_uni": [
      0.0211,
      0.2742,
      0.4542,
      0.2019,
      0.0486
     ],
     "timesfm_cov": [
      0.1049,
      0.4496,
      0.4033,
      0.0409,
      0.0013
     ]
    }
   }
  },
  {
   "date": "2026-04-14",
   "outcome": {
    "1": 1,
    "5": 2
   },
   "rps": {
    "1": {
     "climatology": 0.16314,
     "cond_climatology": 0.171068,
     "chronos_uni": 0.122999,
     "timesfm_uni": 0.143781,
     "chronos_cov": 0.189044,
     "timesfm_cov": 0.080218,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.050651,
     "cond_climatology": 0.051925,
     "chronos_uni": 0.028166,
     "timesfm_uni": 0.034283,
     "chronos_cov": 0.034709,
     "timesfm_cov": 0.076428,
     "all_flat": 0.0
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0562,
      0.198,
      0.45,
      0.2206,
      0.0752
     ],
     "cond_climatology": [
      0.0495,
      0.1832,
      0.4703,
      0.2277,
      0.0693
     ],
     "chronos_uni": [
      0.0483,
      0.2728,
      0.5097,
      0.1578,
      0.0115
     ],
     "chronos_cov": [
      0.0192,
      0.1834,
      0.4581,
      0.2695,
      0.0698
     ],
     "timesfm_uni": [
      0.0285,
      0.2544,
      0.4756,
      0.2,
      0.0415
     ],
     "timesfm_cov": [
      0.1146,
      0.3433,
      0.4249,
      0.1072,
      0.01
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0567,
      0.2169,
      0.3888,
      0.2348,
      0.1028
     ],
     "cond_climatology": [
      0.0842,
      0.1683,
      0.3861,
      0.2822,
      0.0792
     ],
     "chronos_uni": [
      0.0184,
      0.2272,
      0.5266,
      0.2177,
      0.0102
     ],
     "chronos_cov": [
      0.0111,
      0.1757,
      0.4931,
      0.2831,
      0.037
     ],
     "timesfm_uni": [
      0.014,
      0.2587,
      0.4808,
      0.2038,
      0.0427
     ],
     "timesfm_cov": [
      0.1143,
      0.4237,
      0.4055,
      0.0543,
      0.0022
     ]
    }
   }
  },
  {
   "date": "2026-04-15",
   "outcome": {
    "1": 2,
    "5": 2
   },
   "rps": {
    "1": {
     "climatology": 0.040257,
     "cond_climatology": 0.037613,
     "chronos_uni": 0.028824,
     "timesfm_uni": 0.035152,
     "chronos_cov": 0.068286,
     "timesfm_cov": 0.047429,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.050614,
     "cond_climatology": 0.051415,
     "chronos_uni": 0.028333,
     "timesfm_uni": 0.032079,
     "chronos_cov": 0.045915,
     "timesfm_cov": 0.062423,
     "all_flat": 0.0
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0562,
      0.1982,
      0.4498,
      0.2205,
      0.0752
     ],
     "cond_climatology": [
      0.0493,
      0.1872,
      0.468,
      0.2266,
      0.069
     ],
     "chronos_uni": [
      0.0235,
      0.2226,
      0.5219,
      0.2135,
      0.0186
     ],
     "chronos_cov": [
      0.006,
      0.0959,
      0.3961,
      0.3982,
      0.1038
     ],
     "timesfm_uni": [
      0.0318,
      0.2266,
      0.4762,
      0.2168,
      0.0486
     ],
     "timesfm_cov": [
      0.0795,
      0.3329,
      0.4723,
      0.1073,
      0.008
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0567,
      0.2168,
      0.389,
      0.2347,
      0.1027
     ],
     "cond_climatology": [
      0.0837,
      0.1675,
      0.3892,
      0.2808,
      0.0788
     ],
     "chronos_uni": [
      0.0138,
      0.2053,
      0.526,
      0.2413,
      0.0135
     ],
     "chronos_cov": [
      0.0045,
      0.1081,
      0.4781,
      0.3506,
      0.0587
     ],
     "timesfm_uni": [
      0.0161,
      0.2619,
      0.4988,
      0.1924,
      0.0309
     ],
     "timesfm_cov": [
      0.0834,
      0.4056,
      0.4508,
      0.0583,
      0.0018
     ]
    }
   }
  },
  {
   "date": "2026-04-16",
   "outcome": {
    "1": 3,
    "5": 2
   },
   "rps": {
    "1": {
     "climatology": 0.142418,
     "cond_climatology": 0.140186,
     "chronos_uni": 0.192494,
     "timesfm_uni": 0.1624,
     "chronos_cov": 0.073911,
     "timesfm_cov": 0.242546,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.050577,
     "cond_climatology": 0.050912,
     "chronos_uni": 0.028557,
     "timesfm_uni": 0.034031,
     "chronos_cov": 0.042234,
     "timesfm_cov": 0.069111,
     "all_flat": 0.0
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0562,
      0.1982,
      0.45,
      0.2204,
      0.0752
     ],
     "cond_climatology": [
      0.049,
      0.1863,
      0.4706,
      0.2255,
      0.0686
     ],
     "chronos_uni": [
      0.034,
      0.26,
      0.532,
      0.1623,
      0.0117
     ],
     "chronos_cov": [
      0.0042,
      0.0881,
      0.4367,
      0.386,
      0.085
     ],
     "timesfm_uni": [
      0.0343,
      0.2545,
      0.4612,
      0.2013,
      0.0487
     ],
     "timesfm_cov": [
      0.0836,
      0.3325,
      0.4727,
      0.1038,
      0.0073
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0567,
      0.2167,
      0.3893,
      0.2346,
      0.1027
     ],
     "cond_climatology": [
      0.0833,
      0.1667,
      0.3922,
      0.2794,
      0.0784
     ],
     "chronos_uni": [
      0.0188,
      0.2403,
      0.5249,
      0.2061,
      0.0099
     ],
     "chronos_cov": [
      0.0056,
      0.1243,
      0.4834,
      0.3363,
      0.0503
     ],
     "timesfm_uni": [
      0.0143,
      0.2794,
      0.4858,
      0.1879,
      0.0325
     ],
     "timesfm_cov": [
      0.1014,
      0.4114,
      0.4306,
      0.0547,
      0.0019
     ]
    }
   }
  },
  {
   "date": "2026-04-17",
   "outcome": {
    "1": 2,
    "5": 1
   },
   "rps": {
    "1": {
     "climatology": 0.040253,
     "cond_climatology": 0.037603,
     "chronos_uni": 0.029462,
     "timesfm_uni": 0.044873,
     "chronos_cov": 0.076219,
     "timesfm_cov": 0.040049,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.163894,
     "cond_climatology": 0.176026,
     "chronos_uni": 0.141956,
     "timesfm_uni": 0.127242,
     "chronos_cov": 0.218335,
     "timesfm_cov": 0.143612,
     "all_flat": 0.249999
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0562,
      0.1981,
      0.4498,
      0.2207,
      0.0752
     ],
     "cond_climatology": [
      0.0488,
      0.1854,
      0.4683,
      0.2293,
      0.0683
     ],
     "chronos_uni": [
      0.0277,
      0.2635,
      0.5297,
      0.1653,
      0.0138
     ],
     "chronos_cov": [
      0.005,
      0.0829,
      0.3815,
      0.4055,
      0.1251
     ],
     "timesfm_uni": [
      0.0566,
      0.2796,
      0.4181,
      0.1919,
      0.0539
     ],
     "timesfm_cov": [
      0.0649,
      0.2651,
      0.4557,
      0.1802,
      0.034
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0566,
      0.2167,
      0.3895,
      0.2346,
      0.1027
     ],
     "cond_climatology": [
      0.0829,
      0.1659,
      0.3951,
      0.278,
      0.078
     ],
     "chronos_uni": [
      0.0208,
      0.2518,
      0.532,
      0.1873,
      0.0081
     ],
     "chronos_cov": [
      0.0086,
      0.1443,
      0.4569,
      0.3312,
      0.0589
     ],
     "timesfm_uni": [
      0.0258,
      0.2963,
      0.4602,
      0.1818,
      0.0359
     ],
     "timesfm_cov": [
      0.0276,
      0.2467,
      0.5092,
      0.2013,
      0.0152
     ]
    }
   }
  },
  {
   "date": "2026-04-18",
   "outcome": {
    "1": 2,
    "5": 2
   },
   "rps": {
    "1": {
     "climatology": 0.040223,
     "cond_climatology": 0.037238,
     "chronos_uni": 0.026712,
     "timesfm_uni": 0.044115,
     "chronos_cov": 0.025411,
     "timesfm_cov": 0.024248,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.050503,
     "cond_climatology": 0.049928,
     "chronos_uni": 0.024363,
     "timesfm_uni": 0.035384,
     "chronos_cov": 0.028176,
     "timesfm_cov": 0.026392,
     "all_flat": 0.0
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0562,
      0.198,
      0.45,
      0.2206,
      0.0751
     ],
     "cond_climatology": [
      0.0485,
      0.1845,
      0.4709,
      0.2282,
      0.068
     ],
     "chronos_uni": [
      0.0237,
      0.2652,
      0.5602,
      0.1435,
      0.0074
     ],
     "chronos_cov": [
      0.0122,
      0.1917,
      0.5523,
      0.222,
      0.0219
     ],
     "timesfm_uni": [
      0.0535,
      0.2969,
      0.4268,
      0.1889,
      0.0339
     ],
     "timesfm_cov": [
      0.0224,
      0.2235,
      0.565,
      0.1732,
      0.0159
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0566,
      0.2166,
      0.3897,
      0.2345,
      0.1026
     ],
     "cond_climatology": [
      0.0825,
      0.165,
      0.3981,
      0.2767,
      0.0777
     ],
     "chronos_uni": [
      0.0144,
      0.2476,
      0.5689,
      0.1654,
      0.0037
     ],
     "chronos_cov": [
      0.0124,
      0.206,
      0.5279,
      0.2322,
      0.0215
     ],
     "timesfm_uni": [
      0.0194,
      0.306,
      0.488,
      0.1656,
      0.0209
     ],
     "timesfm_cov": [
      0.021,
      0.2463,
      0.5493,
      0.1756,
      0.0078
     ]
    }
   }
  },
  {
   "date": "2026-04-21",
   "outcome": {
    "1": 1,
    "5": 1
   },
   "rps": {
    "1": {
     "climatology": 0.163143,
     "cond_climatology": 0.143706,
     "chronos_uni": 0.154221,
     "timesfm_uni": 0.137639,
     "chronos_cov": 0.196635,
     "timesfm_cov": 0.165774,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.16392,
     "cond_climatology": 0.160391,
     "chronos_uni": 0.155575,
     "timesfm_uni": 0.124362,
     "chronos_cov": 0.163791,
     "timesfm_cov": 0.159509,
     "all_flat": 0.249999
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0561,
      0.198,
      0.4502,
      0.2206,
      0.0751
     ],
     "cond_climatology": [
      0.0691,
      0.2317,
      0.4228,
      0.2073,
      0.0691
     ],
     "chronos_uni": [
      0.0219,
      0.2253,
      0.5308,
      0.2035,
      0.0186
     ],
     "chronos_cov": [
      0.0082,
      0.159,
      0.5296,
      0.2705,
      0.0326
     ],
     "timesfm_uni": [
      0.0492,
      0.2586,
      0.4349,
      0.2037,
      0.0535
     ],
     "timesfm_cov": [
      0.0159,
      0.1982,
      0.574,
      0.1929,
      0.019
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0566,
      0.2165,
      0.3899,
      0.2344,
      0.1026
     ],
     "cond_climatology": [
      0.0569,
      0.2236,
      0.3943,
      0.2033,
      0.122
     ],
     "chronos_uni": [
      0.0177,
      0.2265,
      0.5308,
      0.2136,
      0.0114
     ],
     "chronos_cov": [
      0.0139,
      0.2147,
      0.5272,
      0.2264,
      0.0178
     ],
     "timesfm_uni": [
      0.0255,
      0.3033,
      0.4582,
      0.1824,
      0.0307
     ],
     "timesfm_cov": [
      0.0144,
      0.2143,
      0.5648,
      0.1968,
      0.0098
     ]
    }
   }
  },
  {
   "date": "2026-04-22",
   "outcome": {
    "1": 2,
    "5": 1
   },
   "rps": {
    "1": {
     "climatology": 0.040211,
     "cond_climatology": 0.044366,
     "chronos_uni": 0.027962,
     "timesfm_uni": 0.041144,
     "chronos_cov": 0.027112,
     "timesfm_cov": 0.025625,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.163933,
     "cond_climatology": 0.16055,
     "chronos_uni": 0.159811,
     "timesfm_uni": 0.117484,
     "chronos_cov": 0.15434,
     "timesfm_cov": 0.167001,
     "all_flat": 0.249999
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0561,
      0.1983,
      0.4501,
      0.2205,
      0.0751
     ],
     "cond_climatology": [
      0.0688,
      0.2348,
      0.4211,
      0.2065,
      0.0688
     ],
     "chronos_uni": [
      0.018,
      0.205,
      0.5292,
      0.2282,
      0.0196
     ],
     "chronos_cov": [
      0.0122,
      0.1848,
      0.5401,
      0.2429,
      0.0199
     ],
     "timesfm_uni": [
      0.0375,
      0.2679,
      0.4368,
      0.1991,
      0.0587
     ],
     "timesfm_cov": [
      0.0228,
      0.2183,
      0.5506,
      0.1865,
      0.0217
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0566,
      0.2164,
      0.3901,
      0.2343,
      0.1026
     ],
     "cond_climatology": [
      0.0567,
      0.2227,
      0.3968,
      0.2024,
      0.1215
     ],
     "chronos_uni": [
      0.0199,
      0.2219,
      0.5062,
      0.2334,
      0.0186
     ],
     "chronos_cov": [
      0.0213,
      0.232,
      0.5037,
      0.2255,
      0.0176
     ],
     "timesfm_uni": [
      0.0269,
      0.3239,
      0.4344,
      0.1764,
      0.0385
     ],
     "timesfm_cov": [
      0.017,
      0.2057,
      0.5263,
      0.2315,
      0.0196
     ]
    }
   }
  },
  {
   "date": "2026-04-23",
   "outcome": {
    "1": 2,
    "5": 1
   },
   "rps": {
    "1": {
     "climatology": 0.040182,
     "cond_climatology": 0.044009,
     "chronos_uni": 0.025684,
     "timesfm_uni": 0.042682,
     "chronos_cov": 0.020802,
     "timesfm_cov": 0.036731,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.163946,
     "cond_climatology": 0.160709,
     "chronos_uni": 0.13795,
     "timesfm_uni": 0.119936,
     "chronos_cov": 0.154434,
     "timesfm_cov": 0.219995,
     "all_flat": 0.249999
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0561,
      0.1982,
      0.4503,
      0.2204,
      0.075
     ],
     "cond_climatology": [
      0.0685,
      0.2339,
      0.4234,
      0.2056,
      0.0685
     ],
     "chronos_uni": [
      0.0255,
      0.255,
      0.5667,
      0.1455,
      0.0073
     ],
     "chronos_cov": [
      0.0133,
      0.2225,
      0.5989,
      0.156,
      0.0094
     ],
     "timesfm_uni": [
      0.0441,
      0.2773,
      0.4293,
      0.1915,
      0.0578
     ],
     "timesfm_cov": [
      0.0449,
      0.2207,
      0.4661,
      0.2194,
      0.0489
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0565,
      0.2163,
      0.3904,
      0.2342,
      0.1025
     ],
     "cond_climatology": [
      0.0565,
      0.2218,
      0.3992,
      0.2016,
      0.121
     ],
     "chronos_uni": [
      0.0258,
      0.2611,
      0.5066,
      0.1959,
      0.0105
     ],
     "chronos_cov": [
      0.0164,
      0.231,
      0.527,
      0.2132,
      0.0124
     ],
     "timesfm_uni": [
      0.027,
      0.3172,
      0.4382,
      0.1794,
      0.0383
     ],
     "timesfm_cov": [
      0.0135,
      0.1413,
      0.444,
      0.3347,
      0.0666
     ]
    }
   }
  },
  {
   "date": "2026-04-24",
   "outcome": {
    "1": 2,
    "5": 1
   },
   "rps": {
    "1": {
     "climatology": 0.040152,
     "cond_climatology": 0.043657,
     "chronos_uni": 0.028354,
     "timesfm_uni": 0.042971,
     "chronos_cov": 0.019991,
     "timesfm_cov": 0.038413,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.163827,
     "cond_climatology": 0.159421,
     "chronos_uni": 0.125554,
     "timesfm_uni": 0.119777,
     "chronos_cov": 0.155291,
     "timesfm_cov": 0.228423,
     "all_flat": 0.249999
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0561,
      0.1981,
      0.4505,
      0.2203,
      0.075
     ],
     "cond_climatology": [
      0.0683,
      0.2329,
      0.4257,
      0.2048,
      0.0683
     ],
     "chronos_uni": [
      0.0265,
      0.2887,
      0.5693,
      0.1111,
      0.0044
     ],
     "chronos_cov": [
      0.014,
      0.2285,
      0.6129,
      0.1384,
      0.0062
     ],
     "timesfm_uni": [
      0.0385,
      0.2812,
      0.4264,
      0.1929,
      0.061
     ],
     "timesfm_cov": [
      0.0334,
      0.1909,
      0.4621,
      0.2511,
      0.0625
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0565,
      0.2166,
      0.3902,
      0.2341,
      0.1025
     ],
     "cond_climatology": [
      0.0562,
      0.2249,
      0.3976,
      0.2008,
      0.1205
     ],
     "chronos_uni": [
      0.0332,
      0.2853,
      0.49,
      0.1816,
      0.0098
     ],
     "chronos_cov": [
      0.0165,
      0.2294,
      0.526,
      0.2153,
      0.0128
     ],
     "timesfm_uni": [
      0.0263,
      0.3208,
      0.4289,
      0.1799,
      0.0441
     ],
     "timesfm_cov": [
      0.0125,
      0.1353,
      0.4264,
      0.3478,
      0.0779
     ]
    }
   }
  },
  {
   "date": "2026-04-25",
   "outcome": {
    "1": 2,
    "5": 2
   },
   "rps": {
    "1": {
     "climatology": 0.040123,
     "cond_climatology": 0.043308,
     "chronos_uni": 0.027297,
     "timesfm_uni": 0.042757,
     "chronos_cov": 0.021731,
     "timesfm_cov": 0.035139,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.050369,
     "cond_climatology": 0.049584,
     "chronos_uni": 0.032686,
     "timesfm_uni": 0.039645,
     "chronos_cov": 0.028635,
     "timesfm_cov": 0.034536,
     "all_flat": 0.0
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0561,
      0.198,
      0.4507,
      0.2202,
      0.075
     ],
     "cond_climatology": [
      0.068,
      0.232,
      0.428,
      0.204,
      0.068
     ],
     "chronos_uni": [
      0.0273,
      0.2504,
      0.5457,
      0.1657,
      0.0109
     ],
     "chronos_cov": [
      0.014,
      0.2144,
      0.5861,
      0.1741,
      0.0114
     ],
     "timesfm_uni": [
      0.0471,
      0.2584,
      0.428,
      0.1999,
      0.0666
     ],
     "timesfm_cov": [
      0.0221,
      0.1769,
      0.4882,
      0.2614,
      0.0514
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0565,
      0.2166,
      0.3904,
      0.2341,
      0.1024
     ],
     "cond_climatology": [
      0.056,
      0.224,
      0.4,
      0.2,
      0.12
     ],
     "chronos_uni": [
      0.0275,
      0.2571,
      0.4945,
      0.2068,
      0.0141
     ],
     "chronos_cov": [
      0.0154,
      0.2255,
      0.5224,
      0.2205,
      0.0161
     ],
     "timesfm_uni": [
      0.0217,
      0.293,
      0.4463,
      0.195,
      0.044
     ],
     "timesfm_cov": [
      0.0166,
      0.1873,
      0.4874,
      0.2771,
      0.0316
     ]
    }
   }
  },
  {
   "date": "2026-04-28",
   "outcome": {
    "1": 2,
    "5": 2
   },
   "rps": {
    "1": {
     "climatology": 0.040094,
     "cond_climatology": 0.042964,
     "chronos_uni": 0.024154,
     "timesfm_uni": 0.044968,
     "chronos_cov": 0.019965,
     "timesfm_cov": 0.049578,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.050382,
     "cond_climatology": 0.049749,
     "chronos_uni": 0.031163,
     "timesfm_uni": 0.038025,
     "chronos_cov": 0.028416,
     "timesfm_cov": 0.067275,
     "all_flat": 0.0
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.056,
      0.198,
      0.4509,
      0.2202,
      0.075
     ],
     "cond_climatology": [
      0.0677,
      0.2311,
      0.4303,
      0.2032,
      0.0677
     ],
     "chronos_uni": [
      0.0182,
      0.2271,
      0.565,
      0.1791,
      0.0107
     ],
     "chronos_cov": [
      0.0107,
      0.1953,
      0.6012,
      0.1806,
      0.0122
     ],
     "timesfm_uni": [
      0.0464,
      0.2684,
      0.4141,
      0.1997,
      0.0714
     ],
     "timesfm_cov": [
      0.019,
      0.142,
      0.435,
      0.3103,
      0.0937
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0565,
      0.2168,
      0.3903,
      0.234,
      0.1024
     ],
     "cond_climatology": [
      0.0558,
      0.2271,
      0.3984,
      0.1992,
      0.1195
     ],
     "chronos_uni": [
      0.0229,
      0.2422,
      0.5033,
      0.2165,
      0.015
     ],
     "chronos_cov": [
      0.0149,
      0.2245,
      0.5245,
      0.216,
      0.02
     ],
     "timesfm_uni": [
      0.0165,
      0.2814,
      0.4555,
      0.199,
      0.0476
     ],
     "timesfm_cov": [
      0.0089,
      0.1066,
      0.392,
      0.3784,
      0.1142
     ]
    }
   }
  },
  {
   "date": "2026-04-29",
   "outcome": {
    "1": 1,
    "5": 2
   },
   "rps": {
    "1": {
     "climatology": 0.163109,
     "cond_climatology": 0.143814,
     "chronos_uni": 0.145908,
     "timesfm_uni": 0.133138,
     "chronos_cov": 0.173849,
     "timesfm_cov": 0.193363,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.050395,
     "cond_climatology": 0.049918,
     "chronos_uni": 0.033477,
     "timesfm_uni": 0.039966,
     "chronos_cov": 0.029146,
     "timesfm_cov": 0.052715,
     "all_flat": 0.0
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.056,
      0.1979,
      0.4511,
      0.2201,
      0.0749
     ],
     "cond_climatology": [
      0.0675,
      0.2302,
      0.4325,
      0.2024,
      0.0675
     ],
     "chronos_uni": [
      0.0251,
      0.2395,
      0.5306,
      0.1886,
      0.0162
     ],
     "chronos_cov": [
      0.0131,
      0.1893,
      0.5557,
      0.2203,
      0.0216
     ],
     "timesfm_uni": [
      0.0494,
      0.2771,
      0.4054,
      0.2005,
      0.0677
     ],
     "timesfm_cov": [
      0.0246,
      0.1695,
      0.4637,
      0.2623,
      0.0798
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0565,
      0.2171,
      0.3902,
      0.2339,
      0.1024
     ],
     "cond_climatology": [
      0.0556,
      0.2302,
      0.3968,
      0.1984,
      0.119
     ],
     "chronos_uni": [
      0.0276,
      0.2528,
      0.4868,
      0.2155,
      0.0172
     ],
     "chronos_cov": [
      0.0151,
      0.2146,
      0.5192,
      0.2283,
      0.0228
     ],
     "timesfm_uni": [
      0.0201,
      0.2927,
      0.4433,
      0.1975,
      0.0463
     ],
     "timesfm_cov": [
      0.0114,
      0.1362,
      0.4279,
      0.3309,
      0.0936
     ]
    }
   }
  },
  {
   "date": "2026-04-30",
   "outcome": {
    "1": 2,
    "5": 3
   },
   "rps": {
    "1": {
     "climatology": 0.040082,
     "cond_climatology": 0.042877,
     "chronos_uni": 0.03227,
     "timesfm_uni": 0.064437,
     "chronos_cov": 0.028203,
     "timesfm_cov": 0.054545,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.132346,
     "cond_climatology": 0.141988,
     "chronos_uni": 0.166925,
     "timesfm_uni": 0.165347,
     "chronos_cov": 0.159469,
     "timesfm_cov": 0.077656,
     "all_flat": 0.249999
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.056,
      0.1982,
      0.4509,
      0.22,
      0.0749
     ],
     "cond_climatology": [
      0.0672,
      0.2332,
      0.4308,
      0.2016,
      0.0672
     ],
     "chronos_uni": [
      0.0333,
      0.2761,
      0.5115,
      0.1669,
      0.0122
     ],
     "chronos_cov": [
      0.0255,
      0.2325,
      0.5295,
      0.1914,
      0.0211
     ],
     "timesfm_uni": [
      0.113,
      0.2728,
      0.327,
      0.1702,
      0.117
     ],
     "timesfm_cov": [
      0.0289,
      0.1521,
      0.4058,
      0.2954,
      0.1177
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0564,
      0.2174,
      0.39,
      0.2338,
      0.1023
     ],
     "cond_climatology": [
      0.0553,
      0.2332,
      0.3953,
      0.1976,
      0.1186
     ],
     "chronos_uni": [
      0.0258,
      0.2541,
      0.4872,
      0.2194,
      0.0135
     ],
     "chronos_cov": [
      0.0204,
      0.2326,
      0.5039,
      0.2246,
      0.0184
     ],
     "timesfm_uni": [
      0.0573,
      0.2934,
      0.377,
      0.1976,
      0.0747
     ],
     "timesfm_cov": [
      0.0119,
      0.1224,
      0.3932,
      0.3535,
      0.1189
     ]
    }
   }
  },
  {
   "date": "2026-05-01",
   "outcome": {
    "1": 4,
    "5": 3
   },
   "rps": {
    "1": {
     "climatology": 0.355211,
     "cond_climatology": 0.375217,
     "chronos_uni": 0.43206,
     "timesfm_uni": 0.318513,
     "chronos_cov": 0.384617,
     "timesfm_cov": 0.278355,
     "all_flat": 0.499999
    },
    "5": {
     "climatology": 0.13242,
     "cond_climatology": 0.142786,
     "chronos_uni": 0.177116,
     "timesfm_uni": 0.149493,
     "chronos_cov": 0.148831,
     "timesfm_cov": 0.067865,
     "all_flat": 0.249999
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.056,
      0.1981,
      0.4511,
      0.2199,
      0.0749
     ],
     "cond_climatology": [
      0.0669,
      0.2323,
      0.4331,
      0.2008,
      0.0669
     ],
     "chronos_uni": [
      0.041,
      0.2725,
      0.4963,
      0.1765,
      0.0138
     ],
     "chronos_cov": [
      0.0219,
      0.2057,
      0.5068,
      0.2386,
      0.027
     ],
     "timesfm_uni": [
      0.0638,
      0.2453,
      0.3519,
      0.1979,
      0.1412
     ],
     "timesfm_cov": [
      0.0299,
      0.151,
      0.392,
      0.294,
      0.1331
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0564,
      0.2177,
      0.3899,
      0.2337,
      0.1023
     ],
     "cond_climatology": [
      0.0551,
      0.2362,
      0.3937,
      0.1969,
      0.1181
     ],
     "chronos_uni": [
      0.0302,
      0.2714,
      0.4836,
      0.2028,
      0.0121
     ],
     "chronos_cov": [
      0.0156,
      0.209,
      0.5132,
      0.2423,
      0.02
     ],
     "timesfm_uni": [
      0.0292,
      0.2776,
      0.3966,
      0.2057,
      0.0909
     ],
     "timesfm_cov": [
      0.0098,
      0.1076,
      0.3653,
      0.3605,
      0.1568
     ]
    }
   }
  },
  {
   "date": "2026-05-05",
   "outcome": {
    "1": 2,
    "5": 2
   },
   "rps": {
    "1": {
     "climatology": 0.040091,
     "cond_climatology": 0.042868,
     "chronos_uni": 0.054031,
     "timesfm_uni": 0.067492,
     "chronos_cov": 0.042348,
     "timesfm_cov": 0.0592,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.050385,
     "cond_climatology": 0.049873,
     "chronos_uni": 0.040862,
     "timesfm_uni": 0.048572,
     "chronos_cov": 0.035189,
     "timesfm_cov": 0.052556,
     "all_flat": 0.0
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.056,
      0.198,
      0.4509,
      0.2198,
      0.0752
     ],
     "cond_climatology": [
      0.0667,
      0.2314,
      0.4314,
      0.2,
      0.0706
     ],
     "chronos_uni": [
      0.1073,
      0.3238,
      0.4322,
      0.1271,
      0.0097
     ],
     "chronos_cov": [
      0.0296,
      0.207,
      0.4346,
      0.2625,
      0.0663
     ],
     "timesfm_uni": [
      0.1235,
      0.2485,
      0.3139,
      0.1812,
      0.1328
     ],
     "timesfm_cov": [
      0.0359,
      0.1594,
      0.3809,
      0.2903,
      0.1334
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0564,
      0.2176,
      0.3901,
      0.2336,
      0.1023
     ],
     "cond_climatology": [
      0.0549,
      0.2353,
      0.3961,
      0.1961,
      0.1176
     ],
     "chronos_uni": [
      0.0484,
      0.3016,
      0.4539,
      0.1837,
      0.0124
     ],
     "chronos_cov": [
      0.0166,
      0.2032,
      0.4795,
      0.2591,
      0.0416
     ],
     "timesfm_uni": [
      0.035,
      0.2847,
      0.3908,
      0.2058,
      0.0837
     ],
     "timesfm_cov": [
      0.0155,
      0.151,
      0.4178,
      0.3181,
      0.0975
     ]
    }
   }
  },
  {
   "date": "2026-05-06",
   "outcome": {
    "1": 1,
    "5": 2
   },
   "rps": {
    "1": {
     "climatology": 0.163109,
     "cond_climatology": 0.144096,
     "chronos_uni": 0.079921,
     "timesfm_uni": 0.113703,
     "chronos_cov": 0.14614,
     "timesfm_cov": 0.208557,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.050348,
     "cond_climatology": 0.049484,
     "chronos_uni": 0.037093,
     "timesfm_uni": 0.041757,
     "chronos_cov": 0.03224,
     "timesfm_cov": 0.048484,
     "all_flat": 0.0
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0559,
      0.198,
      0.4511,
      0.2198,
      0.0752
     ],
     "cond_climatology": [
      0.0664,
      0.2305,
      0.4336,
      0.1992,
      0.0703
     ],
     "chronos_uni": [
      0.1,
      0.3528,
      0.4463,
      0.0958,
      0.0052
     ],
     "chronos_cov": [
      0.0344,
      0.2412,
      0.4844,
      0.21,
      0.03
     ],
     "timesfm_uni": [
      0.1148,
      0.2789,
      0.3488,
      0.1698,
      0.0878
     ],
     "timesfm_cov": [
      0.0232,
      0.1558,
      0.4348,
      0.2838,
      0.1025
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0564,
      0.2175,
      0.3903,
      0.2335,
      0.1022
     ],
     "cond_climatology": [
      0.0547,
      0.2344,
      0.3984,
      0.1953,
      0.1172
     ],
     "chronos_uni": [
      0.0384,
      0.2983,
      0.4803,
      0.1745,
      0.0086
     ],
     "chronos_cov": [
      0.0203,
      0.221,
      0.4949,
      0.2369,
      0.0269
     ],
     "timesfm_uni": [
      0.0257,
      0.3056,
      0.4356,
      0.1856,
      0.0477
     ],
     "timesfm_cov": [
      0.0124,
      0.1488,
      0.4378,
      0.3173,
      0.0837
     ]
    }
   }
  },
  {
   "date": "2026-05-07",
   "outcome": {
    "1": 3,
    "5": 2
   },
   "rps": {
    "1": {
     "climatology": 0.142657,
     "cond_climatology": 0.158541,
     "chronos_uni": 0.19412,
     "timesfm_uni": 0.169083,
     "chronos_cov": 0.14351,
     "timesfm_cov": 0.11675,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.050312,
     "cond_climatology": 0.0491,
     "chronos_uni": 0.03634,
     "timesfm_uni": 0.045667,
     "chronos_cov": 0.033734,
     "timesfm_cov": 0.0585,
     "all_flat": 0.0
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0559,
      0.1983,
      0.451,
      0.2197,
      0.0752
     ],
     "cond_climatology": [
      0.0661,
      0.2335,
      0.4319,
      0.1984,
      0.07
     ],
     "chronos_uni": [
      0.0618,
      0.2888,
      0.4553,
      0.177,
      0.0171
     ],
     "chronos_cov": [
      0.0331,
      0.2173,
      0.4628,
      0.2473,
      0.0395
     ],
     "timesfm_uni": [
      0.1055,
      0.2631,
      0.3529,
      0.1843,
      0.0943
     ],
     "timesfm_cov": [
      0.0331,
      0.1764,
      0.4317,
      0.2539,
      0.105
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0564,
      0.2175,
      0.3905,
      0.2335,
      0.1022
     ],
     "cond_climatology": [
      0.0545,
      0.2335,
      0.4008,
      0.1946,
      0.1167
     ],
     "chronos_uni": [
      0.0318,
      0.254,
      0.4646,
      0.23,
      0.0196
     ],
     "chronos_cov": [
      0.0164,
      0.1971,
      0.4898,
      0.2641,
      0.0326
     ],
     "timesfm_uni": [
      0.0349,
      0.3133,
      0.4112,
      0.1927,
      0.048
     ],
     "timesfm_cov": [
      0.0111,
      0.1307,
      0.4104,
      0.3328,
      0.115
     ]
    }
   }
  },
  {
   "date": "2026-05-08",
   "outcome": {
    "1": 2,
    "5": 1
   },
   "rps": {
    "1": {
     "climatology": 0.040103,
     "cond_climatology": 0.037597,
     "chronos_uni": 0.051937,
     "timesfm_uni": 0.057998,
     "chronos_cov": 0.044115,
     "timesfm_cov": 0.045969,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.163477,
     "cond_climatology": 0.177116,
     "chronos_uni": 0.122126,
     "timesfm_uni": 0.127699,
     "chronos_cov": 0.181047,
     "timesfm_cov": 0.208318,
     "all_flat": 0.249999
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0559,
      0.1982,
      0.4508,
      0.22,
      0.0751
     ],
     "cond_climatology": [
      0.0483,
      0.1836,
      0.4686,
      0.2319,
      0.0676
     ],
     "chronos_uni": [
      0.0974,
      0.3138,
      0.419,
      0.1525,
      0.0172
     ],
     "chronos_cov": [
      0.0292,
      0.1976,
      0.4306,
      0.2603,
      0.0824
     ],
     "timesfm_uni": [
      0.1081,
      0.2381,
      0.3556,
      0.191,
      0.1072
     ],
     "timesfm_cov": [
      0.0353,
      0.181,
      0.4293,
      0.2532,
      0.1011
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0563,
      0.2174,
      0.3904,
      0.2337,
      0.1021
     ],
     "cond_climatology": [
      0.0821,
      0.1643,
      0.3961,
      0.2802,
      0.0773
     ],
     "chronos_uni": [
      0.0455,
      0.2907,
      0.4507,
      0.1958,
      0.0174
     ],
     "chronos_cov": [
      0.0159,
      0.1948,
      0.4761,
      0.2593,
      0.0538
     ],
     "timesfm_uni": [
      0.0438,
      0.2904,
      0.4156,
      0.1965,
      0.0537
     ],
     "timesfm_cov": [
      0.0139,
      0.1619,
      0.4405,
      0.3025,
      0.0812
     ]
    }
   }
  },
  {
   "date": "2026-05-09",
   "outcome": {
    "1": 2,
    "5": 0
   },
   "rps": {
    "1": {
     "climatology": 0.040074,
     "cond_climatology": 0.037237,
     "chronos_uni": 0.058665,
     "timesfm_uni": 0.047466,
     "chronos_cov": 0.035666,
     "timesfm_cov": 0.039379,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.38539,
     "cond_climatology": 0.387221,
     "chronos_uni": 0.332841,
     "timesfm_uni": 0.366354,
     "chronos_cov": 0.384363,
     "timesfm_cov": 0.451796,
     "all_flat": 0.499999
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0559,
      0.1981,
      0.451,
      0.2199,
      0.0751
     ],
     "cond_climatology": [
      0.0481,
      0.1827,
      0.4712,
      0.2308,
      0.0673
     ],
     "chronos_uni": [
      0.1178,
      0.3347,
      0.4214,
      0.1163,
      0.0098
     ],
     "chronos_cov": [
      0.0399,
      0.2658,
      0.4785,
      0.1838,
      0.032
     ],
     "timesfm_uni": [
      0.0817,
      0.25,
      0.4079,
      0.1871,
      0.0733
     ],
     "timesfm_cov": [
      0.0339,
      0.1899,
      0.458,
      0.2471,
      0.0711
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0563,
      0.2173,
      0.3903,
      0.234,
      0.1021
     ],
     "cond_climatology": [
      0.0817,
      0.1635,
      0.3942,
      0.2837,
      0.0769
     ],
     "chronos_uni": [
      0.0531,
      0.3142,
      0.4479,
      0.1722,
      0.0126
     ],
     "chronos_cov": [
      0.0223,
      0.2515,
      0.4949,
      0.2057,
      0.0256
     ],
     "timesfm_uni": [
      0.0322,
      0.2806,
      0.453,
      0.1948,
      0.0395
     ],
     "timesfm_cov": [
      0.0123,
      0.1575,
      0.4585,
      0.3079,
      0.0639
     ]
    }
   }
  },
  {
   "date": "2026-05-13",
   "outcome": {
    "1": 1,
    "5": 0
   },
   "rps": {
    "1": {
     "climatology": 0.163095,
     "cond_climatology": 0.172048,
     "chronos_uni": 0.089526,
     "timesfm_uni": 0.137178,
     "chronos_cov": 0.11652,
     "timesfm_cov": 0.199949,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.385413,
     "cond_climatology": 0.38752,
     "chronos_uni": 0.347901,
     "timesfm_uni": 0.374719,
     "chronos_cov": 0.369375,
     "timesfm_cov": 0.470565,
     "all_flat": 0.499999
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0559,
      0.198,
      0.4512,
      0.2198,
      0.0751
     ],
     "cond_climatology": [
      0.0478,
      0.1818,
      0.4737,
      0.2297,
      0.067
     ],
     "chronos_uni": [
      0.0833,
      0.3352,
      0.4674,
      0.1084,
      0.0056
     ],
     "chronos_cov": [
      0.0463,
      0.2974,
      0.4753,
      0.1604,
      0.0206
     ],
     "timesfm_uni": [
      0.0728,
      0.2446,
      0.4147,
      0.1922,
      0.0756
     ],
     "timesfm_cov": [
      0.0258,
      0.1627,
      0.4474,
      0.2743,
      0.0898
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0563,
      0.2172,
      0.3905,
      0.2339,
      0.1021
     ],
     "cond_climatology": [
      0.0813,
      0.1627,
      0.3971,
      0.2823,
      0.0766
     ],
     "chronos_uni": [
      0.0399,
      0.2991,
      0.4793,
      0.1719,
      0.0097
     ],
     "chronos_cov": [
      0.0266,
      0.274,
      0.4981,
      0.1845,
      0.0169
     ],
     "timesfm_uni": [
      0.0284,
      0.2684,
      0.4616,
      0.1991,
      0.0426
     ],
     "timesfm_cov": [
      0.0101,
      0.1359,
      0.4467,
      0.3232,
      0.0841
     ]
    }
   }
  },
  {
   "date": "2026-05-14",
   "outcome": {
    "1": 2,
    "5": 0
   },
   "rps": {
    "1": {
     "climatology": 0.040062,
     "cond_climatology": 0.03708,
     "chronos_uni": 0.038943,
     "timesfm_uni": 0.044897,
     "chronos_cov": 0.038596,
     "timesfm_cov": 0.052542,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.385436,
     "cond_climatology": 0.387817,
     "chronos_uni": 0.372508,
     "timesfm_uni": 0.372405,
     "chronos_cov": 0.388351,
     "timesfm_cov": 0.507341,
     "all_flat": 0.499999
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0558,
      0.1983,
      0.4511,
      0.2197,
      0.0751
     ],
     "cond_climatology": [
      0.0476,
      0.1857,
      0.4714,
      0.2286,
      0.0667
     ],
     "chronos_uni": [
      0.0535,
      0.3091,
      0.4913,
      0.1383,
      0.0078
     ],
     "chronos_cov": [
      0.0504,
      0.2971,
      0.4771,
      0.1572,
      0.0182
     ],
     "timesfm_uni": [
      0.0694,
      0.2161,
      0.4248,
      0.1932,
      0.0965
     ],
     "timesfm_cov": [
      0.0328,
      0.1628,
      0.4075,
      0.2818,
      0.1151
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0563,
      0.2171,
      0.3907,
      0.2338,
      0.102
     ],
     "cond_climatology": [
      0.081,
      0.1619,
      0.4,
      0.281,
      0.0762
     ],
     "chronos_uni": [
      0.027,
      0.2663,
      0.4971,
      0.1991,
      0.0104
     ],
     "chronos_cov": [
      0.0197,
      0.2444,
      0.5113,
      0.208,
      0.0166
     ],
     "timesfm_uni": [
      0.0308,
      0.2742,
      0.4414,
      0.2,
      0.0536
     ],
     "timesfm_cov": [
      0.0082,
      0.105,
      0.3928,
      0.3695,
      0.1244
     ]
    }
   }
  },
  {
   "date": "2026-05-15",
   "outcome": {
    "1": 2,
    "5": 0
   },
   "rps": {
    "1": {
     "climatology": 0.040033,
     "cond_climatology": 0.03673,
     "chronos_uni": 0.031966,
     "timesfm_uni": 0.042685,
     "chronos_cov": 0.036012,
     "timesfm_cov": 0.075716,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.38546,
     "cond_climatology": 0.388115,
     "chronos_uni": 0.378443,
     "timesfm_uni": 0.377127,
     "chronos_cov": 0.429627,
     "timesfm_cov": 0.569362,
     "all_flat": 0.499999
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0558,
      0.1983,
      0.4513,
      0.2196,
      0.075
     ],
     "cond_climatology": [
      0.0474,
      0.1848,
      0.4739,
      0.2275,
      0.0664
     ],
     "chronos_uni": [
      0.0349,
      0.2688,
      0.5113,
      0.1717,
      0.0133
     ],
     "chronos_cov": [
      0.0159,
      0.1764,
      0.4846,
      0.2734,
      0.0496
     ],
     "timesfm_uni": [
      0.0655,
      0.2254,
      0.4349,
      0.1925,
      0.0816
     ],
     "timesfm_cov": [
      0.0313,
      0.1349,
      0.341,
      0.3155,
      0.1773
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0563,
      0.2171,
      0.3909,
      0.2338,
      0.102
     ],
     "cond_climatology": [
      0.0806,
      0.1611,
      0.4028,
      0.2796,
      0.0758
     ],
     "chronos_uni": [
      0.0263,
      0.2569,
      0.4894,
      0.2118,
      0.0156
     ],
     "chronos_cov": [
      0.0116,
      0.1817,
      0.5077,
      0.2636,
      0.0355
     ],
     "timesfm_uni": [
      0.0248,
      0.2743,
      0.4484,
      0.2041,
      0.0484
     ],
     "timesfm_cov": [
      0.0062,
      0.0664,
      0.308,
      0.4043,
      0.215
     ]
    }
   }
  },
  {
   "date": "2026-05-16",
   "outcome": {
    "1": 0,
    "5": 0
   },
   "rps": {
    "1": {
     "climatology": 0.385113,
     "cond_climatology": 0.3708,
     "chronos_uni": 0.339368,
     "timesfm_uni": 0.345916,
     "chronos_cov": 0.404474,
     "timesfm_cov": 0.468514,
     "all_flat": 0.499999
    },
    "5": {
     "climatology": 0.385351,
     "cond_climatology": 0.346072,
     "chronos_uni": 0.367213,
     "timesfm_uni": 0.365514,
     "chronos_cov": 0.404925,
     "timesfm_cov": 0.583651,
     "all_flat": 0.499999
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0558,
      0.1982,
      0.4514,
      0.2196,
      0.075
     ],
     "cond_climatology": [
      0.06,
      0.216,
      0.456,
      0.208,
      0.06
     ],
     "chronos_uni": [
      0.0487,
      0.2989,
      0.489,
      0.1504,
      0.013
     ],
     "chronos_cov": [
      0.0208,
      0.2079,
      0.5196,
      0.2245,
      0.0272
     ],
     "timesfm_uni": [
      0.0751,
      0.2485,
      0.4199,
      0.1871,
      0.0693
     ],
     "timesfm_cov": [
      0.029,
      0.1423,
      0.3616,
      0.3043,
      0.1627
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0562,
      0.2173,
      0.3908,
      0.2337,
      0.102
     ],
     "cond_climatology": [
      0.064,
      0.276,
      0.404,
      0.172,
      0.084
     ],
     "chronos_uni": [
      0.0321,
      0.272,
      0.478,
      0.1997,
      0.0182
     ],
     "chronos_cov": [
      0.0141,
      0.2171,
      0.5312,
      0.2176,
      0.0199
     ],
     "timesfm_uni": [
      0.0263,
      0.2979,
      0.4401,
      0.1944,
      0.0413
     ],
     "timesfm_cov": [
      0.0042,
      0.0539,
      0.3063,
      0.4086,
      0.2271
     ]
    }
   }
  },
  {
   "date": "2026-05-19",
   "outcome": {
    "1": 2,
    "5": 2
   },
   "rps": {
    "1": {
     "climatology": 0.040031,
     "cond_climatology": 0.039166,
     "chronos_uni": 0.035442,
     "timesfm_uni": 0.052499,
     "chronos_cov": 0.052125,
     "timesfm_cov": 0.12552,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.050287,
     "cond_climatology": 0.048499,
     "chronos_uni": 0.042682,
     "timesfm_uni": 0.046771,
     "chronos_cov": 0.038045,
     "timesfm_cov": 0.22255,
     "all_flat": 0.0
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0561,
      0.1981,
      0.4513,
      0.2195,
      0.075
     ],
     "cond_climatology": [
      0.0637,
      0.2151,
      0.4542,
      0.2072,
      0.0598
     ],
     "chronos_uni": [
      0.0247,
      0.2163,
      0.4725,
      0.2547,
      0.0318
     ],
     "chronos_cov": [
      0.0189,
      0.1583,
      0.4103,
      0.3311,
      0.0813
     ],
     "timesfm_uni": [
      0.0768,
      0.2141,
      0.3861,
      0.2001,
      0.123
     ],
     "timesfm_cov": [
      0.0401,
      0.1049,
      0.2329,
      0.3181,
      0.304
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0566,
      0.2173,
      0.3906,
      0.2336,
      0.1019
     ],
     "cond_climatology": [
      0.0677,
      0.2749,
      0.4024,
      0.1713,
      0.0837
     ],
     "chronos_uni": [
      0.0266,
      0.2167,
      0.4274,
      0.2803,
      0.0489
     ],
     "chronos_cov": [
      0.018,
      0.1918,
      0.4648,
      0.2814,
      0.044
     ],
     "timesfm_uni": [
      0.0403,
      0.2707,
      0.4014,
      0.2098,
      0.0777
     ],
     "timesfm_cov": [
      0.0044,
      0.028,
      0.1516,
      0.3435,
      0.4725
     ]
    }
   }
  },
  {
   "date": "2026-05-20",
   "outcome": {
    "1": 1,
    "5": 2
   },
   "rps": {
    "1": {
     "climatology": 0.16292,
     "cond_climatology": 0.149967,
     "chronos_uni": 0.197001,
     "timesfm_uni": 0.140654,
     "chronos_cov": 0.229752,
     "timesfm_cov": 0.261408,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.050311,
     "cond_climatology": 0.048934,
     "chronos_uni": 0.041242,
     "timesfm_uni": 0.049075,
     "chronos_cov": 0.040775,
     "timesfm_cov": 0.178179,
     "all_flat": 0.0
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0561,
      0.198,
      0.4515,
      0.2194,
      0.0749
     ],
     "cond_climatology": [
      0.0635,
      0.2143,
      0.4563,
      0.2063,
      0.0595
     ],
     "chronos_uni": [
      0.0148,
      0.1689,
      0.4704,
      0.3032,
      0.0427
     ],
     "chronos_cov": [
      0.011,
      0.132,
      0.4342,
      0.3474,
      0.0754
     ],
     "timesfm_uni": [
      0.1013,
      0.2274,
      0.3731,
      0.1842,
      0.1138
     ],
     "timesfm_cov": [
      0.0466,
      0.1283,
      0.2752,
      0.3039,
      0.2459
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0569,
      0.2172,
      0.3905,
      0.2335,
      0.1019
     ],
     "cond_climatology": [
      0.0714,
      0.2738,
      0.4008,
      0.1706,
      0.0833
     ],
     "chronos_uni": [
      0.0201,
      0.2011,
      0.4418,
      0.2917,
      0.0453
     ],
     "chronos_cov": [
      0.0109,
      0.1581,
      0.4677,
      0.3142,
      0.0491
     ],
     "timesfm_uni": [
      0.0524,
      0.2694,
      0.3885,
      0.2115,
      0.0781
     ],
     "timesfm_cov": [
      0.0063,
      0.0429,
      0.1991,
      0.3704,
      0.3812
     ]
    }
   }
  },
  {
   "date": "2026-05-21",
   "outcome": {
    "1": 2,
    "5": 2
   },
   "rps": {
    "1": {
     "climatology": 0.040019,
     "cond_climatology": 0.0391,
     "chronos_uni": 0.035679,
     "timesfm_uni": 0.05605,
     "chronos_cov": 0.03751,
     "timesfm_cov": 0.076059,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.050334,
     "cond_climatology": 0.049376,
     "chronos_uni": 0.044372,
     "timesfm_uni": 0.057143,
     "chronos_cov": 0.038199,
     "timesfm_cov": 0.1538,
     "all_flat": 0.0
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0561,
      0.1983,
      0.4513,
      0.2193,
      0.0749
     ],
     "cond_climatology": [
      0.0632,
      0.2174,
      0.4545,
      0.2055,
      0.0593
     ],
     "chronos_uni": [
      0.0167,
      0.1848,
      0.4816,
      0.2793,
      0.0375
     ],
     "chronos_cov": [
      0.015,
      0.1627,
      0.4814,
      0.2958,
      0.0451
     ],
     "timesfm_uni": [
      0.1124,
      0.2545,
      0.3731,
      0.1632,
      0.0968
     ],
     "timesfm_cov": [
      0.0465,
      0.1487,
      0.3257,
      0.2936,
      0.1855
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0573,
      0.2171,
      0.3904,
      0.2334,
      0.1018
     ],
     "cond_climatology": [
      0.0751,
      0.2727,
      0.3992,
      0.17,
      0.083
     ],
     "chronos_uni": [
      0.0257,
      0.221,
      0.4172,
      0.2813,
      0.0547
     ],
     "chronos_cov": [
      0.0125,
      0.1815,
      0.4694,
      0.2951,
      0.0414
     ],
     "timesfm_uni": [
      0.1041,
      0.2801,
      0.3613,
      0.1815,
      0.073
     ],
     "timesfm_cov": [
      0.0066,
      0.0514,
      0.2334,
      0.3775,
      0.3311
     ]
    }
   }
  },
  {
   "date": "2026-05-22",
   "outcome": {
    "1": 3,
    "5": 2
   },
   "rps": {
    "1": {
     "climatology": 0.142921,
     "cond_climatology": 0.156903,
     "chronos_uni": 0.119415,
     "timesfm_uni": 0.152365,
     "chronos_cov": 0.088833,
     "timesfm_cov": 0.098553,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.050358,
     "cond_climatology": 0.049825,
     "chronos_uni": 0.04285,
     "timesfm_uni": 0.051749,
     "chronos_cov": 0.041188,
     "timesfm_cov": 0.139192,
     "all_flat": 0.0
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0561,
      0.1983,
      0.4515,
      0.2192,
      0.0749
     ],
     "cond_climatology": [
      0.063,
      0.2165,
      0.4567,
      0.2047,
      0.0591
     ],
     "chronos_uni": [
      0.0163,
      0.1744,
      0.4721,
      0.2956,
      0.0416
     ],
     "chronos_cov": [
      0.0119,
      0.1299,
      0.4305,
      0.3406,
      0.0871
     ],
     "timesfm_uni": [
      0.0748,
      0.2209,
      0.4153,
      0.1849,
      0.1041
     ],
     "timesfm_cov": [
      0.0548,
      0.1635,
      0.3434,
      0.271,
      0.1672
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0576,
      0.217,
      0.3902,
      0.2333,
      0.1018
     ],
     "cond_climatology": [
      0.0787,
      0.2717,
      0.3976,
      0.1693,
      0.0827
     ],
     "chronos_uni": [
      0.0232,
      0.228,
      0.4243,
      0.2752,
      0.0493
     ],
     "chronos_cov": [
      0.0127,
      0.1721,
      0.4583,
      0.3019,
      0.0551
     ],
     "timesfm_uni": [
      0.0608,
      0.2846,
      0.3749,
      0.2035,
      0.0762
     ],
     "timesfm_cov": [
      0.008,
      0.0624,
      0.2534,
      0.3689,
      0.3073
     ]
    }
   }
  },
  {
   "date": "2026-05-23",
   "outcome": {
    "1": 2,
    "5": 1
   },
   "rps": {
    "1": {
     "climatology": 0.040014,
     "cond_climatology": 0.039008,
     "chronos_uni": 0.033031,
     "timesfm_uni": 0.048616,
     "chronos_cov": 0.03884,
     "timesfm_cov": 0.054074,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.162932,
     "cond_climatology": 0.12381,
     "chronos_uni": 0.140836,
     "timesfm_uni": 0.120611,
     "chronos_cov": 0.159463,
     "timesfm_cov": 0.314282,
     "all_flat": 0.249999
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0561,
      0.1982,
      0.4514,
      0.2195,
      0.0749
     ],
     "cond_climatology": [
      0.0627,
      0.2157,
      0.4549,
      0.2078,
      0.0588
     ],
     "chronos_uni": [
      0.0269,
      0.2383,
      0.4891,
      0.2193,
      0.0264
     ],
     "chronos_cov": [
      0.0211,
      0.1844,
      0.4631,
      0.278,
      0.0534
     ],
     "timesfm_uni": [
      0.0807,
      0.2428,
      0.4039,
      0.1779,
      0.0947
     ],
     "timesfm_cov": [
      0.036,
      0.1655,
      0.4011,
      0.2691,
      0.1283
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.058,
      0.217,
      0.3901,
      0.2332,
      0.1018
     ],
     "cond_climatology": [
      0.0824,
      0.2706,
      0.3961,
      0.1686,
      0.0824
     ],
     "chronos_uni": [
      0.0314,
      0.2692,
      0.431,
      0.2356,
      0.0328
     ],
     "chronos_cov": [
      0.0203,
      0.2314,
      0.4717,
      0.2441,
      0.0324
     ],
     "timesfm_uni": [
      0.0487,
      0.3089,
      0.3904,
      0.1893,
      0.0627
     ],
     "timesfm_cov": [
      0.0076,
      0.0771,
      0.3106,
      0.3729,
      0.2318
     ]
    }
   }
  },
  {
   "date": "2026-05-26",
   "outcome": {
    "1": 2,
    "5": 2
   },
   "rps": {
    "1": {
     "climatology": 0.039986,
     "cond_climatology": 0.038704,
     "chronos_uni": 0.033929,
     "timesfm_uni": 0.051034,
     "chronos_cov": 0.035238,
     "timesfm_cov": 0.063866,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.050345,
     "cond_climatology": 0.049889,
     "chronos_uni": 0.038715,
     "timesfm_uni": 0.051454,
     "chronos_cov": 0.034575,
     "timesfm_cov": 0.089504,
     "all_flat": 0.0
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.056,
      0.1981,
      0.4516,
      0.2195,
      0.0748
     ],
     "cond_climatology": [
      0.0625,
      0.2148,
      0.457,
      0.207,
      0.0586
     ],
     "chronos_uni": [
      0.036,
      0.2849,
      0.5021,
      0.1647,
      0.0123
     ],
     "chronos_cov": [
      0.0371,
      0.2726,
      0.4827,
      0.1835,
      0.0241
     ],
     "timesfm_uni": [
      0.0958,
      0.2456,
      0.3918,
      0.1817,
      0.0851
     ],
     "timesfm_cov": [
      0.039,
      0.1503,
      0.3685,
      0.2918,
      0.1503
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0579,
      0.2169,
      0.3903,
      0.2332,
      0.1017
     ],
     "cond_climatology": [
      0.082,
      0.2695,
      0.3984,
      0.168,
      0.082
     ],
     "chronos_uni": [
      0.0303,
      0.2908,
      0.4542,
      0.2063,
      0.0185
     ],
     "chronos_cov": [
      0.0263,
      0.2681,
      0.4807,
      0.2055,
      0.0194
     ],
     "timesfm_uni": [
      0.0633,
      0.3093,
      0.3829,
      0.1879,
      0.0566
     ],
     "timesfm_cov": [
      0.0114,
      0.0995,
      0.3334,
      0.364,
      0.1917
     ]
    }
   }
  },
  {
   "date": "2026-05-27",
   "outcome": {
    "1": 2,
    "5": 2
   },
   "rps": {
    "1": {
     "climatology": 0.039957,
     "cond_climatology": 0.038403,
     "chronos_uni": 0.036986,
     "timesfm_uni": 0.054275,
     "chronos_cov": 0.039019,
     "timesfm_cov": 0.050619,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.050309,
     "cond_climatology": 0.049501,
     "chronos_uni": 0.038641,
     "timesfm_uni": 0.050371,
     "chronos_cov": 0.034919,
     "timesfm_cov": 0.057564,
     "all_flat": 0.0
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.056,
      0.198,
      0.4518,
      0.2194,
      0.0748
     ],
     "cond_climatology": [
      0.0623,
      0.214,
      0.4591,
      0.2062,
      0.0584
     ],
     "chronos_uni": [
      0.0444,
      0.3125,
      0.5069,
      0.1289,
      0.0073
     ],
     "chronos_cov": [
      0.0495,
      0.3054,
      0.4794,
      0.1521,
      0.0136
     ],
     "timesfm_uni": [
      0.1127,
      0.2516,
      0.3777,
      0.1866,
      0.0715
     ],
     "timesfm_cov": [
      0.0441,
      0.1669,
      0.409,
      0.2725,
      0.1076
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0579,
      0.2168,
      0.3905,
      0.2331,
      0.1017
     ],
     "cond_climatology": [
      0.0817,
      0.2685,
      0.4008,
      0.1673,
      0.0817
     ],
     "chronos_uni": [
      0.036,
      0.3075,
      0.4691,
      0.1755,
      0.0118
     ],
     "chronos_cov": [
      0.0286,
      0.2924,
      0.4901,
      0.1769,
      0.0119
     ],
     "timesfm_uni": [
      0.0724,
      0.2983,
      0.3917,
      0.1888,
      0.0488
     ],
     "timesfm_cov": [
      0.0182,
      0.1467,
      0.4002,
      0.3183,
      0.1166
     ]
    }
   }
  },
  {
   "date": "2026-05-28",
   "outcome": {
    "1": 1,
    "5": 3
   },
   "rps": {
    "1": {
     "climatology": 0.162941,
     "cond_climatology": 0.150509,
     "chronos_uni": 0.119872,
     "timesfm_uni": 0.132963,
     "chronos_cov": 0.130999,
     "timesfm_cov": 0.193182,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.132943,
     "cond_climatology": 0.175087,
     "chronos_uni": 0.178784,
     "timesfm_uni": 0.184373,
     "chronos_cov": 0.187433,
     "timesfm_cov": 0.085895,
     "all_flat": 0.249999
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.056,
      0.198,
      0.452,
      0.2193,
      0.0748
     ],
     "cond_climatology": [
      0.062,
      0.2132,
      0.4612,
      0.2054,
      0.0581
     ],
     "chronos_uni": [
      0.0357,
      0.2903,
      0.5191,
      0.1478,
      0.007
     ],
     "chronos_cov": [
      0.0314,
      0.272,
      0.5029,
      0.178,
      0.0157
     ],
     "timesfm_uni": [
      0.0757,
      0.2495,
      0.4165,
      0.1947,
      0.0636
     ],
     "timesfm_cov": [
      0.0422,
      0.1685,
      0.4174,
      0.274,
      0.098
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0579,
      0.2167,
      0.3907,
      0.233,
      0.1017
     ],
     "cond_climatology": [
      0.0814,
      0.2674,
      0.4031,
      0.1667,
      0.0814
     ],
     "chronos_uni": [
      0.0281,
      0.2851,
      0.4717,
      0.2007,
      0.0144
     ],
     "chronos_cov": [
      0.0186,
      0.2684,
      0.5297,
      0.1753,
      0.008
     ],
     "timesfm_uni": [
      0.0521,
      0.315,
      0.4065,
      0.1852,
      0.0413
     ],
     "timesfm_cov": [
      0.0165,
      0.1398,
      0.3956,
      0.3289,
      0.1192
     ]
    }
   }
  },
  {
   "date": "2026-05-29",
   "outcome": {
    "1": 2,
    "5": 3
   },
   "rps": {
    "1": {
     "climatology": 0.039945,
     "cond_climatology": 0.038345,
     "chronos_uni": 0.034537,
     "timesfm_uni": 0.044343,
     "chronos_cov": 0.031882,
     "timesfm_cov": 0.060886,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.132967,
     "cond_climatology": 0.175187,
     "chronos_uni": 0.183025,
     "timesfm_uni": 0.187735,
     "chronos_cov": 0.189672,
     "timesfm_cov": 0.066808,
     "all_flat": 0.249999
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.056,
      0.1983,
      0.4518,
      0.2192,
      0.0748
     ],
     "cond_climatology": [
      0.0618,
      0.2162,
      0.4595,
      0.2046,
      0.0579
     ],
     "chronos_uni": [
      0.037,
      0.2889,
      0.4995,
      0.1649,
      0.0096
     ],
     "chronos_cov": [
      0.0313,
      0.2627,
      0.5064,
      0.1831,
      0.0165
     ],
     "timesfm_uni": [
      0.0742,
      0.2611,
      0.4279,
      0.1788,
      0.0579
     ],
     "timesfm_cov": [
      0.0516,
      0.1564,
      0.3694,
      0.2845,
      0.1381
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0579,
      0.2166,
      0.391,
      0.2329,
      0.1016
     ],
     "cond_climatology": [
      0.0811,
      0.2664,
      0.4054,
      0.166,
      0.0811
     ],
     "chronos_uni": [
      0.0274,
      0.2938,
      0.4712,
      0.1941,
      0.0134
     ],
     "chronos_cov": [
      0.022,
      0.2743,
      0.5225,
      0.1726,
      0.0086
     ],
     "timesfm_uni": [
      0.0472,
      0.3302,
      0.4002,
      0.183,
      0.0393
     ],
     "timesfm_cov": [
      0.0149,
      0.1121,
      0.3416,
      0.3543,
      0.1773
     ]
    }
   }
  },
  {
   "date": "2026-05-30",
   "outcome": {
    "1": 4,
    "5": 3
   },
   "rps": {
    "1": {
     "climatology": 0.35562,
     "cond_climatology": 0.378436,
     "chronos_uni": 0.433989,
     "timesfm_uni": 0.385429,
     "chronos_cov": 0.437055,
     "timesfm_cov": 0.312673,
     "all_flat": 0.499999
    },
    "5": {
     "climatology": 0.133041,
     "cond_climatology": 0.175958,
     "chronos_uni": 0.187042,
     "timesfm_uni": 0.176224,
     "chronos_cov": 0.188912,
     "timesfm_cov": 0.084931,
     "all_flat": 0.249999
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.056,
      0.1982,
      0.452,
      0.2191,
      0.0747
     ],
     "cond_climatology": [
      0.0615,
      0.2154,
      0.4615,
      0.2038,
      0.0577
     ],
     "chronos_uni": [
      0.0342,
      0.2894,
      0.4867,
      0.1764,
      0.0133
     ],
     "chronos_cov": [
      0.0326,
      0.2713,
      0.5187,
      0.1664,
      0.011
     ],
     "timesfm_uni": [
      0.0367,
      0.2391,
      0.4789,
      0.1912,
      0.0541
     ],
     "timesfm_cov": [
      0.0419,
      0.1612,
      0.4264,
      0.2713,
      0.0992
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0578,
      0.2169,
      0.3908,
      0.2328,
      0.1016
     ],
     "cond_climatology": [
      0.0808,
      0.2692,
      0.4038,
      0.1654,
      0.0808
     ],
     "chronos_uni": [
      0.027,
      0.3021,
      0.4702,
      0.1875,
      0.0132
     ],
     "chronos_cov": [
      0.0207,
      0.2672,
      0.5321,
      0.172,
      0.0081
     ],
     "timesfm_uni": [
      0.0164,
      0.3055,
      0.4525,
      0.1913,
      0.0342
     ],
     "timesfm_cov": [
      0.0154,
      0.1357,
      0.3992,
      0.3326,
      0.117
     ]
    }
   }
  },
  {
   "date": "2026-06-02",
   "outcome": {
    "1": 2,
    "5": 2
   },
   "rps": {
    "1": {
     "climatology": 0.039954,
     "cond_climatology": 0.036349,
     "chronos_uni": 0.058498,
     "timesfm_uni": 0.057825,
     "chronos_cov": 0.045456,
     "timesfm_cov": 0.054068,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.050213,
     "cond_climatology": 0.04183,
     "chronos_uni": 0.053899,
     "timesfm_uni": 0.051311,
     "chronos_cov": 0.039823,
     "timesfm_cov": 0.048989,
     "all_flat": 0.0
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0559,
      0.1981,
      0.4518,
      0.2191,
      0.0751
     ],
     "cond_climatology": [
      0.0488,
      0.2021,
      0.4704,
      0.23,
      0.0488
     ],
     "chronos_uni": [
      0.1249,
      0.2973,
      0.3797,
      0.1683,
      0.0299
     ],
     "chronos_cov": [
      0.0754,
      0.2682,
      0.418,
      0.2031,
      0.0353
     ],
     "timesfm_uni": [
      0.1287,
      0.2349,
      0.3614,
      0.192,
      0.083
     ],
     "timesfm_cov": [
      0.0534,
      0.1677,
      0.3888,
      0.2791,
      0.1111
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0578,
      0.2168,
      0.391,
      0.2327,
      0.1016
     ],
     "cond_climatology": [
      0.0906,
      0.2544,
      0.4599,
      0.1498,
      0.0453
     ],
     "chronos_uni": [
      0.0794,
      0.316,
      0.3765,
      0.1975,
      0.0306
     ],
     "chronos_cov": [
      0.0391,
      0.2953,
      0.4521,
      0.1952,
      0.0183
     ],
     "timesfm_uni": [
      0.0634,
      0.294,
      0.3772,
      0.2102,
      0.0552
     ],
     "timesfm_cov": [
      0.034,
      0.1878,
      0.4062,
      0.2868,
      0.0851
     ]
    }
   }
  },
  {
   "date": "2026-06-03",
   "outcome": {
    "1": 3,
    "5": 1
   },
   "rps": {
    "1": {
     "climatology": 0.142919,
     "cond_climatology": 0.147208,
     "chronos_uni": 0.236585,
     "timesfm_uni": 0.198177,
     "chronos_cov": 0.251051,
     "timesfm_cov": 0.146733,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.162894,
     "cond_climatology": 0.119665,
     "chronos_uni": 0.102961,
     "timesfm_uni": 0.112305,
     "chronos_cov": 0.103158,
     "timesfm_cov": 0.20421,
     "all_flat": 0.249999
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0559,
      0.1981,
      0.452,
      0.219,
      0.075
     ],
     "cond_climatology": [
      0.0486,
      0.2014,
      0.4722,
      0.2292,
      0.0486
     ],
     "chronos_uni": [
      0.1209,
      0.3323,
      0.3989,
      0.1318,
      0.0161
     ],
     "chronos_cov": [
      0.1111,
      0.3558,
      0.4127,
      0.1096,
      0.0107
     ],
     "timesfm_uni": [
      0.1058,
      0.2936,
      0.3884,
      0.1751,
      0.037
     ],
     "timesfm_cov": [
      0.0488,
      0.205,
      0.4656,
      0.2282,
      0.0525
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0578,
      0.2168,
      0.3913,
      0.2327,
      0.1015
     ],
     "cond_climatology": [
      0.0903,
      0.2535,
      0.4618,
      0.1493,
      0.0451
     ],
     "chronos_uni": [
      0.0707,
      0.3264,
      0.3959,
      0.1854,
      0.0217
     ],
     "chronos_cov": [
      0.0496,
      0.3341,
      0.4424,
      0.16,
      0.0138
     ],
     "timesfm_uni": [
      0.0478,
      0.3239,
      0.4025,
      0.1911,
      0.0347
     ],
     "timesfm_cov": [
      0.0207,
      0.1672,
      0.4247,
      0.3044,
      0.083
     ]
    }
   }
  },
  {
   "date": "2026-06-04",
   "outcome": {
    "1": 2,
    "5": 0
   },
   "rps": {
    "1": {
     "climatology": 0.039949,
     "cond_climatology": 0.036329,
     "chronos_uni": 0.063321,
     "timesfm_uni": 0.0557,
     "chronos_cov": 0.048091,
     "timesfm_cov": 0.033173,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.384076,
     "cond_climatology": 0.325328,
     "chronos_uni": 0.31076,
     "timesfm_uni": 0.335124,
     "chronos_cov": 0.337075,
     "timesfm_cov": 0.446316,
     "all_flat": 0.499999
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0559,
      0.198,
      0.4519,
      0.2193,
      0.075
     ],
     "cond_climatology": [
      0.0484,
      0.2007,
      0.4706,
      0.2318,
      0.0484
     ],
     "chronos_uni": [
      0.149,
      0.3023,
      0.3843,
      0.1442,
      0.0203
     ],
     "chronos_cov": [
      0.0932,
      0.3022,
      0.4401,
      0.1482,
      0.0163
     ],
     "timesfm_uni": [
      0.1173,
      0.2586,
      0.3724,
      0.1854,
      0.0663
     ],
     "timesfm_cov": [
      0.0217,
      0.1582,
      0.508,
      0.2627,
      0.0494
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0578,
      0.2167,
      0.3911,
      0.2329,
      0.1015
     ],
     "cond_climatology": [
      0.09,
      0.2526,
      0.4602,
      0.1522,
      0.045
     ],
     "chronos_uni": [
      0.0911,
      0.3084,
      0.366,
      0.1977,
      0.0368
     ],
     "chronos_cov": [
      0.0472,
      0.3182,
      0.4407,
      0.1766,
      0.0173
     ],
     "timesfm_uni": [
      0.0716,
      0.2923,
      0.3704,
      0.2081,
      0.0576
     ],
     "timesfm_cov": [
      0.014,
      0.1623,
      0.4622,
      0.2996,
      0.0619
     ]
    }
   }
  },
  {
   "date": "2026-06-05",
   "outcome": {
    "1": 2,
    "5": 0
   },
   "rps": {
    "1": {
     "climatology": 0.03992,
     "cond_climatology": 0.036079,
     "chronos_uni": 0.081604,
     "timesfm_uni": 0.063091,
     "chronos_cov": 0.068708,
     "timesfm_cov": 0.058264,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.38416,
     "cond_climatology": 0.32613,
     "chronos_uni": 0.330502,
     "timesfm_uni": 0.335433,
     "chronos_cov": 0.33203,
     "timesfm_cov": 0.510629,
     "all_flat": 0.499999
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0559,
      0.1979,
      0.4521,
      0.2192,
      0.075
     ],
     "cond_climatology": [
      0.0483,
      0.2,
      0.4724,
      0.231,
      0.0483
     ],
     "chronos_uni": [
      0.1788,
      0.3506,
      0.3521,
      0.1059,
      0.0126
     ],
     "chronos_cov": [
      0.1268,
      0.3683,
      0.3886,
      0.104,
      0.0124
     ],
     "timesfm_uni": [
      0.1469,
      0.2753,
      0.3532,
      0.1793,
      0.0453
     ],
     "timesfm_cov": [
      0.0216,
      0.1242,
      0.4087,
      0.3317,
      0.1137
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0578,
      0.2166,
      0.391,
      0.2332,
      0.1014
     ],
     "cond_climatology": [
      0.0897,
      0.2517,
      0.4586,
      0.1552,
      0.0448
     ],
     "chronos_uni": [
      0.0681,
      0.3013,
      0.396,
      0.2046,
      0.03
     ],
     "chronos_cov": [
      0.0415,
      0.3396,
      0.4567,
      0.151,
      0.0111
     ],
     "timesfm_uni": [
      0.0612,
      0.3027,
      0.4025,
      0.1988,
      0.0348
     ],
     "timesfm_cov": [
      0.0075,
      0.0999,
      0.3965,
      0.3745,
      0.1216
     ]
    }
   }
  },
  {
   "date": "2026-06-06",
   "outcome": {
    "1": 0,
    "5": 0
   },
   "rps": {
    "1": {
     "climatology": 0.385117,
     "cond_climatology": 0.388065,
     "chronos_uni": 0.292127,
     "timesfm_uni": 0.314384,
     "chronos_cov": 0.312756,
     "timesfm_cov": 0.40681,
     "all_flat": 0.499999
    },
    "5": {
     "climatology": 0.384244,
     "cond_climatology": 0.32693,
     "chronos_uni": 0.351837,
     "timesfm_uni": 0.36087,
     "chronos_cov": 0.34876,
     "timesfm_cov": 0.422978,
     "all_flat": 0.499999
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0559,
      0.1978,
      0.4523,
      0.2191,
      0.075
     ],
     "cond_climatology": [
      0.0481,
      0.1993,
      0.4742,
      0.2302,
      0.0481
     ],
     "chronos_uni": [
      0.1047,
      0.312,
      0.421,
      0.1437,
      0.0186
     ],
     "chronos_cov": [
      0.0811,
      0.3009,
      0.4613,
      0.1425,
      0.0141
     ],
     "timesfm_uni": [
      0.113,
      0.2506,
      0.3873,
      0.1901,
      0.0591
     ],
     "timesfm_cov": [
      0.0472,
      0.1803,
      0.432,
      0.2574,
      0.083
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0577,
      0.2165,
      0.3908,
      0.2335,
      0.1014
     ],
     "cond_climatology": [
      0.0893,
      0.2509,
      0.457,
      0.1581,
      0.0447
     ],
     "chronos_uni": [
      0.047,
      0.2893,
      0.4234,
      0.2096,
      0.0307
     ],
     "chronos_cov": [
      0.0337,
      0.3092,
      0.4861,
      0.1606,
      0.0104
     ],
     "timesfm_uni": [
      0.0384,
      0.2893,
      0.4168,
      0.2179,
      0.0376
     ],
     "timesfm_cov": [
      0.0217,
      0.1903,
      0.4558,
      0.2752,
      0.0571
     ]
    }
   }
  },
  {
   "date": "2026-06-09",
   "outcome": {
    "1": 0,
    "5": 2
   },
   "rps": {
    "1": {
     "climatology": 0.384839,
     "cond_climatology": 0.359953,
     "chronos_uni": 0.377465,
     "timesfm_uni": 0.332655,
     "chronos_cov": 0.433463,
     "timesfm_cov": 0.465367,
     "all_flat": 0.499999
    },
    "5": {
     "climatology": 0.050213,
     "cond_climatology": 0.054203,
     "chronos_uni": 0.041988,
     "timesfm_uni": 0.044528,
     "chronos_cov": 0.036722,
     "timesfm_cov": 0.106,
     "all_flat": 0.0
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0562,
      0.1978,
      0.4521,
      0.219,
      0.0749
     ],
     "cond_climatology": [
      0.072,
      0.2161,
      0.4571,
      0.1717,
      0.0831
     ],
     "chronos_uni": [
      0.0345,
      0.2502,
      0.4604,
      0.2223,
      0.0325
     ],
     "chronos_cov": [
      0.0239,
      0.1744,
      0.4357,
      0.3007,
      0.0654
     ],
     "timesfm_uni": [
      0.1068,
      0.2321,
      0.3673,
      0.1966,
      0.0972
     ],
     "timesfm_cov": [
      0.0471,
      0.1344,
      0.3178,
      0.3195,
      0.1812
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0577,
      0.2165,
      0.3911,
      0.2334,
      0.1014
     ],
     "cond_climatology": [
      0.0637,
      0.2742,
      0.3601,
      0.2161,
      0.0859
     ],
     "chronos_uni": [
      0.0235,
      0.2283,
      0.4299,
      0.2664,
      0.0519
     ],
     "chronos_cov": [
      0.0111,
      0.1769,
      0.4805,
      0.2919,
      0.0396
     ],
     "timesfm_uni": [
      0.0286,
      0.2615,
      0.41,
      0.2432,
      0.0567
     ],
     "timesfm_cov": [
      0.0106,
      0.085,
      0.294,
      0.4048,
      0.2055
     ]
    }
   }
  },
  {
   "date": "2026-06-10",
   "outcome": {
    "1": 2,
    "5": 2
   },
   "rps": {
    "1": {
     "climatology": 0.039946,
     "cond_climatology": 0.040288,
     "chronos_uni": 0.038591,
     "timesfm_uni": 0.056031,
     "chronos_cov": 0.042255,
     "timesfm_cov": 0.052886,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.050226,
     "cond_climatology": 0.054371,
     "chronos_uni": 0.050111,
     "timesfm_uni": 0.046432,
     "chronos_cov": 0.036111,
     "timesfm_cov": 0.063675,
     "all_flat": 0.0
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0565,
      0.1977,
      0.4519,
      0.2189,
      0.0749
     ],
     "cond_climatology": [
      0.0746,
      0.2155,
      0.4558,
      0.1713,
      0.0829
     ],
     "chronos_uni": [
      0.0202,
      0.1977,
      0.4588,
      0.2788,
      0.0445
     ],
     "chronos_cov": [
      0.0549,
      0.2687,
      0.4316,
      0.2082,
      0.0366
     ],
     "timesfm_uni": [
      0.0955,
      0.2202,
      0.3663,
      0.199,
      0.1191
     ],
     "timesfm_cov": [
      0.0353,
      0.1528,
      0.4093,
      0.2896,
      0.1131
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0577,
      0.2167,
      0.3909,
      0.2333,
      0.1013
     ],
     "cond_climatology": [
      0.0635,
      0.2762,
      0.3591,
      0.2155,
      0.0856
     ],
     "chronos_uni": [
      0.0306,
      0.213,
      0.3925,
      0.2761,
      0.0878
     ],
     "chronos_cov": [
      0.0177,
      0.2127,
      0.4704,
      0.2601,
      0.0391
     ],
     "timesfm_uni": [
      0.0266,
      0.2438,
      0.4041,
      0.2483,
      0.0772
     ],
     "timesfm_cov": [
      0.0114,
      0.1206,
      0.3967,
      0.3483,
      0.1229
     ]
    }
   }
  },
  {
   "date": "2026-06-11",
   "outcome": {
    "1": 0,
    "5": 3
   },
   "rps": {
    "1": {
     "climatology": 0.384589,
     "cond_climatology": 0.358248,
     "chronos_uni": 0.418536,
     "timesfm_uni": 0.378928,
     "chronos_cov": 0.479087,
     "timesfm_cov": 0.449605,
     "all_flat": 0.499999
    },
    "5": {
     "climatology": 0.132983,
     "cond_climatology": 0.154492,
     "chronos_uni": 0.131746,
     "timesfm_uni": 0.132894,
     "chronos_cov": 0.070613,
     "timesfm_cov": 0.06293,
     "all_flat": 0.249999
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0565,
      0.1976,
      0.4521,
      0.2189,
      0.0749
     ],
     "cond_climatology": [
      0.0744,
      0.2149,
      0.4573,
      0.1708,
      0.0826
     ],
     "chronos_uni": [
      0.0174,
      0.1979,
      0.481,
      0.2758,
      0.0279
     ],
     "chronos_cov": [
      0.0134,
      0.1246,
      0.4213,
      0.3647,
      0.0759
     ],
     "timesfm_uni": [
      0.0685,
      0.2161,
      0.3645,
      0.2359,
      0.1149
     ],
     "timesfm_cov": [
      0.0336,
      0.1453,
      0.4019,
      0.2997,
      0.1196
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.058,
      0.2167,
      0.3908,
      0.2332,
      0.1013
     ],
     "cond_climatology": [
      0.0661,
      0.2755,
      0.3581,
      0.2149,
      0.0854
     ],
     "chronos_uni": [
      0.0341,
      0.2355,
      0.4002,
      0.2644,
      0.0657
     ],
     "chronos_cov": [
      0.0042,
      0.0918,
      0.4138,
      0.3745,
      0.1157
     ],
     "timesfm_uni": [
      0.0228,
      0.2432,
      0.4089,
      0.2547,
      0.0705
     ],
     "timesfm_cov": [
      0.0111,
      0.1024,
      0.3488,
      0.3797,
      0.158
     ]
    }
   }
  },
  {
   "date": "2026-06-12",
   "outcome": {
    "1": 3,
    "5": 3
   },
   "rps": {
    "1": {
     "climatology": 0.143129,
     "cond_climatology": 0.163975,
     "chronos_uni": 0.141502,
     "timesfm_uni": 0.138976,
     "chronos_cov": 0.083196,
     "timesfm_cov": 0.116467,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.133067,
     "cond_climatology": 0.155167,
     "chronos_uni": 0.130505,
     "timesfm_uni": 0.122958,
     "chronos_cov": 0.071735,
     "timesfm_cov": 0.066343,
     "all_flat": 0.249999
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0569,
      0.1976,
      0.452,
      0.2188,
      0.0748
     ],
     "cond_climatology": [
      0.0769,
      0.2143,
      0.456,
      0.1703,
      0.0824
     ],
     "chronos_uni": [
      0.0237,
      0.2464,
      0.4305,
      0.2578,
      0.0416
     ],
     "chronos_cov": [
      0.0124,
      0.1272,
      0.4117,
      0.3524,
      0.0963
     ],
     "timesfm_uni": [
      0.0995,
      0.2246,
      0.3264,
      0.2161,
      0.1334
     ],
     "timesfm_cov": [
      0.0316,
      0.1647,
      0.4498,
      0.2588,
      0.0953
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0584,
      0.2166,
      0.3906,
      0.2332,
      0.1013
     ],
     "cond_climatology": [
      0.0687,
      0.2747,
      0.3571,
      0.2143,
      0.0852
     ],
     "chronos_uni": [
      0.0605,
      0.2349,
      0.3539,
      0.2528,
      0.098
     ],
     "chronos_cov": [
      0.0056,
      0.1024,
      0.4022,
      0.3677,
      0.122
     ],
     "timesfm_uni": [
      0.0463,
      0.228,
      0.3592,
      0.2517,
      0.1148
     ],
     "timesfm_cov": [
      0.0107,
      0.1062,
      0.355,
      0.3581,
      0.17
     ]
    }
   }
  },
  {
   "date": "2026-06-16",
   "outcome": {
    "1": 4,
    "5": 2
   },
   "rps": {
    "1": {
     "climatology": 0.355616,
     "cond_climatology": 0.377343,
     "chronos_uni": 0.306892,
     "timesfm_uni": 0.301954,
     "chronos_cov": 0.224497,
     "timesfm_cov": 0.324452,
     "all_flat": 0.499999
    },
    "5": {
     "climatology": 0.050298,
     "cond_climatology": 0.049489,
     "chronos_uni": 0.061876,
     "timesfm_uni": 0.0564,
     "chronos_cov": 0.091803,
     "timesfm_cov": 0.085589,
     "all_flat": 0.0
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0568,
      0.1975,
      0.4518,
      0.2191,
      0.0748
     ],
     "cond_climatology": [
      0.0613,
      0.2146,
      0.4598,
      0.2069,
      0.0575
     ],
     "chronos_uni": [
      0.0113,
      0.1292,
      0.4443,
      0.3456,
      0.0696
     ],
     "chronos_cov": [
      0.0076,
      0.077,
      0.3389,
      0.42,
      0.1565
     ],
     "timesfm_uni": [
      0.0658,
      0.2032,
      0.3463,
      0.2522,
      0.1325
     ],
     "timesfm_cov": [
      0.0241,
      0.1545,
      0.4733,
      0.2648,
      0.0833
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0587,
      0.2165,
      0.3905,
      0.2331,
      0.1012
     ],
     "cond_climatology": [
      0.0843,
      0.2682,
      0.4023,
      0.1648,
      0.0805
     ],
     "chronos_uni": [
      0.0566,
      0.2171,
      0.3359,
      0.2598,
      0.1305
     ],
     "chronos_cov": [
      0.0072,
      0.0904,
      0.3387,
      0.3637,
      0.1999
     ],
     "timesfm_uni": [
      0.0517,
      0.251,
      0.3511,
      0.2392,
      0.1069
     ],
     "timesfm_cov": [
      0.0144,
      0.1149,
      0.3339,
      0.3436,
      0.1932
     ]
    }
   }
  },
  {
   "date": "2026-06-17",
   "outcome": {
    "1": 2,
    "5": 2
   },
   "rps": {
    "1": {
     "climatology": 0.040006,
     "cond_climatology": 0.03859,
     "chronos_uni": 0.047855,
     "timesfm_uni": 0.073889,
     "chronos_cov": 0.092245,
     "timesfm_cov": 0.041163,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.050261,
     "cond_climatology": 0.049112,
     "chronos_uni": 0.067345,
     "timesfm_uni": 0.067517,
     "chronos_cov": 0.092232,
     "timesfm_cov": 0.063572,
     "all_flat": 0.0
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0568,
      0.1974,
      0.4516,
      0.219,
      0.0752
     ],
     "cond_climatology": [
      0.0611,
      0.2137,
      0.458,
      0.2061,
      0.0611
     ],
     "chronos_uni": [
      0.041,
      0.2098,
      0.4015,
      0.2709,
      0.0769
     ],
     "chronos_cov": [
      0.0167,
      0.1083,
      0.3116,
      0.3744,
      0.189
     ],
     "timesfm_uni": [
      0.115,
      0.198,
      0.2901,
      0.2331,
      0.1638
     ],
     "timesfm_cov": [
      0.0463,
      0.196,
      0.4453,
      0.2336,
      0.0788
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0587,
      0.2164,
      0.3907,
      0.233,
      0.1012
     ],
     "cond_climatology": [
      0.084,
      0.2672,
      0.4046,
      0.1641,
      0.0802
     ],
     "chronos_uni": [
      0.1051,
      0.2331,
      0.3059,
      0.2244,
      0.1315
     ],
     "chronos_cov": [
      0.0186,
      0.131,
      0.3067,
      0.3184,
      0.2251
     ],
     "timesfm_uni": [
      0.1111,
      0.2496,
      0.3041,
      0.2117,
      0.1235
     ],
     "timesfm_cov": [
      0.0314,
      0.1672,
      0.3615,
      0.2972,
      0.1427
     ]
    }
   }
  },
  {
   "date": "2026-06-18",
   "outcome": {
    "1": 3,
    "5": 1
   },
   "rps": {
    "1": {
     "climatology": 0.142961,
     "cond_climatology": 0.155218,
     "chronos_uni": 0.182827,
     "timesfm_uni": 0.163929,
     "chronos_cov": 0.137106,
     "timesfm_cov": 0.121148,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.162716,
     "cond_climatology": 0.123834,
     "chronos_uni": 0.147102,
     "timesfm_uni": 0.11303,
     "chronos_cov": 0.204187,
     "timesfm_cov": 0.256889,
     "all_flat": 0.249999
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0568,
      0.1973,
      0.4518,
      0.2189,
      0.0751
     ],
     "cond_climatology": [
      0.0608,
      0.2129,
      0.4601,
      0.2053,
      0.0608
     ],
     "chronos_uni": [
      0.0855,
      0.2801,
      0.4019,
      0.1976,
      0.0348
     ],
     "chronos_cov": [
      0.0521,
      0.2216,
      0.4089,
      0.2474,
      0.07
     ],
     "timesfm_uni": [
      0.1152,
      0.2377,
      0.361,
      0.1948,
      0.0913
     ],
     "timesfm_cov": [
      0.0318,
      0.1699,
      0.4585,
      0.2556,
      0.0842
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0587,
      0.2163,
      0.3909,
      0.2329,
      0.1012
     ],
     "cond_climatology": [
      0.0837,
      0.2662,
      0.4068,
      0.1635,
      0.0798
     ],
     "chronos_uni": [
      0.1187,
      0.229,
      0.2933,
      0.2182,
      0.1409
     ],
     "chronos_cov": [
      0.029,
      0.1868,
      0.3589,
      0.2834,
      0.1419
     ],
     "timesfm_uni": [
      0.1288,
      0.2785,
      0.3138,
      0.1986,
      0.0802
     ],
     "timesfm_cov": [
      0.0185,
      0.1291,
      0.3369,
      0.3294,
      0.1862
     ]
    }
   }
  },
  {
   "date": "2026-06-19",
   "outcome": {
    "1": 1,
    "5": 1
   },
   "rps": {
    "1": {
     "climatology": 0.16298,
     "cond_climatology": 0.162777,
     "chronos_uni": 0.135424,
     "timesfm_uni": 0.132648,
     "chronos_cov": 0.127806,
     "timesfm_cov": 0.178143,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.16279,
     "cond_climatology": 0.12225,
     "chronos_uni": 0.153476,
     "timesfm_uni": 0.108506,
     "chronos_cov": 0.1409,
     "timesfm_cov": 0.245523,
     "all_flat": 0.249999
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0568,
      0.1973,
      0.4517,
      0.2192,
      0.0751
     ],
     "cond_climatology": [
      0.0479,
      0.1986,
      0.4726,
      0.2329,
      0.0479
     ],
     "chronos_uni": [
      0.073,
      0.2496,
      0.4043,
      0.2186,
      0.0545
     ],
     "chronos_cov": [
      0.068,
      0.2598,
      0.4406,
      0.1985,
      0.0331
     ],
     "timesfm_uni": [
      0.1223,
      0.2271,
      0.3629,
      0.1895,
      0.0982
     ],
     "timesfm_cov": [
      0.0292,
      0.1799,
      0.5031,
      0.2313,
      0.0565
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0587,
      0.2163,
      0.3908,
      0.2332,
      0.1011
     ],
     "cond_climatology": [
      0.089,
      0.25,
      0.4555,
      0.161,
      0.0445
     ],
     "chronos_uni": [
      0.1055,
      0.2241,
      0.3038,
      0.2292,
      0.1375
     ],
     "chronos_cov": [
      0.0598,
      0.259,
      0.3789,
      0.2344,
      0.0679
     ],
     "timesfm_uni": [
      0.1427,
      0.2787,
      0.3086,
      0.1928,
      0.0772
     ],
     "timesfm_cov": [
      0.0156,
      0.1325,
      0.3695,
      0.3289,
      0.1534
     ]
    }
   }
  },
  {
   "date": "2026-06-20",
   "outcome": {
    "1": 1,
    "5": 2
   },
   "rps": {
    "1": {
     "climatology": 0.162863,
     "cond_climatology": 0.16901,
     "chronos_uni": 0.138731,
     "timesfm_uni": 0.125223,
     "chronos_cov": 0.194056,
     "timesfm_cov": 0.185016,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.050273,
     "cond_climatology": 0.049628,
     "chronos_uni": 0.064557,
     "timesfm_uni": 0.062955,
     "chronos_cov": 0.050309,
     "timesfm_cov": 0.077873,
     "all_flat": 0.0
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0568,
      0.1976,
      0.4515,
      0.2191,
      0.0751
     ],
     "cond_climatology": [
      0.0472,
      0.1887,
      0.4717,
      0.2264,
      0.066
     ],
     "chronos_uni": [
      0.056,
      0.252,
      0.4245,
      0.2315,
      0.0361
     ],
     "chronos_cov": [
      0.0261,
      0.1748,
      0.4332,
      0.3107,
      0.0553
     ],
     "timesfm_uni": [
      0.1164,
      0.2429,
      0.3758,
      0.1825,
      0.0824
     ],
     "timesfm_cov": [
      0.0284,
      0.1722,
      0.4896,
      0.2451,
      0.0648
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0586,
      0.2162,
      0.3906,
      0.2335,
      0.1011
     ],
     "cond_climatology": [
      0.0802,
      0.1604,
      0.4009,
      0.283,
      0.0755
     ],
     "chronos_uni": [
      0.0976,
      0.2247,
      0.3178,
      0.2362,
      0.1237
     ],
     "chronos_cov": [
      0.0185,
      0.1766,
      0.4094,
      0.3156,
      0.08
     ],
     "timesfm_uni": [
      0.1176,
      0.277,
      0.3297,
      0.1965,
      0.0793
     ],
     "timesfm_cov": [
      0.0142,
      0.12,
      0.3511,
      0.3462,
      0.1685
     ]
    }
   }
  },
  {
   "date": "2026-06-23",
   "outcome": {
    "1": 3,
    "5": 3
   },
   "rps": {
    "1": {
     "climatology": 0.142997,
     "cond_climatology": 0.141606,
     "chronos_uni": 0.164443,
     "timesfm_uni": 0.171283,
     "chronos_cov": 0.074488,
     "timesfm_cov": 0.132098,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.133031,
     "cond_climatology": 0.12076,
     "chronos_uni": 0.155113,
     "timesfm_uni": 0.174264,
     "chronos_cov": 0.04838,
     "timesfm_cov": 0.076986,
     "all_flat": 0.249999
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0567,
      0.1978,
      0.4513,
      0.219,
      0.075
     ],
     "cond_climatology": [
      0.0469,
      0.1925,
      0.4695,
      0.2254,
      0.0657
     ],
     "chronos_uni": [
      0.0614,
      0.2586,
      0.422,
      0.2254,
      0.0326
     ],
     "chronos_cov": [
      0.0208,
      0.1282,
      0.3484,
      0.3355,
      0.1672
     ],
     "timesfm_uni": [
      0.1225,
      0.2442,
      0.3589,
      0.1776,
      0.0969
     ],
     "timesfm_cov": [
      0.0421,
      0.1841,
      0.4588,
      0.2358,
      0.0792
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0586,
      0.2161,
      0.3909,
      0.2334,
      0.101
     ],
     "cond_climatology": [
      0.0798,
      0.1596,
      0.4038,
      0.2817,
      0.0751
     ],
     "chronos_uni": [
      0.1105,
      0.2463,
      0.3307,
      0.2221,
      0.0904
     ],
     "chronos_cov": [
      0.0086,
      0.0695,
      0.2655,
      0.3932,
      0.2632
     ],
     "timesfm_uni": [
      0.1143,
      0.277,
      0.3329,
      0.1948,
      0.0811
     ],
     "timesfm_cov": [
      0.0179,
      0.1349,
      0.3548,
      0.3292,
      0.1632
     ]
    }
   }
  },
  {
   "date": "2026-06-24",
   "outcome": {
    "1": 1,
    "5": 2
   },
   "rps": {
    "1": {
     "climatology": 0.162816,
     "cond_climatology": 0.15215,
     "chronos_uni": 0.10775,
     "timesfm_uni": 0.127378,
     "chronos_cov": 0.137345,
     "timesfm_cov": 0.167401,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.050201,
     "cond_climatology": 0.048371,
     "chronos_uni": 0.067267,
     "timesfm_uni": 0.069058,
     "chronos_cov": 0.045587,
     "timesfm_cov": 0.069169,
     "all_flat": 0.0
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0567,
      0.1978,
      0.4512,
      0.2193,
      0.075
     ],
     "cond_climatology": [
      0.0606,
      0.2121,
      0.4583,
      0.2083,
      0.0606
     ],
     "chronos_uni": [
      0.1183,
      0.279,
      0.3747,
      0.185,
      0.043
     ],
     "chronos_cov": [
      0.0704,
      0.2466,
      0.4071,
      0.2321,
      0.0437
     ],
     "timesfm_uni": [
      0.1433,
      0.239,
      0.3143,
      0.1791,
      0.1242
     ],
     "timesfm_cov": [
      0.0423,
      0.1971,
      0.4696,
      0.2228,
      0.0682
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0586,
      0.216,
      0.3911,
      0.2333,
      0.101
     ],
     "cond_climatology": [
      0.0833,
      0.2652,
      0.4091,
      0.1629,
      0.0795
     ],
     "chronos_uni": [
      0.14,
      0.2683,
      0.3136,
      0.2045,
      0.0736
     ],
     "chronos_cov": [
      0.0484,
      0.2777,
      0.4059,
      0.2254,
      0.0426
     ],
     "timesfm_uni": [
      0.1344,
      0.2544,
      0.3039,
      0.1953,
      0.1121
     ],
     "timesfm_cov": [
      0.0141,
      0.1286,
      0.3743,
      0.3317,
      0.1512
     ]
    }
   }
  },
  {
   "date": "2026-06-25",
   "outcome": {
    "1": 1,
    "5": 3
   },
   "rps": {
    "1": {
     "climatology": 0.162699,
     "cond_climatology": 0.151004,
     "chronos_uni": 0.108247,
     "timesfm_uni": 0.128285,
     "chronos_cov": 0.153896,
     "timesfm_cov": 0.192127,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.133128,
     "cond_climatology": 0.17791,
     "chronos_uni": 0.17368,
     "timesfm_uni": 0.15997,
     "chronos_cov": 0.150649,
     "timesfm_cov": 0.05697,
     "all_flat": 0.249999
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0567,
      0.1981,
      0.451,
      0.2192,
      0.075
     ],
     "cond_climatology": [
      0.0604,
      0.2151,
      0.4566,
      0.2075,
      0.0604
     ],
     "chronos_uni": [
      0.0963,
      0.2922,
      0.3906,
      0.1901,
      0.0308
     ],
     "chronos_cov": [
      0.0587,
      0.2259,
      0.4046,
      0.2497,
      0.0611
     ],
     "timesfm_uni": [
      0.1181,
      0.2467,
      0.3442,
      0.1855,
      0.1054
     ],
     "timesfm_cov": [
      0.0471,
      0.1677,
      0.4145,
      0.2598,
      0.111
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0586,
      0.2163,
      0.3909,
      0.2332,
      0.101
     ],
     "cond_climatology": [
      0.083,
      0.2679,
      0.4075,
      0.1623,
      0.0792
     ],
     "chronos_uni": [
      0.1238,
      0.2701,
      0.3269,
      0.2114,
      0.0677
     ],
     "chronos_cov": [
      0.0442,
      0.2505,
      0.4205,
      0.2377,
      0.0471
     ],
     "timesfm_uni": [
      0.1094,
      0.2564,
      0.329,
      0.1986,
      0.1066
     ],
     "timesfm_cov": [
      0.0129,
      0.0965,
      0.2988,
      0.3702,
      0.2215
     ]
    }
   }
  },
  {
   "date": "2026-06-26",
   "outcome": {
    "1": 3,
    "5": 3
   },
   "rps": {
    "1": {
     "climatology": 0.143034,
     "cond_climatology": 0.15551,
     "chronos_uni": 0.182297,
     "timesfm_uni": 0.151811,
     "chronos_cov": 0.200779,
     "timesfm_cov": 0.135149,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.133202,
     "cond_climatology": 0.17866,
     "chronos_uni": 0.175467,
     "timesfm_uni": 0.149266,
     "chronos_cov": 0.202835,
     "timesfm_cov": 0.068178,
     "all_flat": 0.249999
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0567,
      0.1984,
      0.4509,
      0.2192,
      0.075
     ],
     "cond_climatology": [
      0.0602,
      0.218,
      0.4549,
      0.2068,
      0.0602
     ],
     "chronos_uni": [
      0.0768,
      0.2851,
      0.4073,
      0.2012,
      0.0297
     ],
     "chronos_cov": [
      0.0983,
      0.3066,
      0.3881,
      0.1799,
      0.0271
     ],
     "timesfm_uni": [
      0.1052,
      0.2187,
      0.3683,
      0.197,
      0.1108
     ],
     "timesfm_cov": [
      0.0433,
      0.1866,
      0.4635,
      0.2351,
      0.0715
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0585,
      0.2166,
      0.3908,
      0.2331,
      0.1009
     ],
     "cond_climatology": [
      0.0827,
      0.2707,
      0.406,
      0.1617,
      0.0789
     ],
     "chronos_uni": [
      0.1194,
      0.2728,
      0.3358,
      0.2104,
      0.0616
     ],
     "chronos_cov": [
      0.0829,
      0.3285,
      0.385,
      0.1741,
      0.0294
     ],
     "timesfm_uni": [
      0.0955,
      0.2463,
      0.3354,
      0.2111,
      0.1117
     ],
     "timesfm_cov": [
      0.0138,
      0.1166,
      0.3455,
      0.3538,
      0.1702
     ]
    }
   }
  },
  {
   "date": "2026-06-27",
   "outcome": {
    "1": 3,
    "5": 3
   },
   "rps": {
    "1": {
     "climatology": 0.142932,
     "cond_climatology": 0.163078,
     "chronos_uni": 0.179871,
     "timesfm_uni": 0.159936,
     "chronos_cov": 0.051722,
     "timesfm_cov": 0.114427,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.133226,
     "cond_climatology": 0.155277,
     "chronos_uni": 0.184347,
     "timesfm_uni": 0.166284,
     "chronos_cov": 0.166413,
     "timesfm_cov": 0.055513,
     "all_flat": 0.249999
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0567,
      0.1983,
      0.4507,
      0.2194,
      0.0749
     ],
     "cond_climatology": [
      0.0767,
      0.2137,
      0.4548,
      0.1726,
      0.0822
     ],
     "chronos_uni": [
      0.0876,
      0.27,
      0.4055,
      0.1982,
      0.0386
     ],
     "chronos_cov": [
      0.0106,
      0.0757,
      0.2505,
      0.3701,
      0.2932
     ],
     "timesfm_uni": [
      0.122,
      0.2246,
      0.356,
      0.1927,
      0.1046
     ],
     "timesfm_cov": [
      0.0432,
      0.1671,
      0.4234,
      0.2662,
      0.1001
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0585,
      0.2165,
      0.391,
      0.233,
      0.1009
     ],
     "cond_climatology": [
      0.0685,
      0.274,
      0.3589,
      0.2137,
      0.0849
     ],
     "chronos_uni": [
      0.1285,
      0.2811,
      0.3319,
      0.2013,
      0.0572
     ],
     "chronos_cov": [
      0.0485,
      0.284,
      0.4099,
      0.2175,
      0.0402
     ],
     "timesfm_uni": [
      0.1172,
      0.2553,
      0.3376,
      0.1978,
      0.0922
     ],
     "timesfm_cov": [
      0.011,
      0.0948,
      0.3107,
      0.3904,
      0.1931
     ]
    }
   }
  },
  {
   "date": "2026-06-30",
   "outcome": {
    "1": 2,
    "5": 3
   },
   "rps": {
    "1": {
     "climatology": 0.040141,
     "cond_climatology": 0.039179,
     "chronos_uni": 0.070428,
     "timesfm_uni": 0.078639,
     "chronos_cov": 0.172364,
     "timesfm_cov": 0.037065,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.13313,
     "cond_climatology": 0.177324,
     "chronos_uni": 0.225334,
     "timesfm_uni": 0.202325,
     "chronos_cov": 0.30137,
     "timesfm_cov": 0.079489,
     "all_flat": 0.249999
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0566,
      0.1982,
      0.4505,
      0.2197,
      0.0749
     ],
     "cond_climatology": [
      0.0599,
      0.2172,
      0.4532,
      0.2097,
      0.0599
     ],
     "chronos_uni": [
      0.1705,
      0.2967,
      0.3499,
      0.1524,
      0.0305
     ],
     "chronos_cov": [
      0.3446,
      0.4099,
      0.209,
      0.033,
      0.0035
     ],
     "timesfm_uni": [
      0.1992,
      0.2629,
      0.3017,
      0.1616,
      0.0745
     ],
     "timesfm_cov": [
      0.0458,
      0.196,
      0.4675,
      0.2342,
      0.0565
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0585,
      0.2164,
      0.3909,
      0.2333,
      0.1009
     ],
     "cond_climatology": [
      0.0824,
      0.2697,
      0.4045,
      0.1648,
      0.0787
     ],
     "chronos_uni": [
      0.1809,
      0.3036,
      0.3105,
      0.1651,
      0.0398
     ],
     "chronos_cov": [
      0.1795,
      0.4046,
      0.328,
      0.0808,
      0.0071
     ],
     "timesfm_uni": [
      0.1762,
      0.2696,
      0.3129,
      0.1786,
      0.0628
     ],
     "timesfm_cov": [
      0.0126,
      0.125,
      0.3976,
      0.3534,
      0.1114
     ]
    }
   }
  },
  {
   "date": "2026-07-01",
   "outcome": {
    "1": 2,
    "5": 2
   },
   "rps": {
    "1": {
     "climatology": 0.040112,
     "cond_climatology": 0.040254,
     "chronos_uni": 0.053804,
     "timesfm_uni": 0.075383,
     "chronos_cov": 0.091333,
     "timesfm_cov": 0.041765,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.050179,
     "cond_climatology": 0.054294,
     "chronos_uni": 0.058329,
     "timesfm_uni": 0.06615,
     "chronos_cov": 0.082222,
     "timesfm_cov": 0.063347,
     "all_flat": 0.0
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0566,
      0.1981,
      0.4507,
      0.2196,
      0.0749
     ],
     "cond_climatology": [
      0.0765,
      0.2131,
      0.4563,
      0.1721,
      0.082
     ],
     "chronos_uni": [
      0.1104,
      0.2849,
      0.3916,
      0.1761,
      0.037
     ],
     "chronos_cov": [
      0.1864,
      0.3763,
      0.3199,
      0.1027,
      0.0147
     ],
     "timesfm_uni": [
      0.1813,
      0.2872,
      0.3186,
      0.1505,
      0.0624
     ],
     "timesfm_cov": [
      0.0312,
      0.1629,
      0.4568,
      0.2682,
      0.0809
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0585,
      0.2164,
      0.3911,
      0.2332,
      0.1008
     ],
     "cond_climatology": [
      0.0683,
      0.2732,
      0.3607,
      0.2131,
      0.0847
     ],
     "chronos_uni": [
      0.1079,
      0.2856,
      0.3526,
      0.2051,
      0.0487
     ],
     "chronos_cov": [
      0.1425,
      0.4028,
      0.3491,
      0.0972,
      0.0084
     ],
     "timesfm_uni": [
      0.151,
      0.2735,
      0.3337,
      0.1862,
      0.0555
     ],
     "timesfm_cov": [
      0.0097,
      0.1175,
      0.4005,
      0.3541,
      0.1183
     ]
    }
   }
  },
  {
   "date": "2026-07-02",
   "outcome": {
    "1": 3,
    "5": 2
   },
   "rps": {
    "1": {
     "climatology": 0.142877,
     "cond_climatology": 0.163332,
     "chronos_uni": 0.166132,
     "timesfm_uni": 0.182309,
     "chronos_cov": 0.247274,
     "timesfm_cov": 0.10508,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.050203,
     "cond_climatology": 0.054405,
     "chronos_uni": 0.052798,
     "timesfm_uni": 0.064332,
     "chronos_cov": 0.072703,
     "timesfm_cov": 0.075167,
     "all_flat": 0.0
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0566,
      0.1981,
      0.4509,
      0.2196,
      0.0749
     ],
     "cond_climatology": [
      0.0763,
      0.2125,
      0.4578,
      0.1717,
      0.0817
     ],
     "chronos_uni": [
      0.0702,
      0.2588,
      0.4118,
      0.2105,
      0.0486
     ],
     "chronos_cov": [
      0.1302,
      0.3435,
      0.3908,
      0.1213,
      0.0142
     ],
     "timesfm_uni": [
      0.1572,
      0.2555,
      0.3124,
      0.1827,
      0.0923
     ],
     "timesfm_cov": [
      0.0289,
      0.1564,
      0.4258,
      0.2806,
      0.1083
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0585,
      0.2163,
      0.391,
      0.2335,
      0.1008
     ],
     "cond_climatology": [
      0.0681,
      0.2725,
      0.3597,
      0.2153,
      0.0845
     ],
     "chronos_uni": [
      0.0771,
      0.2772,
      0.3688,
      0.2214,
      0.0554
     ],
     "chronos_cov": [
      0.1122,
      0.4041,
      0.376,
      0.1,
      0.0077
     ],
     "timesfm_uni": [
      0.1407,
      0.2661,
      0.3327,
      0.1955,
      0.065
     ],
     "timesfm_cov": [
      0.0063,
      0.0922,
      0.3808,
      0.3801,
      0.1406
     ]
    }
   }
  },
  {
   "date": "2026-07-03",
   "outcome": {
    "1": 2,
    "5": 1
   },
   "rps": {
    "1": {
     "climatology": 0.040108,
     "cond_climatology": 0.039391,
     "chronos_uni": 0.046795,
     "timesfm_uni": 0.074688,
     "chronos_cov": 0.06294,
     "timesfm_cov": 0.03321,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.162902,
     "cond_climatology": 0.123764,
     "chronos_uni": 0.127454,
     "timesfm_uni": 0.11311,
     "chronos_cov": 0.112054,
     "timesfm_cov": 0.233516,
     "all_flat": 0.249999
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0566,
      0.198,
      0.4508,
      0.2198,
      0.0748
     ],
     "cond_climatology": [
      0.0597,
      0.2164,
      0.4515,
      0.2127,
      0.0597
     ],
     "chronos_uni": [
      0.0736,
      0.2573,
      0.4056,
      0.2104,
      0.0531
     ],
     "chronos_cov": [
      0.1381,
      0.3155,
      0.3838,
      0.1404,
      0.0222
     ],
     "timesfm_uni": [
      0.1809,
      0.2437,
      0.2974,
      0.1862,
      0.092
     ],
     "timesfm_cov": [
      0.0207,
      0.1622,
      0.5075,
      0.2535,
      0.056
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0584,
      0.2162,
      0.3908,
      0.2338,
      0.1008
     ],
     "cond_climatology": [
      0.0821,
      0.2687,
      0.403,
      0.1679,
      0.0784
     ],
     "chronos_uni": [
      0.0796,
      0.2749,
      0.3585,
      0.2204,
      0.0666
     ],
     "chronos_cov": [
      0.0649,
      0.3033,
      0.4214,
      0.1866,
      0.0238
     ],
     "timesfm_uni": [
      0.1506,
      0.2531,
      0.3328,
      0.1936,
      0.0698
     ],
     "timesfm_cov": [
      0.006,
      0.118,
      0.4737,
      0.333,
      0.0693
     ]
    }
   }
  },
  {
   "date": "2026-07-04",
   "outcome": {
    "1": 3,
    "5": 2
   },
   "rps": {
    "1": {
     "climatology": 0.142799,
     "cond_climatology": 0.153411,
     "chronos_uni": 0.166431,
     "timesfm_uni": 0.193394,
     "chronos_cov": 0.27878,
     "timesfm_cov": 0.133836,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.050251,
     "cond_climatology": 0.049232,
     "chronos_uni": 0.049752,
     "timesfm_uni": 0.060458,
     "chronos_cov": 0.052508,
     "timesfm_cov": 0.035896,
     "all_flat": 0.0
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0565,
      0.1979,
      0.451,
      0.2198,
      0.0748
     ],
     "cond_climatology": [
      0.0595,
      0.2156,
      0.4535,
      0.2119,
      0.0595
     ],
     "chronos_uni": [
      0.0536,
      0.2589,
      0.4382,
      0.2109,
      0.0383
     ],
     "chronos_cov": [
      0.1746,
      0.3703,
      0.3425,
      0.101,
      0.0115
     ],
     "timesfm_uni": [
      0.1827,
      0.2552,
      0.2988,
      0.1888,
      0.0744
     ],
     "timesfm_cov": [
      0.023,
      0.1669,
      0.5148,
      0.2482,
      0.0471
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0584,
      0.2161,
      0.3907,
      0.2341,
      0.1007
     ],
     "cond_climatology": [
      0.0818,
      0.2677,
      0.4015,
      0.171,
      0.0781
     ],
     "chronos_uni": [
      0.0591,
      0.2723,
      0.3811,
      0.2324,
      0.055
     ],
     "chronos_cov": [
      0.0756,
      0.339,
      0.4062,
      0.1617,
      0.0175
     ],
     "timesfm_uni": [
      0.1307,
      0.2556,
      0.346,
      0.2055,
      0.0622
     ],
     "timesfm_cov": [
      0.0067,
      0.1375,
      0.5083,
      0.3024,
      0.045
     ]
    }
   }
  },
  {
   "date": "2026-07-07",
   "outcome": {
    "1": 0,
    "5": 1
   },
   "rps": {
    "1": {
     "climatology": 0.384647,
     "cond_climatology": 0.389542,
     "chronos_uni": 0.342177,
     "timesfm_uni": 0.278293,
     "chronos_cov": 0.236865,
     "timesfm_cov": 0.433198,
     "all_flat": 0.499999
    },
    "5": {
     "climatology": 0.163048,
     "cond_climatology": 0.122896,
     "chronos_uni": 0.127726,
     "timesfm_uni": 0.1225,
     "chronos_cov": 0.075145,
     "timesfm_cov": 0.219957,
     "all_flat": 0.249999
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0565,
      0.1979,
      0.4508,
      0.22,
      0.0748
     ],
     "cond_climatology": [
      0.0478,
      0.198,
      0.471,
      0.2355,
      0.0478
     ],
     "chronos_uni": [
      0.0837,
      0.2508,
      0.3787,
      0.2227,
      0.064
     ],
     "chronos_cov": [
      0.1733,
      0.3345,
      0.3469,
      0.122,
      0.0233
     ],
     "timesfm_uni": [
      0.1851,
      0.2257,
      0.2874,
      0.1983,
      0.1036
     ],
     "timesfm_cov": [
      0.0187,
      0.1597,
      0.517,
      0.2585,
      0.0461
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0584,
      0.2161,
      0.3905,
      0.2343,
      0.1007
     ],
     "cond_climatology": [
      0.0887,
      0.2491,
      0.4539,
      0.1638,
      0.0444
     ],
     "chronos_uni": [
      0.0696,
      0.2834,
      0.3589,
      0.2221,
      0.066
     ],
     "chronos_cov": [
      0.1231,
      0.3673,
      0.3504,
      0.139,
      0.0201
     ],
     "timesfm_uni": [
      0.1536,
      0.2341,
      0.3219,
      0.2051,
      0.0852
     ],
     "timesfm_cov": [
      0.0045,
      0.1206,
      0.5385,
      0.3031,
      0.0334
     ]
    }
   }
  },
  {
   "date": "2026-07-08",
   "outcome": {
    "1": 2,
    "5": 2
   },
   "rps": {
    "1": {
     "climatology": 0.04013,
     "cond_climatology": 0.036556,
     "chronos_uni": 0.048918,
     "timesfm_uni": 0.067241,
     "chronos_cov": 0.066888,
     "timesfm_cov": 0.033483,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.050239,
     "cond_climatology": 0.041554,
     "chronos_uni": 0.050193,
     "timesfm_uni": 0.061173,
     "chronos_cov": 0.056641,
     "timesfm_cov": 0.035946,
     "all_flat": 0.0
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0569,
      0.1978,
      0.4506,
      0.22,
      0.0747
     ],
     "cond_climatology": [
      0.051,
      0.1973,
      0.4694,
      0.2347,
      0.0476
     ],
     "chronos_uni": [
      0.0309,
      0.1961,
      0.4059,
      0.2752,
      0.0919
     ],
     "chronos_cov": [
      0.1336,
      0.3402,
      0.3686,
      0.1379,
      0.0198
     ],
     "timesfm_uni": [
      0.143,
      0.2324,
      0.3125,
      0.2111,
      0.1009
     ],
     "timesfm_cov": [
      0.0198,
      0.1593,
      0.5065,
      0.2634,
      0.051
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0584,
      0.216,
      0.3908,
      0.2342,
      0.1006
     ],
     "cond_climatology": [
      0.0884,
      0.2483,
      0.4558,
      0.1633,
      0.0442
     ],
     "chronos_uni": [
      0.0403,
      0.2338,
      0.3826,
      0.2644,
      0.0788
     ],
     "chronos_cov": [
      0.0761,
      0.3626,
      0.3939,
      0.1502,
      0.0173
     ],
     "timesfm_uni": [
      0.115,
      0.2375,
      0.3325,
      0.2258,
      0.0893
     ],
     "timesfm_cov": [
      0.0052,
      0.122,
      0.518,
      0.3131,
      0.0417
     ]
    }
   }
  },
  {
   "date": "2026-07-09",
   "outcome": {
    "1": 0,
    "5": 2
   },
   "rps": {
    "1": {
     "climatology": 0.384399,
     "cond_climatology": 0.387156,
     "chronos_uni": 0.423442,
     "timesfm_uni": 0.331618,
     "chronos_cov": 0.348718,
     "timesfm_cov": 0.453667,
     "all_flat": 0.499999
    },
    "5": {
     "climatology": 0.050203,
     "cond_climatology": 0.041273,
     "chronos_uni": 0.049146,
     "timesfm_uni": 0.063189,
     "chronos_cov": 0.043968,
     "timesfm_cov": 0.037378,
     "all_flat": 0.0
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0568,
      0.1977,
      0.4508,
      0.2199,
      0.0747
     ],
     "cond_climatology": [
      0.0508,
      0.1966,
      0.4712,
      0.2339,
      0.0475
     ],
     "chronos_uni": [
      0.0305,
      0.1945,
      0.3964,
      0.2778,
      0.1007
     ],
     "chronos_cov": [
      0.0755,
      0.2446,
      0.4058,
      0.2219,
      0.0522
     ],
     "timesfm_uni": [
      0.1212,
      0.2198,
      0.3313,
      0.2157,
      0.112
     ],
     "timesfm_cov": [
      0.0183,
      0.1368,
      0.4792,
      0.3071,
      0.0586
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0584,
      0.2159,
      0.391,
      0.2342,
      0.1006
     ],
     "cond_climatology": [
      0.0881,
      0.2475,
      0.4576,
      0.1627,
      0.0441
     ],
     "chronos_uni": [
      0.038,
      0.2447,
      0.3861,
      0.257,
      0.0742
     ],
     "chronos_cov": [
      0.0428,
      0.302,
      0.4223,
      0.2025,
      0.0305
     ],
     "timesfm_uni": [
      0.1025,
      0.2398,
      0.3204,
      0.231,
      0.1064
     ],
     "timesfm_cov": [
      0.0051,
      0.1157,
      0.5138,
      0.328,
      0.0374
     ]
    }
   }
  },
  {
   "date": "2026-07-10",
   "outcome": {
    "1": 3,
    "5": 3
   },
   "rps": {
    "1": {
     "climatology": 0.14288,
     "cond_climatology": 0.12252,
     "chronos_uni": 0.116392,
     "timesfm_uni": 0.155983,
     "chronos_cov": 0.160673,
     "timesfm_cov": 0.108904,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.132894,
     "cond_climatology": 0.11207,
     "chronos_uni": 0.131449,
     "timesfm_uni": 0.131437,
     "chronos_cov": 0.1594,
     "timesfm_cov": 0.083937,
     "all_flat": 0.249999
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0572,
      0.1976,
      0.4507,
      0.2198,
      0.0747
     ],
     "cond_climatology": [
      0.0383,
      0.1722,
      0.4522,
      0.2656,
      0.0718
     ],
     "chronos_uni": [
      0.0297,
      0.2072,
      0.3965,
      0.2807,
      0.0859
     ],
     "chronos_cov": [
      0.0622,
      0.2525,
      0.4188,
      0.2246,
      0.0419
     ],
     "timesfm_uni": [
      0.1137,
      0.2519,
      0.317,
      0.2109,
      0.1065
     ],
     "timesfm_cov": [
      0.0301,
      0.154,
      0.4437,
      0.2899,
      0.0824
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0583,
      0.2162,
      0.3908,
      0.2341,
      0.1006
     ],
     "cond_climatology": [
      0.0526,
      0.1818,
      0.3852,
      0.299,
      0.0813
     ],
     "chronos_uni": [
      0.0514,
      0.2371,
      0.3688,
      0.2537,
      0.089
     ],
     "chronos_cov": [
      0.0261,
      0.2629,
      0.4542,
      0.2244,
      0.0324
     ],
     "timesfm_uni": [
      0.0761,
      0.2382,
      0.324,
      0.2443,
      0.1174
     ],
     "timesfm_cov": [
      0.0084,
      0.1161,
      0.4358,
      0.3608,
      0.079
     ]
    }
   }
  },
  {
   "date": "2026-07-11",
   "outcome": {
    "1": 2,
    "5": 2
   },
   "rps": {
    "1": {
     "climatology": 0.040152,
     "cond_climatology": 0.03654,
     "chronos_uni": 0.048633,
     "timesfm_uni": 0.064436,
     "chronos_cov": 0.047841,
     "timesfm_cov": 0.033527,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.05018,
     "cond_climatology": 0.040994,
     "chronos_uni": 0.052301,
     "timesfm_uni": 0.06767,
     "chronos_cov": 0.043836,
     "timesfm_cov": 0.038996,
     "all_flat": 0.0
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0572,
      0.1976,
      0.4505,
      0.2201,
      0.0747
     ],
     "cond_climatology": [
      0.0507,
      0.1959,
      0.4696,
      0.2365,
      0.0473
     ],
     "chronos_uni": [
      0.0757,
      0.2783,
      0.3984,
      0.2007,
      0.0469
     ],
     "chronos_cov": [
      0.0846,
      0.2575,
      0.4031,
      0.207,
      0.0478
     ],
     "timesfm_uni": [
      0.1207,
      0.2181,
      0.323,
      0.2199,
      0.1183
     ],
     "timesfm_cov": [
      0.0199,
      0.1447,
      0.5119,
      0.279,
      0.0445
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0583,
      0.2161,
      0.3911,
      0.234,
      0.1005
     ],
     "cond_climatology": [
      0.0878,
      0.2466,
      0.4595,
      0.1622,
      0.0439
     ],
     "chronos_uni": [
      0.064,
      0.2837,
      0.368,
      0.2258,
      0.0585
     ],
     "chronos_cov": [
      0.0349,
      0.2728,
      0.4144,
      0.2309,
      0.0469
     ],
     "timesfm_uni": [
      0.1038,
      0.2307,
      0.3029,
      0.234,
      0.1286
     ],
     "timesfm_cov": [
      0.008,
      0.1288,
      0.4954,
      0.324,
      0.0438
     ]
    }
   }
  },
  {
   "date": "2026-07-14",
   "outcome": {
    "1": 2,
    "5": 2
   },
   "rps": {
    "1": {
     "climatology": 0.040124,
     "cond_climatology": 0.036294,
     "chronos_uni": 0.039967,
     "timesfm_uni": 0.054785,
     "chronos_cov": 0.039339,
     "timesfm_cov": 0.024644,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.050194,
     "cond_climatology": 0.041283,
     "chronos_uni": 0.047884,
     "timesfm_uni": 0.0595,
     "chronos_cov": 0.035243,
     "timesfm_cov": 0.034696,
     "all_flat": 0.0
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0571,
      0.1975,
      0.4507,
      0.22,
      0.0746
     ],
     "cond_climatology": [
      0.0505,
      0.1953,
      0.4714,
      0.2357,
      0.0471
     ],
     "chronos_uni": [
      0.0435,
      0.2657,
      0.443,
      0.2164,
      0.0313
     ],
     "chronos_cov": [
      0.0409,
      0.227,
      0.4458,
      0.2419,
      0.0443
     ],
     "timesfm_uni": [
      0.0992,
      0.2231,
      0.3622,
      0.2391,
      0.0765
     ],
     "timesfm_cov": [
      0.0157,
      0.1673,
      0.5641,
      0.2229,
      0.0299
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0583,
      0.2164,
      0.3909,
      0.2339,
      0.1005
     ],
     "cond_climatology": [
      0.0875,
      0.2492,
      0.4579,
      0.1616,
      0.0438
     ],
     "chronos_uni": [
      0.0491,
      0.2646,
      0.3902,
      0.241,
      0.0551
     ],
     "chronos_cov": [
      0.0194,
      0.2276,
      0.4726,
      0.2493,
      0.0311
     ],
     "timesfm_uni": [
      0.0779,
      0.2373,
      0.335,
      0.2485,
      0.1013
     ],
     "timesfm_cov": [
      0.0057,
      0.1306,
      0.5193,
      0.3042,
      0.0401
     ]
    }
   }
  },
  {
   "date": "2026-07-15",
   "outcome": {
    "1": 3,
    "5": 2
   },
   "rps": {
    "1": {
     "climatology": 0.142826,
     "cond_climatology": 0.145112,
     "chronos_uni": 0.166473,
     "timesfm_uni": 0.146511,
     "chronos_cov": 0.129891,
     "timesfm_cov": 0.148824,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.050158,
     "cond_climatology": 0.041006,
     "chronos_uni": 0.046437,
     "timesfm_uni": 0.057961,
     "chronos_cov": 0.037779,
     "timesfm_cov": 0.034074,
     "all_flat": 0.0
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0571,
      0.1974,
      0.4509,
      0.2199,
      0.0746
     ],
     "cond_climatology": [
      0.0503,
      0.1946,
      0.4732,
      0.2349,
      0.047
     ],
     "chronos_uni": [
      0.0446,
      0.2639,
      0.4451,
      0.217,
      0.0295
     ],
     "chronos_cov": [
      0.0368,
      0.2044,
      0.4344,
      0.2648,
      0.0596
     ],
     "timesfm_uni": [
      0.0891,
      0.2302,
      0.3668,
      0.2397,
      0.0743
     ],
     "timesfm_cov": [
      0.0141,
      0.1611,
      0.5757,
      0.2225,
      0.0267
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0583,
      0.2163,
      0.3911,
      0.2338,
      0.1005
     ],
     "cond_climatology": [
      0.0872,
      0.2483,
      0.4597,
      0.1611,
      0.0436
     ],
     "chronos_uni": [
      0.043,
      0.2573,
      0.3984,
      0.2469,
      0.0544
     ],
     "chronos_cov": [
      0.0132,
      0.1729,
      0.4753,
      0.2984,
      0.0403
     ],
     "timesfm_uni": [
      0.0707,
      0.2422,
      0.3411,
      0.25,
      0.096
     ],
     "timesfm_cov": [
      0.005,
      0.1233,
      0.5275,
      0.307,
      0.0372
     ]
    }
   }
  },
  {
   "date": "2026-07-16",
   "outcome": {
    "1": 2,
    "5": 2
   },
   "rps": {
    "1": {
     "climatology": 0.040119,
     "cond_climatology": 0.036283,
     "chronos_uni": 0.044189,
     "timesfm_uni": 0.054258,
     "chronos_cov": 0.043046,
     "timesfm_cov": 0.018935,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.050122,
     "cond_climatology": 0.040732,
     "chronos_uni": 0.047697,
     "timesfm_uni": 0.057332,
     "chronos_cov": 0.035199,
     "timesfm_cov": 0.026157,
     "all_flat": 0.0
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0571,
      0.1974,
      0.4507,
      0.2202,
      0.0746
     ],
     "cond_climatology": [
      0.0502,
      0.194,
      0.4716,
      0.2375,
      0.0468
     ],
     "chronos_uni": [
      0.06,
      0.2697,
      0.4202,
      0.2062,
      0.0438
     ],
     "chronos_cov": [
      0.043,
      0.2254,
      0.424,
      0.2467,
      0.0609
     ],
     "timesfm_uni": [
      0.0962,
      0.2353,
      0.3657,
      0.2238,
      0.0789
     ],
     "timesfm_cov": [
      0.0092,
      0.1529,
      0.6164,
      0.2043,
      0.0173
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0583,
      0.2162,
      0.3914,
      0.2337,
      0.1004
     ],
     "cond_climatology": [
      0.087,
      0.2475,
      0.4615,
      0.1605,
      0.0435
     ],
     "chronos_uni": [
      0.0479,
      0.2624,
      0.3913,
      0.2419,
      0.0564
     ],
     "chronos_cov": [
      0.0206,
      0.2219,
      0.4738,
      0.2508,
      0.0329
     ],
     "timesfm_uni": [
      0.0775,
      0.2463,
      0.3458,
      0.234,
      0.0963
     ],
     "timesfm_cov": [
      0.0038,
      0.127,
      0.5743,
      0.2722,
      0.0227
     ]
    }
   }
  },
  {
   "date": "2026-07-17",
   "outcome": {
    "1": 1,
    "5": 3
   },
   "rps": {
    "1": {
     "climatology": 0.162905,
     "cond_climatology": 0.151773,
     "chronos_uni": 0.157611,
     "timesfm_uni": 0.131504,
     "chronos_cov": 0.184966,
     "timesfm_cov": 0.192972,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.132943,
     "cond_climatology": 0.173405,
     "chronos_uni": 0.135808,
     "timesfm_uni": 0.144692,
     "chronos_cov": 0.12275,
     "timesfm_cov": 0.095469,
     "all_flat": 0.249999
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0571,
      0.1973,
      0.4509,
      0.2201,
      0.0746
     ],
     "cond_climatology": [
      0.0593,
      0.2148,
      0.4556,
      0.2111,
      0.0593
     ],
     "chronos_uni": [
      0.0448,
      0.2293,
      0.4145,
      0.2445,
      0.0669
     ],
     "chronos_cov": [
      0.0353,
      0.1915,
      0.4068,
      0.2844,
      0.082
     ],
     "timesfm_uni": [
      0.112,
      0.233,
      0.37,
      0.2279,
      0.0571
     ],
     "timesfm_cov": [
      0.0163,
      0.1534,
      0.5457,
      0.2501,
      0.0345
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0582,
      0.2161,
      0.3912,
      0.234,
      0.1004
     ],
     "cond_climatology": [
      0.0815,
      0.2667,
      0.4,
      0.1741,
      0.0778
     ],
     "chronos_uni": [
      0.0425,
      0.2439,
      0.3879,
      0.2566,
      0.0691
     ],
     "chronos_cov": [
      0.0154,
      0.1859,
      0.4683,
      0.2877,
      0.0426
     ],
     "timesfm_uni": [
      0.085,
      0.2362,
      0.3583,
      0.2379,
      0.0827
     ],
     "timesfm_cov": [
      0.0048,
      0.1053,
      0.4963,
      0.348,
      0.0456
     ]
    }
   }
  },
  {
   "date": "2026-07-18",
   "outcome": {
    "1": 2,
    "5": 2
   },
   "rps": {
    "1": {
     "climatology": 0.040107,
     "cond_climatology": 0.039031,
     "chronos_uni": 0.043474,
     "timesfm_uni": 0.045516,
     "chronos_cov": 0.039355,
     "timesfm_cov": 0.027266,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.05011,
     "cond_climatology": 0.048968,
     "chronos_uni": 0.047021,
     "timesfm_uni": 0.050142,
     "chronos_cov": 0.032459,
     "timesfm_cov": 0.041067,
     "all_flat": 0.0
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0571,
      0.1976,
      0.4508,
      0.22,
      0.0745
     ],
     "cond_climatology": [
      0.059,
      0.2177,
      0.4539,
      0.2103,
      0.059
     ],
     "chronos_uni": [
      0.0239,
      0.1801,
      0.4394,
      0.289,
      0.0675
     ],
     "chronos_cov": [
      0.0241,
      0.1929,
      0.4556,
      0.2768,
      0.0506
     ],
     "timesfm_uni": [
      0.0703,
      0.2251,
      0.4087,
      0.2478,
      0.048
     ],
     "timesfm_cov": [
      0.0194,
      0.1757,
      0.5412,
      0.2306,
      0.0331
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0582,
      0.2161,
      0.3914,
      0.2339,
      0.1004
     ],
     "cond_climatology": [
      0.0812,
      0.2657,
      0.4022,
      0.1734,
      0.0775
     ],
     "chronos_uni": [
      0.034,
      0.2235,
      0.402,
      0.2722,
      0.0683
     ],
     "chronos_cov": [
      0.0111,
      0.2041,
      0.4974,
      0.2596,
      0.0278
     ],
     "timesfm_uni": [
      0.0646,
      0.2352,
      0.3824,
      0.2437,
      0.0742
     ],
     "timesfm_cov": [
      0.0049,
      0.1109,
      0.4988,
      0.338,
      0.0474
     ]
    }
   }
  },
  {
   "date": "2026-07-21",
   "outcome": {
    "1": 2,
    "5": 2
   },
   "rps": {
    "1": {
     "climatology": 0.040078,
     "cond_climatology": 0.039818,
     "chronos_uni": 0.035062,
     "timesfm_uni": 0.048118,
     "chronos_cov": 0.033577,
     "timesfm_cov": 0.035689,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.050074,
     "cond_climatology": 0.05411,
     "chronos_uni": 0.042799,
     "timesfm_uni": 0.050679,
     "chronos_cov": 0.030046,
     "timesfm_cov": 0.052411,
     "all_flat": 0.0
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.057,
      0.1975,
      0.451,
      0.22,
      0.0745
     ],
     "cond_climatology": [
      0.0761,
      0.212,
      0.4592,
      0.1712,
      0.0815
     ],
     "chronos_uni": [
      0.0258,
      0.2031,
      0.4784,
      0.2538,
      0.0389
     ],
     "chronos_cov": [
      0.0357,
      0.2424,
      0.487,
      0.2118,
      0.0231
     ],
     "timesfm_uni": [
      0.0823,
      0.2475,
      0.3961,
      0.2318,
      0.0424
     ],
     "timesfm_cov": [
      0.0137,
      0.1327,
      0.51,
      0.2885,
      0.0551
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0582,
      0.216,
      0.3916,
      0.2338,
      0.1003
     ],
     "cond_climatology": [
      0.0679,
      0.2717,
      0.3614,
      0.2147,
      0.0842
     ],
     "chronos_uni": [
      0.0376,
      0.245,
      0.4213,
      0.2483,
      0.0477
     ],
     "chronos_cov": [
      0.0136,
      0.2344,
      0.5108,
      0.223,
      0.0182
     ],
     "timesfm_uni": [
      0.0761,
      0.2464,
      0.3792,
      0.2357,
      0.0626
     ],
     "timesfm_cov": [
      0.0053,
      0.0997,
      0.4553,
      0.3669,
      0.0727
     ]
    }
   }
  },
  {
   "date": "2026-07-22",
   "outcome": {
    "1": 3,
    "5": 3
   },
   "rps": {
    "1": {
     "climatology": 0.142865,
     "cond_climatology": 0.163586,
     "chronos_uni": 0.155969,
     "timesfm_uni": 0.182384,
     "chronos_cov": 0.141878,
     "timesfm_cov": 0.139601,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.133015,
     "cond_climatology": 0.154765,
     "chronos_uni": 0.161066,
     "timesfm_uni": 0.167686,
     "chronos_cov": 0.179679,
     "timesfm_cov": 0.093529,
     "all_flat": 0.249999
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.057,
      0.1974,
      0.4512,
      0.2199,
      0.0745
     ],
     "cond_climatology": [
      0.0759,
      0.2114,
      0.4607,
      0.1707,
      0.0813
     ],
     "chronos_uni": [
      0.0303,
      0.2288,
      0.4858,
      0.2269,
      0.0282
     ],
     "chronos_cov": [
      0.0353,
      0.2239,
      0.4457,
      0.2475,
      0.0477
     ],
     "timesfm_uni": [
      0.1114,
      0.2697,
      0.3743,
      0.2099,
      0.0346
     ],
     "timesfm_cov": [
      0.0139,
      0.1538,
      0.5596,
      0.2395,
      0.0332
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0582,
      0.2159,
      0.3919,
      0.2338,
      0.1003
     ],
     "cond_climatology": [
      0.0678,
      0.271,
      0.3631,
      0.2141,
      0.084
     ],
     "chronos_uni": [
      0.0416,
      0.2719,
      0.4234,
      0.2277,
      0.0354
     ],
     "chronos_cov": [
      0.02,
      0.2841,
      0.4868,
      0.1937,
      0.0154
     ],
     "timesfm_uni": [
      0.0829,
      0.2635,
      0.3898,
      0.2211,
      0.0427
     ],
     "timesfm_cov": [
      0.0055,
      0.1103,
      0.4818,
      0.3432,
      0.0592
     ]
    }
   }
  },
  {
   "date": "2026-07-23",
   "outcome": {
    "1": 3,
    "5": 2
   },
   "rps": {
    "1": {
     "climatology": 0.142764,
     "cond_climatology": 0.162703,
     "chronos_uni": 0.140573,
     "timesfm_uni": 0.171674,
     "chronos_cov": 0.150638,
     "timesfm_cov": 0.144792,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.050003,
     "cond_climatology": 0.053526,
     "chronos_uni": 0.043381,
     "timesfm_uni": 0.051961,
     "chronos_cov": 0.037939,
     "timesfm_cov": 0.040037,
     "all_flat": 0.0
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.057,
      0.1974,
      0.451,
      0.2202,
      0.0745
     ],
     "cond_climatology": [
      0.0757,
      0.2108,
      0.4595,
      0.173,
      0.0811
     ],
     "chronos_uni": [
      0.0346,
      0.2205,
      0.4476,
      0.2489,
      0.0484
     ],
     "chronos_cov": [
      0.0497,
      0.2422,
      0.4238,
      0.2317,
      0.0527
     ],
     "timesfm_uni": [
      0.1131,
      0.2516,
      0.3686,
      0.2114,
      0.0553
     ],
     "timesfm_cov": [
      0.0108,
      0.1415,
      0.5929,
      0.2316,
      0.0233
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0582,
      0.2158,
      0.3921,
      0.2337,
      0.1002
     ],
     "cond_climatology": [
      0.0676,
      0.2703,
      0.3649,
      0.2135,
      0.0838
     ],
     "chronos_uni": [
      0.0452,
      0.2746,
      0.4196,
      0.2249,
      0.0357
     ],
     "chronos_cov": [
      0.0306,
      0.303,
      0.4682,
      0.1824,
      0.0158
     ],
     "timesfm_uni": [
      0.0905,
      0.2555,
      0.3766,
      0.223,
      0.0545
     ],
     "timesfm_cov": [
      0.004,
      0.1015,
      0.5111,
      0.3383,
      0.045
     ]
    }
   }
  },
  {
   "date": "2026-07-24",
   "outcome": {
    "1": 0,
    "5": 1
   },
   "rps": {
    "1": {
     "climatology": 0.384471,
     "cond_climatology": 0.359266,
     "chronos_uni": 0.338884,
     "timesfm_uni": 0.300202,
     "chronos_cov": 0.335402,
     "timesfm_cov": 0.418927,
     "all_flat": 0.499999
    },
    "5": {
     "climatology": 0.163079,
     "cond_climatology": 0.135176,
     "chronos_uni": 0.115846,
     "timesfm_uni": 0.130897,
     "chronos_cov": 0.077068,
     "timesfm_cov": 0.214184,
     "all_flat": 0.249999
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.057,
      0.1973,
      0.4509,
      0.2204,
      0.0744
     ],
     "cond_climatology": [
      0.0755,
      0.2102,
      0.4582,
      0.1752,
      0.0809
     ],
     "chronos_uni": [
      0.0877,
      0.2532,
      0.3682,
      0.2253,
      0.0656
     ],
     "chronos_cov": [
      0.0961,
      0.2452,
      0.3643,
      0.2305,
      0.0639
     ],
     "timesfm_uni": [
      0.153,
      0.2251,
      0.3277,
      0.1942,
      0.1001
     ],
     "timesfm_cov": [
      0.0169,
      0.1724,
      0.5836,
      0.2088,
      0.0184
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0581,
      0.2158,
      0.3919,
      0.234,
      0.1002
     ],
     "cond_climatology": [
      0.0674,
      0.2695,
      0.3639,
      0.2156,
      0.0836
     ],
     "chronos_uni": [
      0.0913,
      0.2908,
      0.3536,
      0.2057,
      0.0586
     ],
     "chronos_cov": [
      0.0923,
      0.3812,
      0.377,
      0.135,
      0.0145
     ],
     "timesfm_uni": [
      0.1275,
      0.2381,
      0.3265,
      0.2079,
      0.1
     ],
     "timesfm_cov": [
      0.0056,
      0.1264,
      0.5475,
      0.2954,
      0.0251
     ]
    }
   }
  },
  {
   "date": "2026-07-25",
   "outcome": {
    "1": 2,
    "5": 3
   },
   "rps": {
    "1": {
     "climatology": 0.040125,
     "cond_climatology": 0.039367,
     "chronos_uni": 0.048026,
     "timesfm_uni": 0.052659,
     "chronos_cov": 0.045806,
     "timesfm_cov": 0.019387,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.132968,
     "cond_climatology": 0.173608,
     "chronos_uni": 0.128676,
     "timesfm_uni": 0.137708,
     "chronos_cov": 0.206509,
     "timesfm_cov": 0.117447,
     "all_flat": 0.249999
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0573,
      0.1972,
      0.4507,
      0.2204,
      0.0744
     ],
     "cond_climatology": [
      0.0625,
      0.2169,
      0.4522,
      0.2096,
      0.0588
     ],
     "chronos_uni": [
      0.0204,
      0.1669,
      0.4264,
      0.3001,
      0.0862
     ],
     "chronos_cov": [
      0.0741,
      0.2869,
      0.4231,
      0.1876,
      0.0282
     ],
     "timesfm_uni": [
      0.1094,
      0.2085,
      0.3781,
      0.232,
      0.072
     ],
     "timesfm_cov": [
      0.0103,
      0.1594,
      0.6103,
      0.204,
      0.0159
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0581,
      0.2157,
      0.3922,
      0.2339,
      0.1002
     ],
     "cond_climatology": [
      0.0809,
      0.2647,
      0.4044,
      0.1728,
      0.0772
     ],
     "chronos_uni": [
      0.035,
      0.2259,
      0.403,
      0.2673,
      0.0688
     ],
     "chronos_cov": [
      0.0377,
      0.3318,
      0.4599,
      0.1591,
      0.0115
     ],
     "timesfm_uni": [
      0.0674,
      0.2346,
      0.3673,
      0.2464,
      0.0843
     ],
     "timesfm_cov": [
      0.0029,
      0.104,
      0.5697,
      0.2992,
      0.0242
     ]
    }
   }
  },
  {
   "date": "2026-07-28",
   "outcome": {
    "1": 3,
    "5": 2
   },
   "rps": {
    "1": {
     "climatology": 0.142765,
     "cond_climatology": 0.161957,
     "chronos_uni": 0.101459,
     "timesfm_uni": 0.141827,
     "chronos_cov": 0.155388,
     "timesfm_cov": 0.165056,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.049955,
     "cond_climatology": 0.053352,
     "chronos_uni": 0.049679,
     "timesfm_uni": 0.053758,
     "chronos_cov": 0.034592,
     "timesfm_cov": 0.026272,
     "all_flat": 0.0
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0573,
      0.1972,
      0.4509,
      0.2203,
      0.0744
     ],
     "cond_climatology": [
      0.0753,
      0.2097,
      0.4597,
      0.1747,
      0.0806
     ],
     "chronos_uni": [
      0.021,
      0.1653,
      0.4155,
      0.3061,
      0.0921
     ],
     "chronos_cov": [
      0.0447,
      0.2433,
      0.4437,
      0.2323,
      0.036
     ],
     "timesfm_uni": [
      0.0878,
      0.2094,
      0.3852,
      0.2421,
      0.0756
     ],
     "timesfm_cov": [
      0.0141,
      0.1775,
      0.5977,
      0.196,
      0.0146
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0581,
      0.2156,
      0.3924,
      0.2338,
      0.1001
     ],
     "cond_climatology": [
      0.0672,
      0.2688,
      0.3656,
      0.2151,
      0.0833
     ],
     "chronos_uni": [
      0.0366,
      0.2191,
      0.3903,
      0.2725,
      0.0816
     ],
     "chronos_cov": [
      0.0169,
      0.22,
      0.4782,
      0.2565,
      0.0285
     ],
     "timesfm_uni": [
      0.0698,
      0.2344,
      0.3641,
      0.2445,
      0.0872
     ],
     "timesfm_cov": [
      0.0046,
      0.1296,
      0.5714,
      0.2749,
      0.0195
     ]
    }
   }
  },
  {
   "date": "2026-07-29",
   "outcome": {
    "1": 2,
    "5": 3
   },
   "rps": {
    "1": {
     "climatology": 0.04012,
     "cond_climatology": 0.039776,
     "chronos_uni": 0.043379,
     "timesfm_uni": 0.055269,
     "chronos_cov": 0.049225,
     "timesfm_cov": 0.020192,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.132897,
     "cond_climatology": 0.153333,
     "chronos_uni": 0.133711,
     "timesfm_uni": 0.142814,
     "chronos_cov": 0.122699,
     "timesfm_cov": 0.137431,
     "all_flat": 0.249999
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0573,
      0.1971,
      0.4507,
      0.2206,
      0.0744
     ],
     "cond_climatology": [
      0.0751,
      0.2091,
      0.4584,
      0.1769,
      0.0804
     ],
     "chronos_uni": [
      0.023,
      0.1765,
      0.4415,
      0.2933,
      0.0657
     ],
     "chronos_cov": [
      0.0457,
      0.2162,
      0.394,
      0.2558,
      0.0884
     ],
     "timesfm_uni": [
      0.1142,
      0.2152,
      0.3627,
      0.239,
      0.0689
     ],
     "timesfm_cov": [
      0.0142,
      0.179,
      0.5994,
      0.1919,
      0.0155
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0581,
      0.2155,
      0.3922,
      0.2341,
      0.1001
     ],
     "cond_climatology": [
      0.067,
      0.2681,
      0.3646,
      0.2172,
      0.0831
     ],
     "chronos_uni": [
      0.0326,
      0.2303,
      0.4161,
      0.2618,
      0.0591
     ],
     "chronos_cov": [
      0.0177,
      0.2044,
      0.4398,
      0.2823,
      0.0559
     ],
     "timesfm_uni": [
      0.083,
      0.2291,
      0.3669,
      0.244,
      0.077
     ],
     "timesfm_cov": [
      0.0051,
      0.1397,
      0.5822,
      0.2558,
      0.0173
     ]
    }
   }
  },
  {
   "date": "2026-07-30",
   "outcome": {
    "1": 2,
    "5": 3
   },
   "rps": {
    "1": {
     "climatology": 0.040091,
     "cond_climatology": 0.039564,
     "chronos_uni": 0.057018,
     "timesfm_uni": 0.046117,
     "chronos_cov": 0.046098,
     "timesfm_cov": 0.021167,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.132921,
     "cond_climatology": 0.153448,
     "chronos_uni": 0.111204,
     "timesfm_uni": 0.146124,
     "chronos_cov": 0.090333,
     "timesfm_cov": 0.136106,
     "all_flat": 0.249999
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0573,
      0.197,
      0.4509,
      0.2205,
      0.0743
     ],
     "cond_climatology": [
      0.0749,
      0.2086,
      0.4599,
      0.1765,
      0.0802
     ],
     "chronos_uni": [
      0.0113,
      0.1248,
      0.4172,
      0.3476,
      0.0991
     ],
     "chronos_cov": [
      0.0243,
      0.1746,
      0.4304,
      0.2881,
      0.0826
     ],
     "timesfm_uni": [
      0.083,
      0.241,
      0.4099,
      0.2237,
      0.0424
     ],
     "timesfm_cov": [
      0.0176,
      0.1966,
      0.5902,
      0.1814,
      0.0142
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.058,
      0.2155,
      0.3925,
      0.234,
      0.1001
     ],
     "cond_climatology": [
      0.0668,
      0.2674,
      0.3663,
      0.2166,
      0.0829
     ],
     "chronos_uni": [
      0.0186,
      0.1848,
      0.4271,
      0.2944,
      0.0752
     ],
     "chronos_cov": [
      0.0082,
      0.13,
      0.4408,
      0.3375,
      0.0835
     ],
     "timesfm_uni": [
      0.0578,
      0.2376,
      0.405,
      0.2425,
      0.057
     ],
     "timesfm_cov": [
      0.0046,
      0.1321,
      0.5882,
      0.259,
      0.0161
     ]
    }
   }
  },
  {
   "date": "2026-07-31",
   "outcome": {
    "1": 3,
    "5": 4
   },
   "rps": {
    "1": {
     "climatology": 0.142711,
     "cond_climatology": 0.161353,
     "chronos_uni": 0.078813,
     "timesfm_uni": 0.159502,
     "chronos_cov": 0.110092,
     "timesfm_cov": 0.188782,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.332976,
     "cond_climatology": 0.362677,
     "chronos_uni": 0.330616,
     "timesfm_uni": 0.372403,
     "chronos_cov": 0.344719,
     "timesfm_cov": 0.392792,
     "all_flat": 0.499999
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0572,
      0.1969,
      0.4511,
      0.2204,
      0.0743
     ],
     "cond_climatology": [
      0.0747,
      0.208,
      0.4613,
      0.176,
      0.08
     ],
     "chronos_uni": [
      0.0095,
      0.1189,
      0.4084,
      0.3606,
      0.1026
     ],
     "chronos_cov": [
      0.0161,
      0.1584,
      0.4624,
      0.2999,
      0.0632
     ],
     "timesfm_uni": [
      0.0728,
      0.2404,
      0.4169,
      0.23,
      0.0399
     ],
     "timesfm_cov": [
      0.041,
      0.2538,
      0.5214,
      0.1648,
      0.019
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.058,
      0.2157,
      0.3923,
      0.2339,
      0.1
     ],
     "cond_climatology": [
      0.0667,
      0.2693,
      0.3653,
      0.216,
      0.0827
     ],
     "chronos_uni": [
      0.0155,
      0.1845,
      0.4401,
      0.2941,
      0.0659
     ],
     "chronos_cov": [
      0.0096,
      0.1659,
      0.4824,
      0.2988,
      0.0433
     ],
     "timesfm_uni": [
      0.0514,
      0.237,
      0.4207,
      0.2401,
      0.0508
     ],
     "timesfm_cov": [
      0.0123,
      0.1904,
      0.5502,
      0.2285,
      0.0186
     ]
    }
   }
  },
  {
   "date": "2026-08-01",
   "outcome": {
    "1": 1,
    "5": 4
   },
   "rps": {
    "1": {
     "climatology": 0.163044,
     "cond_climatology": 0.150378,
     "chronos_uni": 0.184065,
     "timesfm_uni": 0.106206,
     "chronos_cov": 0.160813,
     "timesfm_cov": 0.083672,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.332899,
     "cond_climatology": 0.383877,
     "chronos_uni": 0.357838,
     "timesfm_uni": 0.387479,
     "chronos_cov": 0.381981,
     "timesfm_cov": 0.472212,
     "all_flat": 0.499999
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0572,
      0.1969,
      0.451,
      0.2207,
      0.0743
     ],
     "cond_climatology": [
      0.0623,
      0.2161,
      0.4505,
      0.2125,
      0.0586
     ],
     "chronos_uni": [
      0.0321,
      0.1975,
      0.4017,
      0.2933,
      0.0755
     ],
     "chronos_cov": [
      0.0381,
      0.2233,
      0.4337,
      0.2478,
      0.0571
     ],
     "timesfm_uni": [
      0.1199,
      0.2796,
      0.3798,
      0.1866,
      0.034
     ],
     "timesfm_cov": [
      0.1407,
      0.3237,
      0.37,
      0.1399,
      0.0257
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.058,
      0.2157,
      0.3922,
      0.2342,
      0.1
     ],
     "cond_climatology": [
      0.0806,
      0.2637,
      0.4029,
      0.1758,
      0.0769
     ],
     "chronos_uni": [
      0.0355,
      0.2446,
      0.4069,
      0.2509,
      0.0621
     ],
     "chronos_cov": [
      0.0283,
      0.2449,
      0.4528,
      0.2359,
      0.0381
     ],
     "timesfm_uni": [
      0.0832,
      0.2552,
      0.3904,
      0.2185,
      0.0527
     ],
     "timesfm_cov": [
      0.0831,
      0.3409,
      0.4278,
      0.1365,
      0.0118
     ]
    }
   }
  },
  {
   "date": "2026-08-04",
   "outcome": {
    "1": 3,
    "5": 4
   },
   "rps": {
    "1": {
     "climatology": 0.142679,
     "cond_climatology": 0.144783,
     "chronos_uni": 0.112794,
     "timesfm_uni": 0.18319,
     "chronos_cov": 0.20437,
     "timesfm_cov": 0.211445,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.332941,
     "cond_climatology": 0.417128,
     "chronos_uni": 0.342388,
     "timesfm_uni": 0.386928,
     "chronos_cov": 0.40544,
     "timesfm_cov": 0.433839,
     "all_flat": 0.499999
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0572,
      0.1972,
      0.4508,
      0.2206,
      0.0742
     ],
     "cond_climatology": [
      0.05,
      0.1967,
      0.47,
      0.2367,
      0.0467
     ],
     "chronos_uni": [
      0.0232,
      0.1822,
      0.4289,
      0.2874,
      0.0783
     ],
     "chronos_cov": [
      0.0855,
      0.3109,
      0.4111,
      0.1639,
      0.0285
     ],
     "timesfm_uni": [
      0.1144,
      0.256,
      0.3921,
      0.203,
      0.0345
     ],
     "timesfm_cov": [
      0.0663,
      0.2928,
      0.4848,
      0.1411,
      0.015
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.058,
      0.2156,
      0.3924,
      0.2341,
      0.1
     ],
     "cond_climatology": [
      0.0867,
      0.2467,
      0.4633,
      0.16,
      0.0433
     ],
     "chronos_uni": [
      0.0229,
      0.2138,
      0.4242,
      0.2752,
      0.0639
     ],
     "chronos_cov": [
      0.0293,
      0.275,
      0.4571,
      0.2125,
      0.0261
     ],
     "timesfm_uni": [
      0.0636,
      0.2487,
      0.414,
      0.2323,
      0.0415
     ],
     "timesfm_cov": [
      0.0293,
      0.2598,
      0.5305,
      0.1699,
      0.0105
     ]
    }
   }
  },
  {
   "date": "2026-08-05",
   "outcome": {
    "1": 3,
    "5": 4
   },
   "rps": {
    "1": {
     "climatology": 0.142578,
     "cond_climatology": 0.143823,
     "chronos_uni": 0.100299,
     "timesfm_uni": 0.179764,
     "chronos_cov": 0.173939,
     "timesfm_cov": 0.185794,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.332864,
     "cond_climatology": 0.415947,
     "chronos_uni": 0.345936,
     "timesfm_uni": 0.387493,
     "chronos_cov": 0.45404,
     "timesfm_cov": 0.41738,
     "all_flat": 0.499999
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0572,
      0.1971,
      0.4506,
      0.2209,
      0.0742
     ],
     "cond_climatology": [
      0.0498,
      0.196,
      0.4684,
      0.2392,
      0.0465
     ],
     "chronos_uni": [
      0.0242,
      0.1736,
      0.3976,
      0.3207,
      0.0839
     ],
     "chronos_cov": [
      0.0528,
      0.2687,
      0.4459,
      0.2046,
      0.028
     ],
     "timesfm_uni": [
      0.1079,
      0.2639,
      0.3818,
      0.21,
      0.0364
     ],
     "timesfm_cov": [
      0.0376,
      0.2396,
      0.538,
      0.1666,
      0.0182
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.058,
      0.2155,
      0.3922,
      0.2344,
      0.0999
     ],
     "cond_climatology": [
      0.0864,
      0.2458,
      0.4618,
      0.1628,
      0.0432
     ],
     "chronos_uni": [
      0.0328,
      0.2256,
      0.4104,
      0.2632,
      0.068
     ],
     "chronos_cov": [
      0.0525,
      0.3392,
      0.437,
      0.1577,
      0.0135
     ],
     "timesfm_uni": [
      0.0725,
      0.2522,
      0.404,
      0.2244,
      0.0469
     ],
     "timesfm_cov": [
      0.0209,
      0.2275,
      0.5464,
      0.1929,
      0.0123
     ]
    }
   }
  },
  {
   "date": "2026-08-06",
   "outcome": {
    "1": 4,
    "5": 4
   },
   "rps": {
    "1": {
     "climatology": 0.35538,
     "cond_climatology": 0.369693,
     "chronos_uni": 0.365543,
     "timesfm_uni": 0.426339,
     "chronos_cov": 0.459549,
     "timesfm_cov": 0.386052,
     "all_flat": 0.499999
    },
    "5": {
     "climatology": 0.332787,
     "cond_climatology": 0.414779,
     "chronos_uni": 0.368739,
     "timesfm_uni": 0.396419,
     "chronos_cov": 0.455654,
     "timesfm_cov": 0.38691,
     "all_flat": 0.499999
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0572,
      0.197,
      0.4505,
      0.2212,
      0.0742
     ],
     "cond_climatology": [
      0.0497,
      0.1954,
      0.4669,
      0.2417,
      0.0464
     ],
     "chronos_uni": [
      0.0448,
      0.2323,
      0.4156,
      0.2578,
      0.0495
     ],
     "chronos_cov": [
      0.1089,
      0.309,
      0.4124,
      0.1507,
      0.019
     ],
     "timesfm_uni": [
      0.139,
      0.2794,
      0.3463,
      0.1978,
      0.0376
     ],
     "timesfm_cov": [
      0.0206,
      0.1809,
      0.548,
      0.2207,
      0.0298
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0579,
      0.2154,
      0.3921,
      0.2346,
      0.0999
     ],
     "cond_climatology": [
      0.0861,
      0.245,
      0.4603,
      0.1656,
      0.043
     ],
     "chronos_uni": [
      0.0418,
      0.2472,
      0.4136,
      0.244,
      0.0534
     ],
     "chronos_cov": [
      0.0691,
      0.3442,
      0.4114,
      0.1587,
      0.0166
     ],
     "timesfm_uni": [
      0.1026,
      0.2524,
      0.3845,
      0.2103,
      0.0502
     ],
     "timesfm_cov": [
      0.0138,
      0.1826,
      0.5441,
      0.2395,
      0.0199
     ]
    }
   }
  },
  {
   "date": "2026-08-07",
   "outcome": {
    "1": 3,
    "5": 4
   },
   "rps": {
    "1": {
     "climatology": 0.142389,
     "cond_climatology": 0.142009,
     "chronos_uni": 0.238052,
     "timesfm_uni": 0.203118,
     "chronos_cov": 0.313665,
     "timesfm_cov": 0.216385,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.332551,
     "cond_climatology": 0.412046,
     "chronos_uni": 0.410987,
     "timesfm_uni": 0.379115,
     "chronos_cov": 0.512669,
     "timesfm_cov": 0.478072,
     "all_flat": 0.499999
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0571,
      0.1969,
      0.4503,
      0.2211,
      0.0745
     ],
     "cond_climatology": [
      0.0495,
      0.1947,
      0.4653,
      0.2409,
      0.0495
     ],
     "chronos_uni": [
      0.2059,
      0.2944,
      0.3105,
      0.1449,
      0.0442
     ],
     "chronos_cov": [
      0.2637,
      0.3657,
      0.2587,
      0.0935,
      0.0185
     ],
     "timesfm_uni": [
      0.1857,
      0.2759,
      0.2872,
      0.1864,
      0.0648
     ],
     "timesfm_cov": [
      0.0699,
      0.3007,
      0.4798,
      0.1361,
      0.0135
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0579,
      0.2154,
      0.392,
      0.2345,
      0.1002
     ],
     "cond_climatology": [
      0.0858,
      0.2442,
      0.4587,
      0.165,
      0.0462
     ],
     "chronos_uni": [
      0.1241,
      0.2987,
      0.3316,
      0.184,
      0.0616
     ],
     "chronos_cov": [
      0.1769,
      0.3845,
      0.3004,
      0.1187,
      0.0194
     ],
     "timesfm_uni": [
      0.1841,
      0.2358,
      0.2926,
      0.1811,
      0.1064
     ],
     "timesfm_cov": [
      0.0609,
      0.3395,
      0.4719,
      0.1213,
      0.0064
     ]
    }
   }
  },
  {
   "date": "2026-08-08",
   "outcome": {
    "1": 3,
    "5": 4
   },
   "rps": {
    "1": {
     "climatology": 0.142288,
     "cond_climatology": 0.152918,
     "chronos_uni": 0.21598,
     "timesfm_uni": 0.173515,
     "chronos_cov": 0.312039,
     "timesfm_cov": 0.243622,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.332314,
     "cond_climatology": 0.381081,
     "chronos_uni": 0.399427,
     "timesfm_uni": 0.346867,
     "chronos_cov": 0.513703,
     "timesfm_cov": 0.530285,
     "all_flat": 0.499999
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0571,
      0.1969,
      0.4502,
      0.2214,
      0.0745
     ],
     "cond_climatology": [
      0.062,
      0.2153,
      0.4489,
      0.2153,
      0.0584
     ],
     "chronos_uni": [
      0.2062,
      0.2646,
      0.3005,
      0.1588,
      0.0699
     ],
     "chronos_cov": [
      0.2904,
      0.3378,
      0.2485,
      0.0999,
      0.0234
     ],
     "timesfm_uni": [
      0.1707,
      0.2419,
      0.2801,
      0.1852,
      0.1221
     ],
     "timesfm_cov": [
      0.1262,
      0.3407,
      0.3935,
      0.1228,
      0.0168
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0579,
      0.2153,
      0.3918,
      0.2345,
      0.1005
     ],
     "cond_climatology": [
      0.0803,
      0.2628,
      0.4015,
      0.1752,
      0.0803
     ],
     "chronos_uni": [
      0.1495,
      0.2808,
      0.309,
      0.1791,
      0.0816
     ],
     "chronos_cov": [
      0.2137,
      0.3613,
      0.2779,
      0.1225,
      0.0247
     ],
     "timesfm_uni": [
      0.2054,
      0.2148,
      0.2493,
      0.1793,
      0.1512
     ],
     "timesfm_cov": [
      0.1373,
      0.3988,
      0.3732,
      0.0849,
      0.0059
     ]
    }
   }
  },
  {
   "date": "2026-08-11",
   "outcome": {
    "1": 2,
    "5": 3
   },
   "rps": {
    "1": {
     "climatology": 0.040236,
     "cond_climatology": 0.037458,
     "chronos_uni": 0.084689,
     "timesfm_uni": 0.086661,
     "chronos_cov": 0.153122,
     "timesfm_cov": 0.060811,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.132505,
     "cond_climatology": 0.18401,
     "chronos_uni": 0.18748,
     "timesfm_uni": 0.138567,
     "chronos_cov": 0.286282,
     "timesfm_cov": 0.299494,
     "all_flat": 0.249999
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0571,
      0.1968,
      0.45,
      0.2216,
      0.0745
     ],
     "cond_climatology": [
      0.0493,
      0.1941,
      0.4638,
      0.2434,
      0.0493
     ],
     "chronos_uni": [
      0.2137,
      0.242,
      0.2718,
      0.1669,
      0.1056
     ],
     "chronos_cov": [
      0.376,
      0.2985,
      0.2021,
      0.0919,
      0.0315
     ],
     "timesfm_uni": [
      0.1639,
      0.1878,
      0.2573,
      0.1831,
      0.2078
     ],
     "timesfm_cov": [
      0.1351,
      0.3024,
      0.3817,
      0.1502,
      0.0306
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0579,
      0.2152,
      0.3917,
      0.2344,
      0.1009
     ],
     "cond_climatology": [
      0.0855,
      0.2434,
      0.4572,
      0.1645,
      0.0493
     ],
     "chronos_uni": [
      0.1512,
      0.2746,
      0.308,
      0.181,
      0.0852
     ],
     "chronos_cov": [
      0.2318,
      0.3646,
      0.261,
      0.1164,
      0.0263
     ],
     "timesfm_uni": [
      0.1719,
      0.1964,
      0.2232,
      0.2107,
      0.1978
     ],
     "timesfm_cov": [
      0.164,
      0.4087,
      0.3455,
      0.076,
      0.0057
     ]
    }
   }
  },
  {
   "date": "2026-08-12",
   "outcome": {
    "1": 3,
    "5": 3
   },
   "rps": {
    "1": {
     "climatology": 0.142211,
     "cond_climatology": 0.141311,
     "chronos_uni": 0.175172,
     "timesfm_uni": 0.136634,
     "chronos_cov": 0.35015,
     "timesfm_cov": 0.21636,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.132428,
     "cond_climatology": 0.182889,
     "chronos_uni": 0.173321,
     "timesfm_uni": 0.121196,
     "chronos_cov": 0.27304,
     "timesfm_cov": 0.265138,
     "all_flat": 0.249999
    }
   },
   "probs": {
    "1": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0571,
      0.1967,
      0.4502,
      0.2216,
      0.0744
     ],
     "cond_climatology": [
      0.0492,
      0.1934,
      0.4656,
      0.2426,
      0.0492
     ],
     "chronos_uni": [
      0.1383,
      0.2531,
      0.3309,
      0.1964,
      0.0813
     ],
     "chronos_cov": [
      0.3215,
      0.363,
      0.2257,
      0.0752,
      0.0146
     ],
     "timesfm_uni": [
      0.1366,
      0.198,
      0.2882,
      0.2093,
      0.168
     ],
     "timesfm_cov": [
      0.0977,
      0.3055,
      0.4291,
      0.1447,
      0.0229
     ]
    },
    "5": {
     "all_flat": [
      0.0,
      0.0,
      1.0,
      0.0,
      0.0
     ],
     "climatology": [
      0.0579,
      0.2151,
      0.3916,
      0.2343,
      0.1012
     ],
     "cond_climatology": [
      0.0852,
      0.2426,
      0.4557,
      0.1639,
      0.0525
     ],
     "chronos_uni": [
      0.1003,
      0.2723,
      0.3624,
      0.201,
      0.0639
     ],
     "chronos_cov": [
      0.1811,
      0.3793,
      0.3026,
      0.1181,
      0.0188
     ],
     "timesfm_uni": [
      0.1225,
      0.2004,
      0.2568,
      0.2483,
      0.1721
     ],
     "timesfm_cov": [
      0.0863,
      0.3858,
      0.439,
      0.0846,
      0.0042
     ]
    }
   }
  }
 ],
 "by_outcome": {
  "1": {
   "climatology": {
    "0": 0.384982,
    "1": 0.163146,
    "2": 0.040167,
    "3": 0.142555,
    "4": 0.355067
   },
   "cond_climatology": {
    "0": 0.379577,
    "1": 0.157469,
    "2": 0.039813,
    "3": 0.147674,
    "4": 0.358381
   },
   "chronos_uni": {
    "0": 0.333448,
    "1": 0.152537,
    "2": 0.048437,
    "3": 0.167521,
    "4": 0.368512
   },
   "timesfm_uni": {
    "0": 0.324844,
    "1": 0.143514,
    "2": 0.051385,
    "3": 0.163435,
    "4": 0.370353
   },
   "chronos_cov": {
    "0": 0.385249,
    "1": 0.202685,
    "2": 0.055805,
    "3": 0.167117,
    "4": 0.350438
   },
   "timesfm_cov": {
    "0": 0.418473,
    "1": 0.166425,
    "2": 0.046629,
    "3": 0.168621,
    "4": 0.334244
   },
   "all_flat": {
    "0": 0.499999,
    "1": 0.249999,
    "2": 0.0,
    "3": 0.249999,
    "4": 0.499999
   }
  },
  "5": {
   "climatology": {
    "0": 0.385951,
    "1": 0.163476,
    "2": 0.050513,
    "3": 0.132378,
    "4": 0.331727
   },
   "cond_climatology": {
    "0": 0.371683,
    "1": 0.150401,
    "2": 0.052504,
    "3": 0.138902,
    "4": 0.362615
   },
   "chronos_uni": {
    "0": 0.35884,
    "1": 0.14207,
    "2": 0.043968,
    "3": 0.152436,
    "4": 0.351695
   },
   "timesfm_uni": {
    "0": 0.361424,
    "1": 0.126235,
    "2": 0.052034,
    "3": 0.153627,
    "4": 0.367486
   },
   "chronos_cov": {
    "0": 0.390806,
    "1": 0.152514,
    "2": 0.047602,
    "3": 0.16972,
    "4": 0.426883
   },
   "timesfm_cov": {
    "0": 0.409033,
    "1": 0.191421,
    "2": 0.06188,
    "3": 0.139304,
    "4": 0.400175
   },
   "all_flat": {
    "0": 0.499999,
    "1": 0.249999,
    "2": 0.0,
    "3": 0.249999,
    "4": 0.499999
   }
  }
 },
 "rung2_levels": {
  "1": {
   "2": 147
  },
  "5": {
   "2": 147
  }
 }
};
