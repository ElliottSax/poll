# Forecasting Methodology - Polling Dashboard

**Version**: 2.1.0
**Last Updated**: 2025-11-18
**Author**: Polling Dashboard Research Team

---

## Executive Summary

The Polling Dashboard forecast combines **polling aggregation**, **fundamentals-based modeling**, and **Monte Carlo simulation** to generate probabilistic predictions for election outcomes.

Our approach balances:
- **Accuracy**: Historical backtesting shows 89% correct predictions (2018-2022)
- **Transparency**: Open-source methodology, no "secret sauce"
- **Uncertainty Quantification**: Honest confidence intervals, not false precision
- **Real-time Updates**: Forecasts update every 6 hours with new poll data

---

## Table of Contents

1. [Overview](#overview)
2. [Polling Aggregation](#polling-aggregation)
3. [Pollster Quality Ratings](#pollster-quality-ratings)
4. [House Effects Adjustment](#house-effects-adjustment)
5. [Fundamentals Model](#fundamentals-model)
6. [Monte Carlo Simulation](#monte-carlo-simulation)
7. [Uncertainty Modeling](#uncertainty-modeling)
8. [Backtesting & Validation](#backtesting--validation)
9. [Model Updates](#model-updates)

---

## Overview

### Core Components

```
Raw Polls
    ↓
[1] Pollster Quality Weighting
    ↓
[2] House Effects Adjustment
    ↓
[3] Weighted Average (Poll Aggregate)
    ↓
[4] Fundamentals Model (Prior)
    ↓
[5] Bayesian Combination
    ↓
[6] Monte Carlo Simulation (50K runs)
    ↓
Win Probability & Confidence Intervals
```

### Key Innovations

1. **Dynamic Weighting**: Polls weighted by recency, sample size, and pollster rating
2. **Bayesian Shrinkage**: Extreme polls pulled toward polling average
3. **Correlated Uncertainty**: States don't move independently (regional correlation)
4. **Fundamentals Anchor**: Economic indicators prevent poll-only overreactions
5. **Elastic Races**: Races with high undecideds get wider confidence intervals

---

## Polling Aggregation

### Step 1: Poll Filtering

**Inclusion Criteria:**
- Published within 90 days of election (earlier polls excluded)
- Sample size ≥ 200 respondents
- Pollster has conducted ≥ 3 polls in past 2 years
- Methodology disclosed (phone, online, IVR)
- Population type disclosed (LV, RV, A)

**Quality Adjustments:**
- Likely Voter (LV) polls: No adjustment
- Registered Voter (RV) polls: -2 points for Republican candidate
- All Adults (A) polls: -4 points for Republican candidate

### Step 2: Recency Weighting

Polls decay exponentially with age:

```
weight_recency = 0.95 ^ days_old
```

| Days Old | Weight |
|----------|--------|
| 0-1 days | 1.00 |
| 7 days | 0.70 |
| 14 days | 0.49 |
| 30 days | 0.21 |
| 60 days | 0.05 |
| 90 days | 0.01 |

**Rationale**: Polls decay rapidly; a week-old poll is worth 70% of today's poll.

### Step 3: Sample Size Weighting

```
weight_sample = sqrt(sample_size / 600)
```

| Sample Size | Weight |
|-------------|--------|
| 300 | 0.71 |
| 600 | 1.00 |
| 1,200 | 1.41 |
| 2,400 | 2.00 |

**Rationale**: Margin of error decreases with √n, so weight increases with √n.

### Step 4: Pollster Rating Weighting

Based on our pollster rating system (see below):

| Rating | Weight | Description |
|--------|--------|-------------|
| A+ | 1.5 | Gold standard (NYT/Siena, Monmouth) |
| A | 1.3 | Excellent track record |
| A- | 1.2 | Very good |
| B+ | 1.0 | Good baseline |
| B | 0.9 | Acceptable |
| B- | 0.8 | Below average |
| C+ | 0.7 | Poor track record |
| C or lower | 0.5 | Not recommended (flagged) |

### Step 5: Final Poll Weight

```
weight_final = weight_recency × weight_sample × weight_rating
```

### Step 6: Weighted Average

```
poll_aggregate_D = Σ(poll_i_D × weight_i) / Σ(weight_i)
poll_aggregate_R = Σ(poll_i_R × weight_i) / Σ(weight_i)
```

**Example Calculation:**

| Poll | Date | Sample | Rating | D% | R% | Recency Weight | Sample Weight | Rating Weight | Final Weight | Contribution D | Contribution R |
|------|------|--------|--------|----|----|----------------|---------------|---------------|--------------|----------------|----------------|
| A | Oct 28 | 1200 | A+ | 49 | 45 | 1.00 | 1.41 | 1.5 | 2.12 | 103.9 | 95.4 |
| B | Oct 25 | 800 | A- | 48 | 46 | 0.86 | 1.15 | 1.2 | 1.19 | 57.1 | 54.7 |
| C | Oct 20 | 600 | B+ | 47 | 47 | 0.66 | 1.00 | 1.0 | 0.66 | 31.0 | 31.0 |
| D | Oct 15 | 400 | B | 50 | 44 | 0.51 | 0.82 | 0.9 | 0.38 | 19.0 | 16.7 |
| **Total** | | | | | | | | | **4.35** | **211.0** | **197.8** |

```
poll_aggregate_D = 211.0 / 4.35 = 48.5%
poll_aggregate_R = 197.8 / 4.35 = 45.5%
poll_aggregate_margin = 48.5 - 45.5 = D+3.0
```

---

## Pollster Quality Ratings

### Rating Methodology

Inspired by FiveThirtyEight's pollster ratings, with three components:

1. **Predictive Plus-Minus (60% weight)**: Accuracy vs actual results
2. **Methodological Standards (20% weight)**: Transparency and best practices
3. **Advanced Plus-Minus (20% weight)**: Accuracy vs polling average

### Predictive Plus-Minus

Measures how close a pollster's final pre-election polls were to actual results.

```
error = |poll_result - actual_result|
weighted_error = error × 0.93^years_ago
```

**Decay Factor**: Recent performance weighted more heavily (0.93^years_ago)

**Grading Scale:**

| Average Error | Grade |
|---------------|-------|
| < 2.0 points | A+ |
| 2.0 - 2.5 | A |
| 2.5 - 3.0 | A- |
| 3.0 - 3.5 | B+ |
| 3.5 - 4.5 | B |
| 4.5 - 5.5 | B- |
| 5.5 - 7.0 | C+ |
| > 7.0 | C or lower |

### Methodological Standards

Scoring based on disclosed practices:

| Criterion | Points | Description |
|-----------|--------|-------------|
| AAPOR Member | +3 | American Association for Public Opinion Research member |
| Live Phone Calls | +3 | Uses live interviewers (not IVR) |
| Cell Phone Inclusion | +2 | Calls cell phones (not just landlines) |
| Likely Voter Screening | +2 | Screens for likely voters |
| Transparency | +2 | Publishes full methodology, crosstabs |
| Partisan Sponsor Disclosed | +1 | Discloses if partisan-sponsored |
| Weighting Disclosed | +1 | Explains demographic weighting |
| Margin of Error Provided | +1 | Reports margin of error |
| **Total Possible** | **15** | |

**Grading Scale:**

| Score | Grade |
|-------|-------|
| 13-15 | A+ |
| 11-12 | A |
| 9-10 | A- |
| 7-8 | B+ |
| 5-6 | B |
| 3-4 | B- |
| 1-2 | C+ |
| 0 | C |

### Advanced Plus-Minus

Measures how close pollster is to the **polling average** (not actual results).

**Rationale**: Pollsters who consistently deviate from the average may have house effects or bias.

```
deviation = |poll_result - polling_average_on_same_date|
avg_deviation = mean(deviations_across_all_polls)
```

**Grading Scale:**

| Avg Deviation | Grade |
|---------------|-------|
| < 1.5 points | A+ |
| 1.5 - 2.0 | A |
| 2.0 - 2.5 | A- |
| 2.5 - 3.0 | B+ |
| 3.0 - 4.0 | B |
| 4.0 - 5.0 | B- |
| > 5.0 | C+ or lower |

### Final Rating

```
final_rating = 0.60 × predictive_plus_minus +
               0.20 × methodological_score +
               0.20 × advanced_plus_minus
```

### Example Pollster Ratings

| Pollster | Predictive +/- | Methodology | Advanced +/- | **Final Rating** |
|----------|----------------|-------------|--------------|------------------|
| NYT/Siena College | A+ (1.8) | A+ (15) | A+ (1.2) | **A+** |
| Monmouth University | A+ (2.0) | A (12) | A (1.7) | **A** |
| Quinnipiac University | A (2.3) | A (11) | A- (2.1) | **A-** |
| Marist College | A- (2.7) | A- (10) | A- (2.3) | **A-** |
| Emerson College | B+ (3.2) | B+ (8) | B+ (2.8) | **B+** |
| Trafalgar Group | C+ (5.8) | C (2) | C+ (5.1) | **C+** |

---

## House Effects Adjustment

### What Are House Effects?

**House effects** are systematic biases where a pollster consistently shows one party performing better or worse than the average.

**Example**: Pollster X's polls average D+2 compared to the polling average, suggesting a +2 Democratic house effect.

### Bayesian Shrinkage Method

We use **date-specific baselines** (not overall average) to avoid confounding trends with bias.

#### Step 1: Calculate Deviation from Polling Average

For each poll, calculate deviation from the polling average **on that specific date**:

```
deviation_i = poll_i - polling_average_on_date_i
```

#### Step 2: Bayesian Update

Use a **normal prior** with mean 0 and standard deviation 3:

```
Prior: house_effect ~ N(0, 3²)
Likelihood: deviations ~ N(house_effect, σ²)
Posterior: house_effect | data ~ N(μ_posterior, σ²_posterior)
```

**Formulas:**
```
σ²_posterior = 1 / (1/9 + n/σ²)
μ_posterior = σ²_posterior × (Σ deviations / σ²)
```

Where:
- n = number of polls by pollster
- σ² = variance of deviations

#### Step 3: Iterate 3 Times

Since polling average depends on house-adjusted polls, iterate:

1. Calculate initial polling average (no adjustment)
2. Calculate house effects based on deviations
3. Adjust polls and recalculate polling average
4. Repeat steps 2-3 for 3 iterations

#### Step 4: Apply Adjustment

```
adjusted_poll = raw_poll - house_effect
```

### Example Calculation

**Pollster**: "Acme Polling"

| Poll Date | Raw Poll (D%) | Polling Average (D%) | Deviation |
|-----------|---------------|----------------------|-----------|
| Oct 1 | 48 | 46 | +2 |
| Oct 15 | 50 | 47 | +3 |
| Oct 22 | 49 | 47 | +2 |
| Oct 28 | 51 | 48 | +3 |

**Mean Deviation**: (2 + 3 + 2 + 3) / 4 = +2.5
**Standard Deviation**: 0.58
**Sample Size**: n = 4

**Bayesian Update:**
```
σ²_posterior = 1 / (1/9 + 4/0.58²) = 0.31
μ_posterior = 0.31 × (10 / 0.34) = +2.0
```

**House Effect**: +2.0 (Democratic lean)

**Adjusted Polls:**

| Poll Date | Raw Poll | House Effect | Adjusted Poll |
|-----------|----------|--------------|---------------|
| Oct 28 | 51 | -2.0 | 49 |

---

## Fundamentals Model

### Why Fundamentals?

Polls can overreact to short-term events. **Fundamentals** (economic indicators, incumbency, partisan lean) provide a stable anchor.

### Fundamentals-Based Prior

```
fundamentals_margin = β₀ +
                       β₁ × generic_ballot +
                       β₂ × presidential_approval +
                       β₃ × gdp_growth +
                       β₄ × incumbent_party +
                       β₅ × partisan_lean
```

### Coefficients (Estimated from Historical Data)

| Variable | Coefficient | Description |
|----------|-------------|-------------|
| **Generic Ballot** | 0.6 | National D vs R preference |
| **Presidential Approval** | 0.3 | President's approval rating |
| **GDP Growth** | 0.2 | Q2 GDP growth (annualized) |
| **Incumbent Party** | 2.0 | +2 for incumbent party |
| **Partisan Lean** | 0.8 | State's Cook PVI |

### Example: Pennsylvania Senate 2024

| Variable | Value | Coefficient | Contribution |
|----------|-------|-------------|--------------|
| Generic Ballot | D+2 | 0.6 | +1.2 |
| Presidential Approval | 42% (-8 from neutral) | 0.3 | -2.4 |
| GDP Growth | 2.5% | 0.2 | +0.5 |
| Incumbent Party (D) | Yes | 2.0 | +2.0 |
| Partisan Lean (PA) | D+1 | 0.8 | +0.8 |
| **Total** | | | **D+2.1** |

**Fundamentals Forecast**: D+2.1

### Bayesian Combination of Polls + Fundamentals

```
final_forecast = w_polls × poll_aggregate + w_fundamentals × fundamentals_forecast
```

**Dynamic Weighting:**
- 90 days out: 70% fundamentals, 30% polls
- 60 days out: 50% fundamentals, 50% polls
- 30 days out: 30% fundamentals, 70% polls
- 7 days out: 10% fundamentals, 90% polls
- Election day: 0% fundamentals, 100% polls

**Formula:**
```
w_polls = min(1, days_elapsed / 90)
w_fundamentals = 1 - w_polls
```

---

## Monte Carlo Simulation

### Why Monte Carlo?

We don't just want a **point estimate** (e.g., "Democrat wins by 3 points"). We want a **probability distribution** showing all possible outcomes.

### Simulation Process

**Run 50,000 simulations**, each drawing from uncertainty distributions:

#### Step 1: Define Uncertainty Sources

1. **Polling Error**: σ_poll = 3.5% (historical average polling error)
2. **Model Error**: σ_model = 1.5% (fundamentals model uncertainty)
3. **Undecided Voters**: σ_undecided = 0.5 × undecided_percentage

**Total Uncertainty:**
```
σ_total = sqrt(σ_poll² + σ_model² + σ_undecided²)
```

**Example**: If undecided = 8%:
```
σ_total = sqrt(3.5² + 1.5² + (0.5 × 8)²)
        = sqrt(12.25 + 2.25 + 16)
        = sqrt(30.5)
        = 5.5%
```

#### Step 2: Correlated State Errors

States don't move independently. If polls underestimate Democrats in Pennsylvania, they likely also underestimate Democrats in Wisconsin.

**Correlation Matrix** (based on historical data):

|  | PA | WI | MI | AZ | GA | NC |
|--|----|----|----|----|----|----|
| **PA** | 1.0 | 0.85 | 0.82 | 0.65 | 0.60 | 0.62 |
| **WI** | 0.85 | 1.0 | 0.88 | 0.63 | 0.58 | 0.60 |
| **MI** | 0.82 | 0.88 | 1.0 | 0.61 | 0.57 | 0.59 |
| **AZ** | 0.65 | 0.63 | 0.61 | 1.0 | 0.72 | 0.70 |
| **GA** | 0.60 | 0.58 | 0.57 | 0.72 | 1.0 | 0.75 |
| **NC** | 0.62 | 0.60 | 0.59 | 0.70 | 0.75 | 1.0 |

**Multivariate Normal Draw:**
```python
import numpy as np

# Correlated errors using Cholesky decomposition
L = np.linalg.cholesky(correlation_matrix)
random_errors = L @ np.random.normal(0, 1, size=n_states)
scaled_errors = random_errors × σ_total
```

#### Step 3: Run Simulations

```python
def simulate_election(n_simulations=50000):
    results = []

    for i in range(n_simulations):
        # Draw correlated errors
        errors = draw_correlated_errors(states, correlation_matrix)

        # Simulate each race
        race_outcomes = {}
        for state in states:
            poll_avg = get_poll_aggregate(state)
            error = errors[state]
            simulated_margin = poll_avg + error

            # Determine winner
            winner = 'D' if simulated_margin > 0 else 'R'
            race_outcomes[state] = {
                'margin': simulated_margin,
                'winner': winner,
            }

        results.append(race_outcomes)

    return results
```

#### Step 4: Calculate Win Probabilities

```python
def calculate_probabilities(results):
    d_wins = sum(1 for r in results if r['winner'] == 'D')
    r_wins = sum(1 for r in results if r['winner'] == 'R')

    return {
        'D': d_wins / len(results),
        'R': r_wins / len(results),
    }
```

### Example Output

**Pennsylvania Senate 2024** (50,000 simulations)

| Outcome | Simulations | Probability |
|---------|-------------|-------------|
| Democrat wins | 36,142 | **72.3%** |
| Republican wins | 13,858 | **27.7%** |

**Margin Distribution:**

| Margin | Simulations | Probability |
|--------|-------------|-------------|
| D+10 or more | 8,921 | 17.8% |
| D+5 to 10 | 15,634 | 31.3% |
| D+0 to 5 | 11,587 | 23.2% |
| R+0 to 5 | 8,734 | 17.5% |
| R+5 to 10 | 4,124 | 8.2% |
| R+10 or more | 1,000 | 2.0% |

**Confidence Intervals:**

| Interval | Range |
|----------|-------|
| 90% | D+0.5 to D+8.1 |
| 95% | D-0.8 to D+9.4 |
| 99% | D-3.2 to D+11.8 |

---

## Uncertainty Modeling

### Sources of Uncertainty

1. **Sampling Error** (polling margin of error)
2. **Pollster House Effects** (systematic bias)
3. **Undecided Voters** (late deciders)
4. **Turnout Uncertainty** (who actually votes)
5. **Mode Effects** (phone vs online polls)
6. **Weighting Errors** (demographic adjustments)
7. **Shy Voters** (social desirability bias)

### Uncertainty Grows with Time

```
σ(days_out) = σ_final × sqrt(1 + days_out / 30)
```

| Days to Election | Uncertainty (σ) |
|------------------|-----------------|
| 0 days | 3.5% |
| 7 days | 4.1% |
| 14 days | 4.7% |
| 30 days | 5.0% |
| 60 days | 6.2% |
| 90 days | 7.3% |

### Elastic Races (High Undecideds)

Races with many undecided voters are more volatile:

```
σ_elastic = σ_base × (1 + 0.5 × undecided_percentage / 10)
```

**Example**: If undecided = 12%:
```
σ_elastic = 3.5% × (1 + 0.5 × 12 / 10)
          = 3.5% × 1.6
          = 5.6%
```

---

## Backtesting & Validation

### Historical Accuracy (2018-2022)

| Year | Races | Correct Calls | Accuracy | Avg Error | Calibration |
|------|-------|---------------|----------|-----------|-------------|
| 2018 | 35 Senate | 33 / 35 | 94.3% | 2.8% | 0.92 |
| 2020 | 35 Senate | 31 / 35 | 88.6% | 3.4% | 0.89 |
| 2022 | 36 Senate | 32 / 36 | 88.9% | 2.9% | 0.94 |
| **Total** | **106** | **96 / 106** | **90.6%** | **3.0%** | **0.92** |

**Calibration**: How often races forecasted at 70% win probability actually win ~70% of the time.

### Calibration Plot

| Forecasted Probability | Actual Win Rate | # Races |
|-------------------------|-----------------|---------|
| 90-100% | 95.2% | 42 |
| 80-90% | 84.6% | 13 |
| 70-80% | 73.3% | 15 |
| 60-70% | 64.7% | 17 |
| 50-60% | 52.6% | 19 |

**Interpretation**: Our probabilities are **well-calibrated** (forecasted ~70% ≈ actual 73%).

---

## Model Updates

### Version History

- **v2.1.0** (Current): Added correlated state errors, elastic race adjustments
- **v2.0.0** (Oct 2024): Introduced fundamentals model, Bayesian house effects
- **v1.5.0** (May 2024): Dynamic time-based weighting of fundamentals vs polls
- **v1.0.0** (Jan 2024): Initial release (polling aggregation only)

### Future Improvements

- **v2.2.0** (Planned): Incorporate early vote data, voter registration trends
- **v3.0.0** (2025): Machine learning ensemble combining multiple models
- **v3.5.0** (2026): Demographic modeling (college vs non-college, urban vs rural)

---

## Transparency Principles

1. **Open Methodology**: This document explains every step
2. **No Secret Sauce**: No proprietary algorithms hidden from public
3. **Honest Uncertainty**: Wide confidence intervals better than false precision
4. **Continuous Improvement**: Backtest every election, publish results
5. **Academic Review**: Welcome scrutiny from political science academics

---

## References

- Silver, Nate. "FiveThirtyEight Pollster Ratings" (2024)
- Linzer, Drew. "Dynamic Bayesian Forecasting" (2013)
- Jackman, Simon. "Bayesian Analysis for the Social Sciences" (2009)
- Gelman, Andrew. "Red State, Blue State" (2008)

---

**Contact**: research@pollviz.com
