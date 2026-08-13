window.POC_DATA = {
 "generated": "2026-08-13",
 "target": "gold, RUB/gram, CBR daily fix",
 "window": {
  "from": "2026-01-13",
  "to": "2026-08-06",
  "days": 143,
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
    "rung": "climatology",
    "mean": 0.136817,
    "baseline": true
   },
   {
    "rung": "cond_climatology",
    "mean": 0.139024,
    "diff": 0.002207,
    "lo": -0.000789,
    "hi": 0.005202,
    "verdict": "no detectable difference",
    "wins": 84,
    "n": 143
   },
   {
    "rung": "timesfm_uni",
    "mean": 0.139177,
    "diff": 0.002359,
    "lo": -0.002492,
    "hi": 0.007211,
    "verdict": "no detectable difference",
    "wins": 44,
    "n": 143
   },
   {
    "rung": "chronos_uni",
    "mean": 0.140096,
    "diff": 0.003279,
    "lo": -0.004024,
    "hi": 0.010582,
    "verdict": "no detectable difference",
    "wins": 68,
    "n": 143
   },
   {
    "rung": "timesfm_cov",
    "mean": 0.145308,
    "diff": 0.008491,
    "lo": 0.001215,
    "hi": 0.015768,
    "verdict": "worse",
    "wins": 70,
    "n": 143
   },
   {
    "rung": "chronos_cov",
    "mean": 0.148835,
    "diff": 0.012018,
    "lo": -0.00023,
    "hi": 0.024266,
    "verdict": "no detectable difference",
    "wins": 56,
    "n": 143
   },
   {
    "rung": "all_flat",
    "mean": 0.178321,
    "diff": 0.041504,
    "lo": 0.029195,
    "hi": 0.053812,
    "verdict": "worse",
    "wins": 64,
    "n": 143
   }
  ],
  "5": [
   {
    "rung": "chronos_uni",
    "mean": 0.140677,
    "diff": -0.003623,
    "lo": -0.010398,
    "hi": 0.003151,
    "verdict": "no detectable difference",
    "wins": 96,
    "n": 143
   },
   {
    "rung": "climatology",
    "mean": 0.1443,
    "baseline": true
   },
   {
    "rung": "timesfm_uni",
    "mean": 0.145475,
    "diff": 0.001175,
    "lo": -0.005578,
    "hi": 0.007928,
    "verdict": "no detectable difference",
    "wins": 69,
    "n": 143
   },
   {
    "rung": "cond_climatology",
    "mean": 0.146733,
    "diff": 0.002432,
    "lo": -0.006181,
    "hi": 0.011045,
    "verdict": "no detectable difference",
    "wins": 57,
    "n": 143
   },
   {
    "rung": "chronos_cov",
    "mean": 0.156843,
    "diff": 0.012543,
    "lo": -0.0027,
    "hi": 0.027785,
    "verdict": "no detectable difference",
    "wins": 78,
    "n": 143
   },
   {
    "rung": "timesfm_cov",
    "mean": 0.16462,
    "diff": 0.02032,
    "lo": -0.00067,
    "hi": 0.041311,
    "verdict": "no detectable difference",
    "wins": 70,
    "n": 143
   },
   {
    "rung": "all_flat",
    "mean": 0.187062,
    "diff": 0.042762,
    "lo": 0.023464,
    "hi": 0.062061,
    "verdict": "worse",
    "wins": 63,
    "n": 143
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
     "cond_climatology": 0.40276,
     "chronos_uni": 0.452063,
     "timesfm_uni": 0.402123,
     "chronos_cov": 0.274495,
     "timesfm_cov": 0.162212,
     "all_flat": 0.499999
    },
    "5": {
     "climatology": 0.050472,
     "cond_climatology": 0.053104,
     "chronos_uni": 0.045319,
     "timesfm_uni": 0.045783,
     "chronos_cov": 0.049628,
     "timesfm_cov": 0.186603,
     "all_flat": 0.0
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
     "cond_climatology": 0.039583,
     "chronos_uni": 0.090509,
     "timesfm_uni": 0.054393,
     "chronos_cov": 0.094164,
     "timesfm_cov": 0.077755,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.050497,
     "cond_climatology": 0.04546,
     "chronos_uni": 0.051192,
     "timesfm_uni": 0.049345,
     "chronos_cov": 0.05416,
     "timesfm_cov": 0.118864,
     "all_flat": 0.0
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
     "cond_climatology": 0.037691,
     "chronos_uni": 0.076678,
     "timesfm_uni": 0.043557,
     "chronos_cov": 0.061741,
     "timesfm_cov": 0.059912,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.050522,
     "cond_climatology": 0.05702,
     "chronos_uni": 0.041912,
     "timesfm_uni": 0.044919,
     "chronos_cov": 0.043332,
     "timesfm_cov": 0.088146,
     "all_flat": 0.0
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
     "cond_climatology": 0.039382,
     "chronos_uni": 0.074259,
     "timesfm_uni": 0.041256,
     "chronos_cov": 0.056188,
     "timesfm_cov": 0.090957,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.13226,
     "cond_climatology": 0.125177,
     "chronos_uni": 0.157244,
     "timesfm_uni": 0.167174,
     "chronos_cov": 0.180229,
     "timesfm_cov": 0.089082,
     "all_flat": 0.249999
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
     "cond_climatology": 0.039182,
     "chronos_uni": 0.066417,
     "timesfm_uni": 0.041904,
     "chronos_cov": 0.058253,
     "timesfm_cov": 0.08149,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.13218,
     "cond_climatology": 0.124628,
     "chronos_uni": 0.145491,
     "timesfm_uni": 0.169614,
     "chronos_cov": 0.154239,
     "timesfm_cov": 0.082344,
     "all_flat": 0.249999
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
     "cond_climatology": 0.142574,
     "chronos_uni": 0.144666,
     "timesfm_uni": 0.151904,
     "chronos_cov": 0.120164,
     "timesfm_cov": 0.127113,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.132205,
     "cond_climatology": 0.11069,
     "chronos_uni": 0.136043,
     "timesfm_uni": 0.155906,
     "chronos_cov": 0.158033,
     "timesfm_cov": 0.079886,
     "all_flat": 0.249999
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
     "cond_climatology": 0.148581,
     "chronos_uni": 0.168164,
     "timesfm_uni": 0.150874,
     "chronos_cov": 0.107192,
     "timesfm_cov": 0.134422,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.33068,
     "cond_climatology": 0.347286,
     "chronos_uni": 0.373794,
     "timesfm_uni": 0.34972,
     "chronos_cov": 0.363365,
     "timesfm_cov": 0.236532,
     "all_flat": 0.499999
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
     "cond_climatology": 0.038023,
     "chronos_uni": 0.075966,
     "timesfm_uni": 0.037228,
     "chronos_cov": 0.070046,
     "timesfm_cov": 0.02831,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.132255,
     "cond_climatology": 0.135197,
     "chronos_uni": 0.137319,
     "timesfm_uni": 0.124692,
     "chronos_cov": 0.105784,
     "timesfm_cov": 0.077335,
     "all_flat": 0.249999
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
     "cond_climatology": 0.164934,
     "chronos_uni": 0.170325,
     "timesfm_uni": 0.188486,
     "chronos_cov": 0.253961,
     "timesfm_cov": 0.246152,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.330645,
     "cond_climatology": 0.339821,
     "chronos_uni": 0.334386,
     "timesfm_uni": 0.314889,
     "chronos_cov": 0.289544,
     "timesfm_cov": 0.20901,
     "all_flat": 0.499999
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
     "cond_climatology": 0.363597,
     "chronos_uni": 0.292016,
     "timesfm_uni": 0.377478,
     "chronos_cov": 0.245322,
     "timesfm_cov": 0.341362,
     "all_flat": 0.499999
    },
    "5": {
     "climatology": 0.330566,
     "cond_climatology": 0.339281,
     "chronos_uni": 0.323021,
     "timesfm_uni": 0.349371,
     "chronos_cov": 0.318154,
     "timesfm_cov": 0.23574,
     "all_flat": 0.499999
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
     "cond_climatology": 0.361767,
     "chronos_uni": 0.336473,
     "timesfm_uni": 0.362881,
     "chronos_cov": 0.191865,
     "timesfm_cov": 0.324388,
     "all_flat": 0.499999
    },
    "5": {
     "climatology": 0.13196,
     "cond_climatology": 0.122752,
     "chronos_uni": 0.126874,
     "timesfm_uni": 0.102511,
     "chronos_cov": 0.07484,
     "timesfm_cov": 0.051454,
     "all_flat": 0.249999
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
     "cond_climatology": 0.165228,
     "chronos_uni": 0.109416,
     "timesfm_uni": 0.132394,
     "chronos_cov": 0.431447,
     "timesfm_cov": 0.235828,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.386541,
     "cond_climatology": 0.402373,
     "chronos_uni": 0.329562,
     "timesfm_uni": 0.376944,
     "chronos_cov": 0.648389,
     "timesfm_cov": 0.555134,
     "all_flat": 0.499999
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
     "cond_climatology": 0.360516,
     "chronos_uni": 0.363447,
     "timesfm_uni": 0.424303,
     "chronos_cov": 0.163475,
     "timesfm_cov": 0.357479,
     "all_flat": 0.499999
    },
    "5": {
     "climatology": 0.163836,
     "cond_climatology": 0.176748,
     "chronos_uni": 0.159588,
     "timesfm_uni": 0.1319,
     "chronos_cov": 0.253636,
     "timesfm_cov": 0.266332,
     "all_flat": 0.249999
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
     "cond_climatology": 0.138743,
     "chronos_uni": 0.212704,
     "timesfm_uni": 0.165279,
     "chronos_cov": 0.092392,
     "timesfm_cov": 0.156234,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.386733,
     "cond_climatology": 0.363402,
     "chronos_uni": 0.296343,
     "timesfm_uni": 0.347555,
     "chronos_cov": 0.443814,
     "timesfm_cov": 0.358847,
     "all_flat": 0.499999
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
     "cond_climatology": 0.396647,
     "chronos_uni": 0.273732,
     "timesfm_uni": 0.312778,
     "chronos_cov": 0.68319,
     "timesfm_cov": 0.385803,
     "all_flat": 0.499999
    },
    "5": {
     "climatology": 0.386839,
     "cond_climatology": 0.364758,
     "chronos_uni": 0.332808,
     "timesfm_uni": 0.371755,
     "chronos_cov": 0.534396,
     "timesfm_cov": 0.383543,
     "all_flat": 0.499999
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
     "cond_climatology": 0.388641,
     "chronos_uni": 0.287849,
     "timesfm_uni": 0.304814,
     "chronos_cov": 0.109659,
     "timesfm_cov": 0.387055,
     "all_flat": 0.499999
    },
    "5": {
     "climatology": 0.050737,
     "cond_climatology": 0.047253,
     "chronos_uni": 0.06211,
     "timesfm_uni": 0.08312,
     "chronos_cov": 0.160667,
     "timesfm_cov": 0.035327,
     "all_flat": 0.0
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
     "cond_climatology": 0.35422,
     "chronos_uni": 0.232363,
     "timesfm_uni": 0.334087,
     "chronos_cov": 0.619604,
     "timesfm_cov": 0.406418,
     "all_flat": 0.499999
    },
    "5": {
     "climatology": 0.329696,
     "cond_climatology": 0.340886,
     "chronos_uni": 0.225191,
     "timesfm_uni": 0.363034,
     "chronos_cov": 0.571425,
     "timesfm_cov": 0.398546,
     "all_flat": 0.499999
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
     "cond_climatology": 0.047201,
     "chronos_uni": 0.066467,
     "timesfm_uni": 0.062822,
     "chronos_cov": 0.087214,
     "timesfm_cov": 0.038464,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.131689,
     "cond_climatology": 0.112124,
     "chronos_uni": 0.128043,
     "timesfm_uni": 0.154534,
     "chronos_cov": 0.218636,
     "timesfm_cov": 0.247015,
     "all_flat": 0.249999
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
     "cond_climatology": 0.162069,
     "chronos_uni": 0.099564,
     "timesfm_uni": 0.150332,
     "chronos_cov": 0.09966,
     "timesfm_cov": 0.114581,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.131775,
     "cond_climatology": 0.113615,
     "chronos_uni": 0.160734,
     "timesfm_uni": 0.153975,
     "chronos_cov": 0.213309,
     "timesfm_cov": 0.227898,
     "all_flat": 0.249999
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
     "cond_climatology": 0.139349,
     "chronos_uni": 0.124874,
     "timesfm_uni": 0.164994,
     "chronos_cov": 0.275622,
     "timesfm_cov": 0.253112,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.131861,
     "cond_climatology": 0.135429,
     "chronos_uni": 0.112061,
     "timesfm_uni": 0.159804,
     "chronos_cov": 0.266574,
     "timesfm_cov": 0.26934,
     "all_flat": 0.249999
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
     "cond_climatology": 0.138091,
     "chronos_uni": 0.130786,
     "timesfm_uni": 0.15005,
     "chronos_cov": 0.163476,
     "timesfm_cov": 0.262111,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.050783,
     "cond_climatology": 0.057631,
     "chronos_uni": 0.048802,
     "timesfm_uni": 0.062458,
     "chronos_cov": 0.067698,
     "timesfm_cov": 0.112406,
     "all_flat": 0.0
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
     "cond_climatology": 0.040003,
     "chronos_uni": 0.069082,
     "timesfm_uni": 0.056085,
     "chronos_cov": 0.077817,
     "timesfm_cov": 0.053302,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.163754,
     "cond_climatology": 0.152681,
     "chronos_uni": 0.150117,
     "timesfm_uni": 0.131009,
     "chronos_cov": 0.106616,
     "timesfm_cov": 0.050038,
     "all_flat": 0.249999
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
     "cond_climatology": 0.039645,
     "chronos_uni": 0.064815,
     "timesfm_uni": 0.039953,
     "chronos_cov": 0.078544,
     "timesfm_cov": 0.048968,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.16383,
     "cond_climatology": 0.153638,
     "chronos_uni": 0.152998,
     "timesfm_uni": 0.14802,
     "chronos_cov": 0.115332,
     "timesfm_cov": 0.054839,
     "all_flat": 0.249999
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
     "cond_climatology": 0.053066,
     "chronos_uni": 0.058444,
     "timesfm_uni": 0.040173,
     "chronos_cov": 0.063653,
     "timesfm_cov": 0.047662,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.163906,
     "cond_climatology": 0.25174,
     "chronos_uni": 0.175189,
     "timesfm_uni": 0.147781,
     "chronos_cov": 0.148225,
     "timesfm_cov": 0.055438,
     "all_flat": 0.249999
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
     "cond_climatology": 0.216121,
     "chronos_uni": 0.180538,
     "timesfm_uni": 0.170921,
     "chronos_cov": 0.186761,
     "timesfm_cov": 0.135665,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.050902,
     "cond_climatology": 0.083158,
     "chronos_uni": 0.042922,
     "timesfm_uni": 0.052073,
     "chronos_cov": 0.044937,
     "timesfm_cov": 0.07133,
     "all_flat": 0.0
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
     "cond_climatology": 0.05259,
     "chronos_uni": 0.049324,
     "timesfm_uni": 0.041561,
     "chronos_cov": 0.079885,
     "timesfm_cov": 0.033062,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.131539,
     "cond_climatology": 0.079649,
     "chronos_uni": 0.1354,
     "timesfm_uni": 0.169279,
     "chronos_cov": 0.232699,
     "timesfm_cov": 0.294695,
     "all_flat": 0.249999
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
     "cond_climatology": 0.214403,
     "chronos_uni": 0.155619,
     "timesfm_uni": 0.159202,
     "chronos_cov": 0.090729,
     "timesfm_cov": 0.117572,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.131615,
     "cond_climatology": 0.080295,
     "chronos_uni": 0.136774,
     "timesfm_uni": 0.152709,
     "chronos_cov": 0.23497,
     "timesfm_cov": 0.303741,
     "all_flat": 0.249999
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
     "cond_climatology": 0.289772,
     "chronos_uni": 0.486138,
     "timesfm_uni": 0.368972,
     "chronos_cov": 0.645822,
     "timesfm_cov": 0.474461,
     "all_flat": 0.499999
    },
    "5": {
     "climatology": 0.329801,
     "cond_climatology": 0.222578,
     "chronos_uni": 0.408012,
     "timesfm_uni": 0.376118,
     "chronos_cov": 0.578274,
     "timesfm_cov": 0.575162,
     "all_flat": 0.499999
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
     "cond_climatology": 0.052733,
     "chronos_uni": 0.064497,
     "timesfm_uni": 0.045941,
     "chronos_cov": 0.084215,
     "timesfm_cov": 0.061237,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.131767,
     "cond_climatology": 0.081594,
     "chronos_uni": 0.157907,
     "timesfm_uni": 0.151359,
     "chronos_cov": 0.229047,
     "timesfm_cov": 0.380515,
     "all_flat": 0.249999
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
     "cond_climatology": 0.288184,
     "chronos_uni": 0.439643,
     "timesfm_uni": 0.385499,
     "chronos_cov": 0.444061,
     "timesfm_cov": 0.504118,
     "all_flat": 0.499999
    },
    "5": {
     "climatology": 0.131792,
     "cond_climatology": 0.081922,
     "chronos_uni": 0.171692,
     "timesfm_uni": 0.149228,
     "chronos_cov": 0.203333,
     "timesfm_cov": 0.367579,
     "all_flat": 0.249999
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
     "cond_climatology": 0.214593,
     "chronos_uni": 0.109676,
     "timesfm_uni": 0.128103,
     "chronos_cov": 0.15168,
     "timesfm_cov": 0.092077,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.131694,
     "cond_climatology": 0.081308,
     "chronos_uni": 0.159496,
     "timesfm_uni": 0.156382,
     "chronos_cov": 0.170125,
     "timesfm_cov": 0.333627,
     "all_flat": 0.249999
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
     "cond_climatology": 0.146302,
     "chronos_uni": 0.167272,
     "timesfm_uni": 0.168654,
     "chronos_cov": 0.202726,
     "timesfm_cov": 0.231426,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.050916,
     "cond_climatology": 0.053394,
     "chronos_uni": 0.036444,
     "timesfm_uni": 0.061019,
     "chronos_cov": 0.053083,
     "timesfm_cov": 0.083464,
     "all_flat": 0.0
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
     "cond_climatology": 0.043488,
     "chronos_uni": 0.0638,
     "timesfm_uni": 0.044072,
     "chronos_cov": 0.070861,
     "timesfm_cov": 0.032202,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.05096,
     "cond_climatology": 0.054011,
     "chronos_uni": 0.040017,
     "timesfm_uni": 0.053061,
     "chronos_cov": 0.061778,
     "timesfm_cov": 0.055996,
     "all_flat": 0.0
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
     "cond_climatology": 0.052543,
     "chronos_uni": 0.052534,
     "timesfm_uni": 0.042412,
     "chronos_cov": 0.071223,
     "timesfm_cov": 0.070598,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.050985,
     "cond_climatology": 0.081636,
     "chronos_uni": 0.034483,
     "timesfm_uni": 0.049155,
     "chronos_cov": 0.05406,
     "timesfm_cov": 0.089173,
     "all_flat": 0.0
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
     "cond_climatology": 0.102525,
     "chronos_uni": 0.206913,
     "timesfm_uni": 0.162549,
     "chronos_cov": 0.204056,
     "timesfm_cov": 0.264051,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.05101,
     "cond_climatology": 0.081964,
     "chronos_uni": 0.035811,
     "timesfm_uni": 0.055037,
     "chronos_cov": 0.064183,
     "timesfm_cov": 0.071325,
     "all_flat": 0.0
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
     "cond_climatology": 0.44656,
     "chronos_uni": 0.255767,
     "timesfm_uni": 0.320644,
     "chronos_cov": 0.245659,
     "timesfm_cov": 0.265098,
     "all_flat": 0.499999
    },
    "5": {
     "climatology": 0.051035,
     "cond_climatology": 0.082292,
     "chronos_uni": 0.046498,
     "timesfm_uni": 0.063665,
     "chronos_cov": 0.076749,
     "timesfm_cov": 0.076671,
     "all_flat": 0.0
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
     "cond_climatology": 0.102517,
     "chronos_uni": 0.165251,
     "timesfm_uni": 0.12299,
     "chronos_cov": 0.268291,
     "timesfm_cov": 0.224508,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.131252,
     "cond_climatology": 0.079832,
     "chronos_uni": 0.138752,
     "timesfm_uni": 0.140972,
     "chronos_cov": 0.243455,
     "timesfm_cov": 0.237878,
     "all_flat": 0.249999
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
     "cond_climatology": 0.052869,
     "chronos_uni": 0.066949,
     "timesfm_uni": 0.054602,
     "chronos_cov": 0.097107,
     "timesfm_cov": 0.070764,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.131277,
     "cond_climatology": 0.08016,
     "chronos_uni": 0.162735,
     "timesfm_uni": 0.143939,
     "chronos_cov": 0.260878,
     "timesfm_cov": 0.305904,
     "all_flat": 0.249999
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
     "cond_climatology": 0.052481,
     "chronos_uni": 0.059429,
     "timesfm_uni": 0.049001,
     "chronos_cov": 0.07081,
     "timesfm_cov": 0.080731,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.050922,
     "cond_climatology": 0.080487,
     "chronos_uni": 0.041125,
     "timesfm_uni": 0.060043,
     "chronos_cov": 0.064015,
     "timesfm_cov": 0.109207,
     "all_flat": 0.0
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
     "cond_climatology": 0.141807,
     "chronos_uni": 0.188366,
     "timesfm_uni": 0.158671,
     "chronos_cov": 0.215583,
     "timesfm_cov": 0.230159,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.131327,
     "cond_climatology": 0.114163,
     "chronos_uni": 0.153317,
     "timesfm_uni": 0.164937,
     "chronos_cov": 0.195948,
     "timesfm_cov": 0.273708,
     "all_flat": 0.249999
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
     "cond_climatology": 0.046346,
     "chronos_uni": 0.061052,
     "timesfm_uni": 0.04811,
     "chronos_cov": 0.075717,
     "timesfm_cov": 0.044256,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.050847,
     "cond_climatology": 0.055185,
     "chronos_uni": 0.041052,
     "timesfm_uni": 0.058615,
     "chronos_cov": 0.062067,
     "timesfm_cov": 0.064946,
     "all_flat": 0.0
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
     "cond_climatology": 0.038588,
     "chronos_uni": 0.048429,
     "timesfm_uni": 0.045744,
     "chronos_cov": 0.060239,
     "timesfm_cov": 0.051034,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.050872,
     "cond_climatology": 0.054237,
     "chronos_uni": 0.037423,
     "timesfm_uni": 0.050191,
     "chronos_cov": 0.05284,
     "timesfm_cov": 0.071214,
     "all_flat": 0.0
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
     "cond_climatology": 0.038371,
     "chronos_uni": 0.048318,
     "timesfm_uni": 0.038214,
     "chronos_cov": 0.057289,
     "timesfm_cov": 0.036246,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.386872,
     "cond_climatology": 0.376925,
     "chronos_uni": 0.379481,
     "timesfm_uni": 0.358452,
     "chronos_cov": 0.34801,
     "timesfm_cov": 0.301241,
     "all_flat": 0.499999
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
     "cond_climatology": 0.038156,
     "chronos_uni": 0.040161,
     "timesfm_uni": 0.035863,
     "chronos_cov": 0.050287,
     "timesfm_cov": 0.027355,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.386895,
     "cond_climatology": 0.377119,
     "chronos_uni": 0.383891,
     "timesfm_uni": 0.363267,
     "chronos_cov": 0.333556,
     "timesfm_cov": 0.328068,
     "all_flat": 0.499999
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
     "cond_climatology": 0.149287,
     "chronos_uni": 0.193109,
     "timesfm_uni": 0.174183,
     "chronos_cov": 0.176118,
     "timesfm_cov": 0.251779,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.38698,
     "cond_climatology": 0.377769,
     "chronos_uni": 0.374675,
     "timesfm_uni": 0.344327,
     "chronos_cov": 0.332042,
     "timesfm_cov": 0.285213,
     "all_flat": 0.499999
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
     "cond_climatology": 0.038119,
     "chronos_uni": 0.058469,
     "timesfm_uni": 0.053465,
     "chronos_cov": 0.052543,
     "timesfm_cov": 0.018651,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.387003,
     "cond_climatology": 0.377959,
     "chronos_uni": 0.357546,
     "timesfm_uni": 0.331421,
     "chronos_cov": 0.348304,
     "timesfm_cov": 0.345264,
     "all_flat": 0.499999
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
     "cond_climatology": 0.384704,
     "chronos_uni": 0.318585,
     "timesfm_uni": 0.353053,
     "chronos_cov": 0.35434,
     "timesfm_cov": 0.387443,
     "all_flat": 0.499999
    },
    "5": {
     "climatology": 0.387026,
     "cond_climatology": 0.378149,
     "chronos_uni": 0.37789,
     "timesfm_uni": 0.347275,
     "chronos_cov": 0.333498,
     "timesfm_cov": 0.342592,
     "all_flat": 0.499999
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
     "cond_climatology": 0.160347,
     "chronos_uni": 0.239717,
     "timesfm_uni": 0.219996,
     "chronos_cov": 0.198059,
     "timesfm_cov": 0.278515,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.386741,
     "cond_climatology": 0.376051,
     "chronos_uni": 0.47608,
     "timesfm_uni": 0.415661,
     "chronos_cov": 0.389781,
     "timesfm_cov": 0.490228,
     "all_flat": 0.499999
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
     "cond_climatology": 0.15946,
     "chronos_uni": 0.285697,
     "timesfm_uni": 0.184895,
     "chronos_cov": 0.2738,
     "timesfm_cov": 0.276753,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.050856,
     "cond_climatology": 0.054026,
     "chronos_uni": 0.095151,
     "timesfm_uni": 0.080435,
     "chronos_cov": 0.084361,
     "timesfm_cov": 0.107326,
     "all_flat": 0.0
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
     "cond_climatology": 0.15858,
     "chronos_uni": 0.212595,
     "timesfm_uni": 0.132436,
     "chronos_cov": 0.269222,
     "timesfm_cov": 0.157169,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.050879,
     "cond_climatology": 0.054228,
     "chronos_uni": 0.06835,
     "timesfm_uni": 0.073929,
     "chronos_cov": 0.078152,
     "timesfm_cov": 0.053765,
     "all_flat": 0.0
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
     "cond_climatology": 0.359498,
     "chronos_uni": 0.281515,
     "timesfm_uni": 0.356659,
     "chronos_cov": 0.183823,
     "timesfm_cov": 0.352232,
     "all_flat": 0.499999
    },
    "5": {
     "climatology": 0.131479,
     "cond_climatology": 0.143277,
     "chronos_uni": 0.088449,
     "timesfm_uni": 0.165836,
     "chronos_cov": 0.068985,
     "timesfm_cov": 0.112895,
     "all_flat": 0.249999
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
     "cond_climatology": 0.15835,
     "chronos_uni": 0.224695,
     "timesfm_uni": 0.15757,
     "chronos_cov": 0.3182,
     "timesfm_cov": 0.197348,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.050925,
     "cond_climatology": 0.054645,
     "chronos_uni": 0.045208,
     "timesfm_uni": 0.043213,
     "chronos_cov": 0.059479,
     "timesfm_cov": 0.03071,
     "all_flat": 0.0
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
     "cond_climatology": 0.03899,
     "chronos_uni": 0.033097,
     "timesfm_uni": 0.05503,
     "chronos_cov": 0.067475,
     "timesfm_cov": 0.031261,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.050949,
     "cond_climatology": 0.05486,
     "chronos_uni": 0.039957,
     "timesfm_uni": 0.05387,
     "chronos_cov": 0.04334,
     "timesfm_cov": 0.029689,
     "all_flat": 0.0
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
     "cond_climatology": 0.038778,
     "chronos_uni": 0.038236,
     "timesfm_uni": 0.049197,
     "chronos_cov": 0.055888,
     "timesfm_cov": 0.026493,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.050911,
     "cond_climatology": 0.054561,
     "chronos_uni": 0.035996,
     "timesfm_uni": 0.043214,
     "chronos_cov": 0.038917,
     "timesfm_cov": 0.02046,
     "all_flat": 0.0
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
     "cond_climatology": 0.038567,
     "chronos_uni": 0.029867,
     "timesfm_uni": 0.050293,
     "chronos_cov": 0.038935,
     "timesfm_cov": 0.029429,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.050874,
     "cond_climatology": 0.054264,
     "chronos_uni": 0.03126,
     "timesfm_uni": 0.043404,
     "chronos_cov": 0.037644,
     "timesfm_cov": 0.020014,
     "all_flat": 0.0
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
     "cond_climatology": 0.151129,
     "chronos_uni": 0.193997,
     "timesfm_uni": 0.152701,
     "chronos_cov": 0.133242,
     "timesfm_cov": 0.175147,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.163885,
     "cond_climatology": 0.142718,
     "chronos_uni": 0.160989,
     "timesfm_uni": 0.156065,
     "chronos_cov": 0.185469,
     "timesfm_cov": 0.161756,
     "all_flat": 0.249999
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
     "cond_climatology": 0.158441,
     "chronos_uni": 0.157887,
     "timesfm_uni": 0.140141,
     "chronos_cov": 0.177608,
     "timesfm_cov": 0.096295,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.050861,
     "cond_climatology": 0.054109,
     "chronos_uni": 0.033047,
     "timesfm_uni": 0.042428,
     "chronos_cov": 0.038273,
     "timesfm_cov": 0.059081,
     "all_flat": 0.0
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
     "cond_climatology": 0.038667,
     "chronos_uni": 0.029443,
     "timesfm_uni": 0.050599,
     "chronos_cov": 0.039566,
     "timesfm_cov": 0.036642,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.050824,
     "cond_climatology": 0.053817,
     "chronos_uni": 0.034499,
     "timesfm_uni": 0.043536,
     "chronos_cov": 0.036976,
     "timesfm_cov": 0.031003,
     "all_flat": 0.0
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
     "cond_climatology": 0.038459,
     "chronos_uni": 0.032383,
     "timesfm_uni": 0.048843,
     "chronos_cov": 0.039175,
     "timesfm_cov": 0.022638,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.050787,
     "cond_climatology": 0.053527,
     "chronos_uni": 0.036177,
     "timesfm_uni": 0.044711,
     "chronos_cov": 0.036032,
     "timesfm_cov": 0.018887,
     "all_flat": 0.0
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
     "cond_climatology": 0.038252,
     "chronos_uni": 0.033177,
     "timesfm_uni": 0.044903,
     "chronos_cov": 0.038217,
     "timesfm_cov": 0.019522,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.05075,
     "cond_climatology": 0.05324,
     "chronos_uni": 0.030885,
     "timesfm_uni": 0.041385,
     "chronos_cov": 0.035174,
     "timesfm_cov": 0.015482,
     "all_flat": 0.0
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
     "cond_climatology": 0.151318,
     "chronos_uni": 0.271503,
     "timesfm_uni": 0.156184,
     "chronos_cov": 0.222502,
     "timesfm_cov": 0.163548,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.050762,
     "cond_climatology": 0.053384,
     "chronos_uni": 0.035556,
     "timesfm_uni": 0.041319,
     "chronos_cov": 0.037966,
     "timesfm_cov": 0.020971,
     "all_flat": 0.0
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
     "cond_climatology": 0.133947,
     "chronos_uni": 0.126426,
     "timesfm_uni": 0.133068,
     "chronos_cov": 0.192126,
     "timesfm_cov": 0.168956,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.050725,
     "cond_climatology": 0.041335,
     "chronos_uni": 0.033332,
     "timesfm_uni": 0.041559,
     "chronos_cov": 0.041506,
     "timesfm_cov": 0.016654,
     "all_flat": 0.0
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
     "cond_climatology": 0.039835,
     "chronos_uni": 0.046489,
     "timesfm_uni": 0.044028,
     "chronos_cov": 0.033179,
     "timesfm_cov": 0.014596,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.050688,
     "cond_climatology": 0.057826,
     "chronos_uni": 0.031484,
     "timesfm_uni": 0.038185,
     "chronos_cov": 0.032339,
     "timesfm_cov": 0.016417,
     "all_flat": 0.0
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
     "cond_climatology": 0.167259,
     "chronos_uni": 0.122999,
     "timesfm_uni": 0.143781,
     "chronos_cov": 0.162385,
     "timesfm_cov": 0.188327,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.050651,
     "cond_climatology": 0.057314,
     "chronos_uni": 0.028166,
     "timesfm_uni": 0.034283,
     "chronos_cov": 0.031307,
     "timesfm_cov": 0.028069,
     "all_flat": 0.0
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
     "cond_climatology": 0.039676,
     "chronos_uni": 0.028824,
     "timesfm_uni": 0.035152,
     "chronos_cov": 0.037591,
     "timesfm_cov": 0.033265,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.050614,
     "cond_climatology": 0.056808,
     "chronos_uni": 0.028333,
     "timesfm_uni": 0.032079,
     "chronos_cov": 0.035512,
     "timesfm_cov": 0.054603,
     "all_flat": 0.0
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
     "cond_climatology": 0.139548,
     "chronos_uni": 0.192494,
     "timesfm_uni": 0.1624,
     "chronos_cov": 0.123013,
     "timesfm_cov": 0.146646,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.050577,
     "cond_climatology": 0.056308,
     "chronos_uni": 0.028557,
     "timesfm_uni": 0.034031,
     "chronos_cov": 0.031407,
     "timesfm_cov": 0.041198,
     "all_flat": 0.0
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
     "cond_climatology": 0.039642,
     "chronos_uni": 0.029462,
     "timesfm_uni": 0.044873,
     "chronos_cov": 0.042904,
     "timesfm_cov": 0.021882,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.163894,
     "cond_climatology": 0.154499,
     "chronos_uni": 0.141956,
     "timesfm_uni": 0.127242,
     "chronos_cov": 0.176498,
     "timesfm_cov": 0.222165,
     "all_flat": 0.249999
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
     "cond_climatology": 0.043137,
     "chronos_uni": 0.026712,
     "timesfm_uni": 0.044115,
     "chronos_cov": 0.026708,
     "timesfm_cov": 0.023802,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.050503,
     "cond_climatology": 0.053574,
     "chronos_uni": 0.024363,
     "timesfm_uni": 0.035384,
     "chronos_cov": 0.030871,
     "timesfm_cov": 0.029207,
     "all_flat": 0.0
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
     "cond_climatology": 0.157709,
     "chronos_uni": 0.154221,
     "timesfm_uni": 0.137639,
     "chronos_cov": 0.18947,
     "timesfm_cov": 0.204215,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.16392,
     "cond_climatology": 0.19024,
     "chronos_uni": 0.155575,
     "timesfm_uni": 0.124362,
     "chronos_cov": 0.162024,
     "timesfm_cov": 0.188984,
     "all_flat": 0.249999
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
     "cond_climatology": 0.052423,
     "chronos_uni": 0.027962,
     "timesfm_uni": 0.041144,
     "chronos_cov": 0.027707,
     "timesfm_cov": 0.022143,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.163933,
     "cond_climatology": 0.247481,
     "chronos_uni": 0.159811,
     "timesfm_uni": 0.117484,
     "chronos_cov": 0.149264,
     "timesfm_cov": 0.188195,
     "all_flat": 0.249999
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
     "cond_climatology": 0.042447,
     "chronos_uni": 0.025684,
     "timesfm_uni": 0.042682,
     "chronos_cov": 0.026306,
     "timesfm_cov": 0.023352,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.163946,
     "cond_climatology": 0.190267,
     "chronos_uni": 0.13795,
     "timesfm_uni": 0.119936,
     "chronos_cov": 0.159086,
     "timesfm_cov": 0.19214,
     "all_flat": 0.249999
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
     "cond_climatology": 0.052041,
     "chronos_uni": 0.028354,
     "timesfm_uni": 0.042971,
     "chronos_cov": 0.023382,
     "timesfm_cov": 0.020133,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.163827,
     "cond_climatology": 0.245678,
     "chronos_uni": 0.125554,
     "timesfm_uni": 0.119777,
     "chronos_cov": 0.163645,
     "timesfm_cov": 0.190512,
     "all_flat": 0.249999
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
     "cond_climatology": 0.042108,
     "chronos_uni": 0.027297,
     "timesfm_uni": 0.042757,
     "chronos_cov": 0.025434,
     "timesfm_cov": 0.02048,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.050369,
     "cond_climatology": 0.052296,
     "chronos_uni": 0.032686,
     "timesfm_uni": 0.039645,
     "chronos_cov": 0.029263,
     "timesfm_cov": 0.032777,
     "all_flat": 0.0
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
     "cond_climatology": 0.041773,
     "chronos_uni": 0.024154,
     "timesfm_uni": 0.044968,
     "chronos_cov": 0.027433,
     "timesfm_cov": 0.017773,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.050382,
     "cond_climatology": 0.052329,
     "chronos_uni": 0.031163,
     "timesfm_uni": 0.038025,
     "chronos_cov": 0.029187,
     "timesfm_cov": 0.033229,
     "all_flat": 0.0
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
     "cond_climatology": 0.158506,
     "chronos_uni": 0.145908,
     "timesfm_uni": 0.133138,
     "chronos_cov": 0.163252,
     "timesfm_cov": 0.195014,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.050395,
     "cond_climatology": 0.052367,
     "chronos_uni": 0.033477,
     "timesfm_uni": 0.039966,
     "chronos_cov": 0.029907,
     "timesfm_cov": 0.030515,
     "all_flat": 0.0
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
     "cond_climatology": 0.039835,
     "chronos_uni": 0.03227,
     "timesfm_uni": 0.064437,
     "chronos_cov": 0.032378,
     "timesfm_cov": 0.024382,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.132346,
     "cond_climatology": 0.135686,
     "chronos_uni": 0.166925,
     "timesfm_uni": 0.165347,
     "chronos_cov": 0.177121,
     "timesfm_cov": 0.119127,
     "all_flat": 0.249999
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
     "cond_climatology": 0.356881,
     "chronos_uni": 0.43206,
     "timesfm_uni": 0.318513,
     "chronos_cov": 0.408747,
     "timesfm_cov": 0.364413,
     "all_flat": 0.499999
    },
    "5": {
     "climatology": 0.13242,
     "cond_climatology": 0.136607,
     "chronos_uni": 0.177116,
     "timesfm_uni": 0.149493,
     "chronos_cov": 0.165668,
     "timesfm_cov": 0.102685,
     "all_flat": 0.249999
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
     "cond_climatology": 0.039945,
     "chronos_uni": 0.054031,
     "timesfm_uni": 0.067492,
     "chronos_cov": 0.043361,
     "timesfm_cov": 0.021006,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.050385,
     "cond_climatology": 0.055687,
     "chronos_uni": 0.040862,
     "timesfm_uni": 0.048572,
     "chronos_cov": 0.035754,
     "timesfm_cov": 0.039347,
     "all_flat": 0.0
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
     "cond_climatology": 0.166756,
     "chronos_uni": 0.079921,
     "timesfm_uni": 0.113703,
     "chronos_cov": 0.127815,
     "timesfm_cov": 0.198466,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.050348,
     "cond_climatology": 0.055208,
     "chronos_uni": 0.037093,
     "timesfm_uni": 0.041757,
     "chronos_cov": 0.032387,
     "timesfm_cov": 0.044173,
     "all_flat": 0.0
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
     "cond_climatology": 0.139577,
     "chronos_uni": 0.19412,
     "timesfm_uni": 0.169083,
     "chronos_cov": 0.150976,
     "timesfm_cov": 0.146324,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.050312,
     "cond_climatology": 0.054735,
     "chronos_uni": 0.03634,
     "timesfm_uni": 0.045667,
     "chronos_cov": 0.031349,
     "timesfm_cov": 0.049426,
     "all_flat": 0.0
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
     "cond_climatology": 0.040096,
     "chronos_uni": 0.051937,
     "timesfm_uni": 0.057998,
     "chronos_cov": 0.039455,
     "timesfm_cov": 0.023729,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.163477,
     "cond_climatology": 0.153275,
     "chronos_uni": 0.122126,
     "timesfm_uni": 0.127699,
     "chronos_cov": 0.153864,
     "timesfm_cov": 0.224878,
     "all_flat": 0.249999
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
     "cond_climatology": 0.039756,
     "chronos_uni": 0.058665,
     "timesfm_uni": 0.047466,
     "chronos_cov": 0.043527,
     "timesfm_cov": 0.023633,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.38539,
     "cond_climatology": 0.363748,
     "chronos_uni": 0.332841,
     "timesfm_uni": 0.366354,
     "chronos_cov": 0.369898,
     "timesfm_cov": 0.475512,
     "all_flat": 0.499999
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
     "cond_climatology": 0.134288,
     "chronos_uni": 0.089526,
     "timesfm_uni": 0.137178,
     "chronos_cov": 0.129363,
     "timesfm_cov": 0.208626,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.385413,
     "cond_climatology": 0.331721,
     "chronos_uni": 0.347901,
     "timesfm_uni": 0.374719,
     "chronos_cov": 0.368803,
     "timesfm_cov": 0.520708,
     "all_flat": 0.499999
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
     "cond_climatology": 0.038815,
     "chronos_uni": 0.038943,
     "timesfm_uni": 0.044897,
     "chronos_cov": 0.0354,
     "timesfm_cov": 0.05825,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.385436,
     "cond_climatology": 0.33228,
     "chronos_uni": 0.372508,
     "timesfm_uni": 0.372405,
     "chronos_cov": 0.396742,
     "timesfm_cov": 0.559272,
     "all_flat": 0.499999
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
     "cond_climatology": 0.038477,
     "chronos_uni": 0.031966,
     "timesfm_uni": 0.042685,
     "chronos_cov": 0.040595,
     "timesfm_cov": 0.053904,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.38546,
     "cond_climatology": 0.332836,
     "chronos_uni": 0.378443,
     "timesfm_uni": 0.377127,
     "chronos_cov": 0.425467,
     "timesfm_cov": 0.575078,
     "all_flat": 0.499999
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
     "cond_climatology": 0.359882,
     "chronos_uni": 0.339368,
     "timesfm_uni": 0.345916,
     "chronos_cov": 0.41675,
     "timesfm_cov": 0.437398,
     "all_flat": 0.499999
    },
    "5": {
     "climatology": 0.385351,
     "cond_climatology": 0.331947,
     "chronos_uni": 0.367213,
     "timesfm_uni": 0.365514,
     "chronos_cov": 0.398884,
     "timesfm_cov": 0.561435,
     "all_flat": 0.499999
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
     "cond_climatology": 0.038591,
     "chronos_uni": 0.035442,
     "timesfm_uni": 0.052499,
     "chronos_cov": 0.040379,
     "timesfm_cov": 0.059902,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.050287,
     "cond_climatology": 0.041201,
     "chronos_uni": 0.042682,
     "timesfm_uni": 0.046771,
     "chronos_cov": 0.03732,
     "timesfm_cov": 0.13787,
     "all_flat": 0.0
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
     "cond_climatology": 0.133087,
     "chronos_uni": 0.197001,
     "timesfm_uni": 0.140654,
     "chronos_cov": 0.188968,
     "timesfm_cov": 0.194252,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.050311,
     "cond_climatology": 0.041766,
     "chronos_uni": 0.041242,
     "timesfm_uni": 0.049075,
     "chronos_cov": 0.037312,
     "timesfm_cov": 0.101157,
     "all_flat": 0.0
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
     "cond_climatology": 0.038599,
     "chronos_uni": 0.035679,
     "timesfm_uni": 0.05605,
     "chronos_cov": 0.041409,
     "timesfm_cov": 0.09218,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.050334,
     "cond_climatology": 0.042338,
     "chronos_uni": 0.044372,
     "timesfm_uni": 0.057143,
     "chronos_cov": 0.043487,
     "timesfm_cov": 0.182265,
     "all_flat": 0.0
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
     "cond_climatology": 0.175022,
     "chronos_uni": 0.119415,
     "timesfm_uni": 0.152365,
     "chronos_cov": 0.088529,
     "timesfm_cov": 0.086509,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.050358,
     "cond_climatology": 0.042918,
     "chronos_uni": 0.04285,
     "timesfm_uni": 0.051749,
     "chronos_cov": 0.043849,
     "timesfm_cov": 0.115586,
     "all_flat": 0.0
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
     "cond_climatology": 0.038429,
     "chronos_uni": 0.033031,
     "timesfm_uni": 0.048616,
     "chronos_cov": 0.036762,
     "timesfm_cov": 0.043076,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.162932,
     "cond_climatology": 0.116908,
     "chronos_uni": 0.140836,
     "timesfm_uni": 0.120611,
     "chronos_cov": 0.176446,
     "timesfm_cov": 0.266432,
     "all_flat": 0.249999
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
     "cond_climatology": 0.038104,
     "chronos_uni": 0.033929,
     "timesfm_uni": 0.051034,
     "chronos_cov": 0.032089,
     "timesfm_cov": 0.028777,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.050345,
     "cond_climatology": 0.043136,
     "chronos_uni": 0.038715,
     "timesfm_uni": 0.051454,
     "chronos_cov": 0.030564,
     "timesfm_cov": 0.052175,
     "all_flat": 0.0
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
     "cond_climatology": 0.037783,
     "chronos_uni": 0.036986,
     "timesfm_uni": 0.054275,
     "chronos_cov": 0.033231,
     "timesfm_cov": 0.030353,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.050309,
     "cond_climatology": 0.042773,
     "chronos_uni": 0.038641,
     "timesfm_uni": 0.050371,
     "chronos_cov": 0.027714,
     "timesfm_cov": 0.049978,
     "all_flat": 0.0
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
     "cond_climatology": 0.147927,
     "chronos_uni": 0.119872,
     "timesfm_uni": 0.132963,
     "chronos_cov": 0.151107,
     "timesfm_cov": 0.198769,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.132943,
     "cond_climatology": 0.196686,
     "chronos_uni": 0.178784,
     "timesfm_uni": 0.184373,
     "chronos_cov": 0.174826,
     "timesfm_cov": 0.077685,
     "all_flat": 0.249999
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
     "cond_climatology": 0.032842,
     "chronos_uni": 0.034537,
     "timesfm_uni": 0.044343,
     "chronos_cov": 0.029915,
     "timesfm_cov": 0.040776,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.132967,
     "cond_climatology": 0.196689,
     "chronos_uni": 0.183025,
     "timesfm_uni": 0.187735,
     "chronos_cov": 0.172222,
     "timesfm_cov": 0.08023,
     "all_flat": 0.249999
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
     "cond_climatology": 0.40386,
     "chronos_uni": 0.433989,
     "timesfm_uni": 0.385429,
     "chronos_cov": 0.444847,
     "timesfm_cov": 0.323335,
     "all_flat": 0.499999
    },
    "5": {
     "climatology": 0.133041,
     "cond_climatology": 0.197338,
     "chronos_uni": 0.187042,
     "timesfm_uni": 0.176224,
     "chronos_cov": 0.196082,
     "timesfm_cov": 0.086578,
     "all_flat": 0.249999
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
     "cond_climatology": 0.032839,
     "chronos_uni": 0.058498,
     "timesfm_uni": 0.057825,
     "chronos_cov": 0.049738,
     "timesfm_cov": 0.028191,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.050213,
     "cond_climatology": 0.052339,
     "chronos_uni": 0.053899,
     "timesfm_uni": 0.051311,
     "chronos_cov": 0.044381,
     "timesfm_cov": 0.045944,
     "all_flat": 0.0
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
     "cond_climatology": 0.168003,
     "chronos_uni": 0.236585,
     "timesfm_uni": 0.198177,
     "chronos_cov": 0.237926,
     "timesfm_cov": 0.162297,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.162894,
     "cond_climatology": 0.109301,
     "chronos_uni": 0.102961,
     "timesfm_uni": 0.112305,
     "chronos_cov": 0.106338,
     "timesfm_cov": 0.166901,
     "all_flat": 0.249999
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
     "cond_climatology": 0.032786,
     "chronos_uni": 0.063321,
     "timesfm_uni": 0.0557,
     "chronos_cov": 0.057639,
     "timesfm_cov": 0.019165,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.384076,
     "cond_climatology": 0.30034,
     "chronos_uni": 0.31076,
     "timesfm_uni": 0.335124,
     "chronos_cov": 0.325032,
     "timesfm_cov": 0.387943,
     "all_flat": 0.499999
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
     "cond_climatology": 0.03257,
     "chronos_uni": 0.081604,
     "timesfm_uni": 0.063091,
     "chronos_cov": 0.06506,
     "timesfm_cov": 0.016714,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.38416,
     "cond_climatology": 0.30118,
     "chronos_uni": 0.330502,
     "timesfm_uni": 0.335433,
     "chronos_cov": 0.322254,
     "timesfm_cov": 0.393287,
     "all_flat": 0.499999
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
     "cond_climatology": 0.381427,
     "chronos_uni": 0.292127,
     "timesfm_uni": 0.314384,
     "chronos_cov": 0.271942,
     "timesfm_cov": 0.407505,
     "all_flat": 0.499999
    },
    "5": {
     "climatology": 0.384244,
     "cond_climatology": 0.367694,
     "chronos_uni": 0.351837,
     "timesfm_uni": 0.36087,
     "chronos_cov": 0.316323,
     "timesfm_cov": 0.403722,
     "all_flat": 0.499999
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
     "cond_climatology": 0.379396,
     "chronos_uni": 0.377465,
     "timesfm_uni": 0.332655,
     "chronos_cov": 0.353974,
     "timesfm_cov": 0.403006,
     "all_flat": 0.499999
    },
    "5": {
     "climatology": 0.050213,
     "cond_climatology": 0.053237,
     "chronos_uni": 0.041988,
     "timesfm_uni": 0.044528,
     "chronos_cov": 0.029258,
     "timesfm_cov": 0.048774,
     "all_flat": 0.0
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
     "cond_climatology": 0.038284,
     "chronos_uni": 0.038591,
     "timesfm_uni": 0.056031,
     "chronos_cov": 0.048435,
     "timesfm_cov": 0.024458,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.050226,
     "cond_climatology": 0.053381,
     "chronos_uni": 0.050111,
     "timesfm_uni": 0.046432,
     "chronos_cov": 0.033669,
     "timesfm_cov": 0.040895,
     "all_flat": 0.0
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
     "cond_climatology": 0.377604,
     "chronos_uni": 0.418536,
     "timesfm_uni": 0.378928,
     "chronos_cov": 0.432735,
     "timesfm_cov": 0.418963,
     "all_flat": 0.499999
    },
    "5": {
     "climatology": 0.132983,
     "cond_climatology": 0.145769,
     "chronos_uni": 0.131746,
     "timesfm_uni": 0.132894,
     "chronos_cov": 0.111862,
     "timesfm_cov": 0.091488,
     "all_flat": 0.249999
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
     "cond_climatology": 0.153387,
     "chronos_uni": 0.141502,
     "timesfm_uni": 0.138976,
     "chronos_cov": 0.100213,
     "timesfm_cov": 0.124059,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.133067,
     "cond_climatology": 0.146404,
     "chronos_uni": 0.130505,
     "timesfm_uni": 0.122958,
     "chronos_cov": 0.086134,
     "timesfm_cov": 0.064842,
     "all_flat": 0.249999
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
     "cond_climatology": 0.360515,
     "chronos_uni": 0.306892,
     "timesfm_uni": 0.301954,
     "chronos_cov": 0.259315,
     "timesfm_cov": 0.348673,
     "all_flat": 0.499999
    },
    "5": {
     "climatology": 0.050298,
     "cond_climatology": 0.047378,
     "chronos_uni": 0.061876,
     "timesfm_uni": 0.0564,
     "chronos_cov": 0.076664,
     "timesfm_cov": 0.089691,
     "all_flat": 0.0
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
     "cond_climatology": 0.040209,
     "chronos_uni": 0.047855,
     "timesfm_uni": 0.073889,
     "chronos_cov": 0.075127,
     "timesfm_cov": 0.03079,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.050261,
     "cond_climatology": 0.054771,
     "chronos_uni": 0.067345,
     "timesfm_uni": 0.067517,
     "chronos_cov": 0.074188,
     "timesfm_cov": 0.084108,
     "all_flat": 0.0
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
     "cond_climatology": 0.140317,
     "chronos_uni": 0.182827,
     "timesfm_uni": 0.163929,
     "chronos_cov": 0.150647,
     "timesfm_cov": 0.121847,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.162716,
     "cond_climatology": 0.179442,
     "chronos_uni": 0.147102,
     "timesfm_uni": 0.11303,
     "chronos_cov": 0.145175,
     "timesfm_cov": 0.260987,
     "all_flat": 0.249999
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
     "cond_climatology": 0.134586,
     "chronos_uni": 0.135424,
     "timesfm_uni": 0.132648,
     "chronos_cov": 0.109445,
     "timesfm_cov": 0.164087,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.16279,
     "cond_climatology": 0.118437,
     "chronos_uni": 0.153476,
     "timesfm_uni": 0.108506,
     "chronos_cov": 0.09973,
     "timesfm_cov": 0.226072,
     "all_flat": 0.249999
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
     "cond_climatology": 0.165919,
     "chronos_uni": 0.138731,
     "timesfm_uni": 0.125223,
     "chronos_cov": 0.178253,
     "timesfm_cov": 0.176125,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.050273,
     "cond_climatology": 0.055026,
     "chronos_uni": 0.064557,
     "timesfm_uni": 0.062955,
     "chronos_cov": 0.042876,
     "timesfm_cov": 0.06018,
     "all_flat": 0.0
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
     "cond_climatology": 0.173211,
     "chronos_uni": 0.164443,
     "timesfm_uni": 0.171283,
     "chronos_cov": 0.067941,
     "timesfm_cov": 0.118873,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.133031,
     "cond_climatology": 0.198307,
     "chronos_uni": 0.155113,
     "timesfm_uni": 0.174264,
     "chronos_cov": 0.047019,
     "timesfm_cov": 0.084006,
     "all_flat": 0.249999
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
     "cond_climatology": 0.156536,
     "chronos_uni": 0.10775,
     "timesfm_uni": 0.127378,
     "chronos_cov": 0.105871,
     "timesfm_cov": 0.176253,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.050201,
     "cond_climatology": 0.053528,
     "chronos_uni": 0.067267,
     "timesfm_uni": 0.069058,
     "chronos_cov": 0.051725,
     "timesfm_cov": 0.065263,
     "all_flat": 0.0
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
     "cond_climatology": 0.155713,
     "chronos_uni": 0.108247,
     "timesfm_uni": 0.128285,
     "chronos_cov": 0.14577,
     "timesfm_cov": 0.160392,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.133128,
     "cond_climatology": 0.147095,
     "chronos_uni": 0.17368,
     "timesfm_uni": 0.15997,
     "chronos_cov": 0.125764,
     "timesfm_cov": 0.084855,
     "all_flat": 0.249999
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
     "cond_climatology": 0.153585,
     "chronos_uni": 0.182297,
     "timesfm_uni": 0.151811,
     "chronos_cov": 0.188079,
     "timesfm_cov": 0.140558,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.133202,
     "cond_climatology": 0.147653,
     "chronos_uni": 0.175467,
     "timesfm_uni": 0.149266,
     "chronos_cov": 0.180982,
     "timesfm_cov": 0.084771,
     "all_flat": 0.249999
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
     "cond_climatology": 0.152782,
     "chronos_uni": 0.179871,
     "timesfm_uni": 0.159936,
     "chronos_cov": 0.126705,
     "timesfm_cov": 0.145499,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.133226,
     "cond_climatology": 0.147781,
     "chronos_uni": 0.184347,
     "timesfm_uni": 0.166284,
     "chronos_cov": 0.170215,
     "timesfm_cov": 0.093758,
     "all_flat": 0.249999
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
     "cond_climatology": 0.038438,
     "chronos_uni": 0.070428,
     "timesfm_uni": 0.078639,
     "chronos_cov": 0.102162,
     "timesfm_cov": 0.029501,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.13313,
     "cond_climatology": 0.196658,
     "chronos_uni": 0.225334,
     "timesfm_uni": 0.202325,
     "chronos_cov": 0.291725,
     "timesfm_cov": 0.110416,
     "all_flat": 0.249999
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
     "cond_climatology": 0.038119,
     "chronos_uni": 0.053804,
     "timesfm_uni": 0.075383,
     "chronos_cov": 0.059912,
     "timesfm_cov": 0.041644,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.050179,
     "cond_climatology": 0.042139,
     "chronos_uni": 0.058329,
     "timesfm_uni": 0.06615,
     "chronos_cov": 0.067712,
     "timesfm_cov": 0.046292,
     "all_flat": 0.0
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
     "cond_climatology": 0.172102,
     "chronos_uni": 0.166132,
     "timesfm_uni": 0.182309,
     "chronos_cov": 0.197099,
     "timesfm_cov": 0.097368,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.050203,
     "cond_climatology": 0.042189,
     "chronos_uni": 0.052798,
     "timesfm_uni": 0.064332,
     "chronos_cov": 0.057086,
     "timesfm_cov": 0.057071,
     "all_flat": 0.0
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
     "cond_climatology": 0.032738,
     "chronos_uni": 0.046795,
     "timesfm_uni": 0.074688,
     "chronos_cov": 0.058921,
     "timesfm_cov": 0.038531,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.162902,
     "cond_climatology": 0.111228,
     "chronos_uni": 0.127454,
     "timesfm_uni": 0.11311,
     "chronos_cov": 0.111492,
     "timesfm_cov": 0.195422,
     "all_flat": 0.249999
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
     "cond_climatology": 0.16613,
     "chronos_uni": 0.166431,
     "timesfm_uni": 0.193394,
     "chronos_cov": 0.228244,
     "timesfm_cov": 0.128574,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.050251,
     "cond_climatology": 0.052034,
     "chronos_uni": 0.049752,
     "timesfm_uni": 0.060458,
     "chronos_cov": 0.048016,
     "timesfm_cov": 0.034353,
     "all_flat": 0.0
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
     "cond_climatology": 0.389746,
     "chronos_uni": 0.342177,
     "timesfm_uni": 0.278293,
     "chronos_cov": 0.286737,
     "timesfm_cov": 0.42298,
     "all_flat": 0.499999
    },
    "5": {
     "climatology": 0.163048,
     "cond_climatology": 0.176934,
     "chronos_uni": 0.127726,
     "timesfm_uni": 0.1225,
     "chronos_cov": 0.093822,
     "timesfm_cov": 0.170236,
     "all_flat": 0.249999
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
     "cond_climatology": 0.032856,
     "chronos_uni": 0.048918,
     "timesfm_uni": 0.067241,
     "chronos_cov": 0.060618,
     "timesfm_cov": 0.023851,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.050239,
     "cond_climatology": 0.051695,
     "chronos_uni": 0.050193,
     "timesfm_uni": 0.061173,
     "chronos_cov": 0.052977,
     "timesfm_cov": 0.025468,
     "all_flat": 0.0
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
     "cond_climatology": 0.36054,
     "chronos_uni": 0.423442,
     "timesfm_uni": 0.331618,
     "chronos_cov": 0.364479,
     "timesfm_cov": 0.410706,
     "all_flat": 0.499999
    },
    "5": {
     "climatology": 0.050203,
     "cond_climatology": 0.041842,
     "chronos_uni": 0.049146,
     "timesfm_uni": 0.063189,
     "chronos_cov": 0.042826,
     "timesfm_cov": 0.023974,
     "all_flat": 0.0
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
     "cond_climatology": 0.167559,
     "chronos_uni": 0.116392,
     "timesfm_uni": 0.155983,
     "chronos_cov": 0.154726,
     "timesfm_cov": 0.168745,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.132894,
     "cond_climatology": 0.192856,
     "chronos_uni": 0.131449,
     "timesfm_uni": 0.131437,
     "chronos_cov": 0.152763,
     "timesfm_cov": 0.175697,
     "all_flat": 0.249999
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
     "cond_climatology": 0.033356,
     "chronos_uni": 0.048633,
     "timesfm_uni": 0.064436,
     "chronos_cov": 0.049528,
     "timesfm_cov": 0.025056,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.05018,
     "cond_climatology": 0.05164,
     "chronos_uni": 0.052301,
     "timesfm_uni": 0.06767,
     "chronos_cov": 0.043377,
     "timesfm_cov": 0.026481,
     "all_flat": 0.0
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
     "cond_climatology": 0.037188,
     "chronos_uni": 0.039967,
     "timesfm_uni": 0.054785,
     "chronos_cov": 0.043754,
     "timesfm_cov": 0.027813,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.050194,
     "cond_climatology": 0.042201,
     "chronos_uni": 0.047884,
     "timesfm_uni": 0.0595,
     "chronos_cov": 0.03776,
     "timesfm_cov": 0.026317,
     "all_flat": 0.0
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
     "cond_climatology": 0.172599,
     "chronos_uni": 0.166473,
     "timesfm_uni": 0.146511,
     "chronos_cov": 0.120619,
     "timesfm_cov": 0.128655,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.050158,
     "cond_climatology": 0.041858,
     "chronos_uni": 0.046437,
     "timesfm_uni": 0.057961,
     "chronos_cov": 0.039634,
     "timesfm_cov": 0.039629,
     "all_flat": 0.0
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
     "cond_climatology": 0.03352,
     "chronos_uni": 0.044189,
     "timesfm_uni": 0.054258,
     "chronos_cov": 0.044053,
     "timesfm_cov": 0.029209,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.050122,
     "cond_climatology": 0.051306,
     "chronos_uni": 0.047697,
     "timesfm_uni": 0.057332,
     "chronos_cov": 0.037989,
     "timesfm_cov": 0.023926,
     "all_flat": 0.0
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
     "cond_climatology": 0.136179,
     "chronos_uni": 0.157611,
     "timesfm_uni": 0.131504,
     "chronos_cov": 0.176357,
     "timesfm_cov": 0.201877,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.132943,
     "cond_climatology": 0.194349,
     "chronos_uni": 0.135808,
     "timesfm_uni": 0.144692,
     "chronos_cov": 0.12466,
     "timesfm_cov": 0.113148,
     "all_flat": 0.249999
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
     "cond_climatology": 0.039054,
     "chronos_uni": 0.043474,
     "timesfm_uni": 0.045516,
     "chronos_cov": 0.047867,
     "timesfm_cov": 0.041597,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.05011,
     "cond_climatology": 0.053261,
     "chronos_uni": 0.047021,
     "timesfm_uni": 0.050142,
     "chronos_cov": 0.039563,
     "timesfm_cov": 0.054831,
     "all_flat": 0.0
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
     "cond_climatology": 0.038851,
     "chronos_uni": 0.035062,
     "timesfm_uni": 0.048118,
     "chronos_cov": 0.03757,
     "timesfm_cov": 0.032233,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.050074,
     "cond_climatology": 0.052984,
     "chronos_uni": 0.042799,
     "timesfm_uni": 0.050679,
     "chronos_cov": 0.033423,
     "timesfm_cov": 0.037926,
     "all_flat": 0.0
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
     "cond_climatology": 0.172929,
     "chronos_uni": 0.155969,
     "timesfm_uni": 0.182384,
     "chronos_cov": 0.149763,
     "timesfm_cov": 0.162695,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.133015,
     "cond_climatology": 0.194406,
     "chronos_uni": 0.161066,
     "timesfm_uni": 0.167686,
     "chronos_cov": 0.167287,
     "timesfm_cov": 0.129519,
     "all_flat": 0.249999
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
     "cond_climatology": 0.171538,
     "chronos_uni": 0.140573,
     "timesfm_uni": 0.171674,
     "chronos_cov": 0.154181,
     "timesfm_cov": 0.171655,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.050003,
     "cond_climatology": 0.041237,
     "chronos_uni": 0.043381,
     "timesfm_uni": 0.051961,
     "chronos_cov": 0.035958,
     "timesfm_cov": 0.024191,
     "all_flat": 0.0
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
     "cond_climatology": 0.375365,
     "chronos_uni": 0.338884,
     "timesfm_uni": 0.300202,
     "chronos_cov": 0.321494,
     "timesfm_cov": 0.36999,
     "all_flat": 0.499999
    },
    "5": {
     "climatology": 0.163079,
     "cond_climatology": 0.140774,
     "chronos_uni": 0.115846,
     "timesfm_uni": 0.130897,
     "chronos_cov": 0.069899,
     "timesfm_cov": 0.168127,
     "all_flat": 0.249999
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
     "cond_climatology": 0.039226,
     "chronos_uni": 0.048026,
     "timesfm_uni": 0.052659,
     "chronos_cov": 0.044146,
     "timesfm_cov": 0.029063,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.132968,
     "cond_climatology": 0.147397,
     "chronos_uni": 0.128676,
     "timesfm_uni": 0.137708,
     "chronos_cov": 0.19997,
     "timesfm_cov": 0.135454,
     "all_flat": 0.249999
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
     "cond_climatology": 0.153365,
     "chronos_uni": 0.101459,
     "timesfm_uni": 0.141827,
     "chronos_cov": 0.179861,
     "timesfm_cov": 0.178957,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.049955,
     "cond_climatology": 0.052564,
     "chronos_uni": 0.049679,
     "timesfm_uni": 0.053758,
     "chronos_cov": 0.034263,
     "timesfm_cov": 0.024814,
     "all_flat": 0.0
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
     "cond_climatology": 0.036628,
     "chronos_uni": 0.043379,
     "timesfm_uni": 0.055269,
     "chronos_cov": 0.046185,
     "timesfm_cov": 0.027209,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.132897,
     "cond_climatology": 0.192904,
     "chronos_uni": 0.133711,
     "timesfm_uni": 0.142814,
     "chronos_cov": 0.14862,
     "timesfm_cov": 0.160351,
     "all_flat": 0.249999
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
     "cond_climatology": 0.038823,
     "chronos_uni": 0.057018,
     "timesfm_uni": 0.046117,
     "chronos_cov": 0.043648,
     "timesfm_cov": 0.038726,
     "all_flat": 0.0
    },
    "5": {
     "climatology": 0.132921,
     "cond_climatology": 0.147655,
     "chronos_uni": 0.111204,
     "timesfm_uni": 0.146124,
     "chronos_cov": 0.117573,
     "timesfm_cov": 0.105567,
     "all_flat": 0.249999
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
     "cond_climatology": 0.170336,
     "chronos_uni": 0.078813,
     "timesfm_uni": 0.159502,
     "chronos_cov": 0.137703,
     "timesfm_cov": 0.142162,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.332976,
     "cond_climatology": 0.411644,
     "chronos_uni": 0.330616,
     "timesfm_uni": 0.372403,
     "chronos_cov": 0.368909,
     "timesfm_cov": 0.372679,
     "all_flat": 0.499999
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
     "cond_climatology": 0.149815,
     "chronos_uni": 0.184065,
     "timesfm_uni": 0.106206,
     "chronos_cov": 0.107871,
     "timesfm_cov": 0.10343,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.332899,
     "cond_climatology": 0.423907,
     "chronos_uni": 0.357838,
     "timesfm_uni": 0.387479,
     "chronos_cov": 0.419527,
     "timesfm_cov": 0.462583,
     "all_flat": 0.499999
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
     "cond_climatology": 0.164931,
     "chronos_uni": 0.112794,
     "timesfm_uni": 0.18319,
     "chronos_cov": 0.227237,
     "timesfm_cov": 0.157737,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.332941,
     "cond_climatology": 0.423988,
     "chronos_uni": 0.342388,
     "timesfm_uni": 0.386928,
     "chronos_cov": 0.4173,
     "timesfm_cov": 0.41057,
     "all_flat": 0.499999
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
     "cond_climatology": 0.168981,
     "chronos_uni": 0.100299,
     "timesfm_uni": 0.179764,
     "chronos_cov": 0.19172,
     "timesfm_cov": 0.171832,
     "all_flat": 0.249999
    },
    "5": {
     "climatology": 0.332864,
     "cond_climatology": 0.410232,
     "chronos_uni": 0.345936,
     "timesfm_uni": 0.387493,
     "chronos_cov": 0.439145,
     "timesfm_cov": 0.440838,
     "all_flat": 0.499999
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
     "cond_climatology": 0.397849,
     "chronos_uni": 0.365543,
     "timesfm_uni": 0.426339,
     "chronos_cov": 0.47484,
     "timesfm_cov": 0.442627,
     "all_flat": 0.499999
    },
    "5": {
     "climatology": 0.332787,
     "cond_climatology": 0.422818,
     "chronos_uni": 0.368739,
     "timesfm_uni": 0.396419,
     "chronos_cov": 0.459665,
     "timesfm_cov": 0.470621,
     "all_flat": 0.499999
    }
   }
  }
 ],
 "by_outcome": {
  "1": {
   "climatology": {
    "0": 0.384982,
    "1": 0.163146,
    "2": 0.040166,
    "3": 0.14258,
    "4": 0.355067
   },
   "cond_climatology": {
    "0": 0.385501,
    "1": 0.16123,
    "2": 0.040338,
    "3": 0.15252,
    "4": 0.358285
   },
   "chronos_uni": {
    "0": 0.333448,
    "1": 0.152537,
    "2": 0.047871,
    "3": 0.163435,
    "4": 0.368512
   },
   "timesfm_uni": {
    "0": 0.324844,
    "1": 0.143514,
    "2": 0.050834,
    "3": 0.162694,
    "4": 0.370353
   },
   "chronos_cov": {
    "0": 0.349178,
    "1": 0.183167,
    "2": 0.052353,
    "3": 0.16634,
    "4": 0.363018
   },
   "timesfm_cov": {
    "0": 0.390541,
    "1": 0.17947,
    "2": 0.037814,
    "3": 0.166923,
    "4": 0.36681
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
    "3": 0.132373,
    "4": 0.331585
   },
   "cond_climatology": {
    "0": 0.35625,
    "1": 0.167333,
    "2": 0.053461,
    "3": 0.138973,
    "4": 0.368244
   },
   "chronos_uni": {
    "0": 0.35884,
    "1": 0.14207,
    "2": 0.043968,
    "3": 0.150838,
    "4": 0.340992
   },
   "timesfm_uni": {
    "0": 0.361424,
    "1": 0.126235,
    "2": 0.052034,
    "3": 0.154984,
    "4": 0.368385
   },
   "chronos_cov": {
    "0": 0.390305,
    "1": 0.143142,
    "2": 0.047141,
    "3": 0.172045,
    "4": 0.422531
   },
   "timesfm_cov": {
    "0": 0.427476,
    "1": 0.180525,
    "2": 0.056775,
    "3": 0.161002,
    "4": 0.381228
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
   "2": 143
  },
  "5": {
   "2": 143
  }
 }
};
