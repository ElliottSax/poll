"""
Comprehensive test suite for Monte Carlo Forecaster
"""

import pytest
import numpy as np
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import datetime, timedelta
import asyncio

# Assuming the forecaster module exists
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from forecaster import MonteCarloForecaster


class TestMonteCarloForecaster:
    """Test suite for Monte Carlo forecasting model"""

    @pytest.fixture
    def forecaster(self):
        """Create forecaster instance"""
        return MonteCarloForecaster(
            api_base_url="http://localhost:3001",
            n_simulations=1000,  # Lower for faster tests
            polling_error_std=3.5
        )

    @pytest.fixture
    def sample_aggregation(self):
        """Sample poll aggregation data"""
        return {
            'race_slug': 'test-race',
            'aggregated_results': [
                {
                    'candidate_id': 'candidate-1',
                    'weighted_average': 48.5,
                    'std_dev': 2.0,
                    'poll_count': 10
                },
                {
                    'candidate_id': 'candidate-2',
                    'weighted_average': 47.2,
                    'std_dev': 2.5,
                    'poll_count': 10
                }
            ],
            'total_polls': 20
        }

    def test_initialization(self, forecaster):
        """Test forecaster initializes with correct parameters"""
        assert forecaster.n_simulations == 1000
        assert forecaster.polling_error_std == 3.5
        assert forecaster.api_base_url == "http://localhost:3001"

    def test_simulate_election_structure(self, forecaster, sample_aggregation):
        """Test simulation returns correct structure"""
        result = forecaster.simulate_election(
            sample_aggregation['aggregated_results']
        )

        assert 'simulations' in result
        assert 'results' in result
        assert 'methodology' in result
        assert result['simulations'] == 1000

    def test_simulate_election_probability_sum(self, forecaster, sample_aggregation):
        """Test win probabilities sum to approximately 100%"""
        result = forecaster.simulate_election(
            sample_aggregation['aggregated_results']
        )

        total_prob = sum(r['win_probability'] for r in result['results'])
        # Allow for rounding errors
        assert 99.0 <= total_prob <= 101.0

    def test_simulate_election_percentiles(self, forecaster, sample_aggregation):
        """Test percentiles are in correct order"""
        result = forecaster.simulate_election(
            sample_aggregation['aggregated_results']
        )

        for candidate_result in result['results']:
            p5 = candidate_result['percentile_5']
            median = candidate_result['median_vote_share']
            mean = candidate_result['mean_vote_share']
            p95 = candidate_result['percentile_95']

            # 5th percentile should be less than median/mean
            assert p5 < median
            assert p5 < mean

            # 95th percentile should be greater than median/mean
            assert p95 > median
            assert p95 > mean

    def test_simulate_election_bounded_results(self, forecaster, sample_aggregation):
        """Test results are bounded between 0 and 100"""
        result = forecaster.simulate_election(
            sample_aggregation['aggregated_results']
        )

        for candidate_result in result['results']:
            assert 0 <= candidate_result['percentile_5'] <= 100
            assert 0 <= candidate_result['mean_vote_share'] <= 100
            assert 0 <= candidate_result['median_vote_share'] <= 100
            assert 0 <= candidate_result['percentile_95'] <= 100

    def test_simulate_election_with_single_candidate(self, forecaster):
        """Test simulation with single candidate"""
        single_candidate = [{
            'candidate_id': 'only-candidate',
            'weighted_average': 60.0,
            'std_dev': 3.0,
            'poll_count': 5
        }]

        result = forecaster.simulate_election(single_candidate)

        assert len(result['results']) == 1
        assert result['results'][0]['win_probability'] == 100.0

    def test_simulate_election_deterministic_with_seed(self, forecaster):
        """Test simulation is deterministic with same random seed"""
        candidate_data = [{
            'candidate_id': 'test-candidate',
            'weighted_average': 50.0,
            'std_dev': 2.0,
            'poll_count': 10
        }]

        np.random.seed(42)
        result1 = forecaster.simulate_election(candidate_data)

        np.random.seed(42)
        result2 = forecaster.simulate_election(candidate_data)

        assert result1['results'][0]['mean_vote_share'] == result2['results'][0]['mean_vote_share']

    def test_simulate_election_higher_average_higher_probability(self, forecaster):
        """Test candidate with higher average has higher win probability"""
        candidates = [
            {
                'candidate_id': 'leading-candidate',
                'weighted_average': 52.0,
                'std_dev': 2.0,
                'poll_count': 10
            },
            {
                'candidate_id': 'trailing-candidate',
                'weighted_average': 43.0,
                'std_dev': 2.0,
                'poll_count': 10
            }
        ]

        result = forecaster.simulate_election(candidates)

        leading = next(r for r in result['results'] if r['candidate_id'] == 'leading-candidate')
        trailing = next(r for r in result['results'] if r['candidate_id'] == 'trailing-candidate')

        assert leading['win_probability'] > trailing['win_probability']

    def test_simulate_election_uncertainty_affects_probability(self, forecaster):
        """Test higher uncertainty leads to more uncertain probabilities"""
        # Two candidates with same average but different uncertainties
        candidates_low_uncertainty = [
            {'candidate_id': 'c1', 'weighted_average': 50.0, 'std_dev': 0.5, 'poll_count': 20},
            {'candidate_id': 'c2', 'weighted_average': 49.0, 'std_dev': 0.5, 'poll_count': 20}
        ]

        candidates_high_uncertainty = [
            {'candidate_id': 'c1', 'weighted_average': 50.0, 'std_dev': 5.0, 'poll_count': 5},
            {'candidate_id': 'c2', 'weighted_average': 49.0, 'std_dev': 5.0, 'poll_count': 5}
        ]

        result_low = forecaster.simulate_election(candidates_low_uncertainty)
        result_high = forecaster.simulate_election(candidates_high_uncertainty)

        # With low uncertainty, leading candidate should have much higher win prob
        # With high uncertainty, probabilities should be closer
        c1_low = next(r for r in result_low['results'] if r['candidate_id'] == 'c1')
        c1_high = next(r for r in result_high['results'] if r['candidate_id'] == 'c1')

        # Low uncertainty should give more extreme probability
        assert abs(c1_low['win_probability'] - 50) > abs(c1_high['win_probability'] - 50)

    @pytest.mark.asyncio
    async def test_fetch_race_aggregation_success(self, forecaster):
        """Test successful fetching of race aggregation"""
        mock_response = AsyncMock()
        mock_response.json.return_value = {
            'polls': [
                {
                    'endDate': (datetime.now() - timedelta(days=5)).isoformat(),
                    'results': [
                        {'candidateId': 'c1', 'value': 48.0},
                        {'candidateId': 'c2', 'value': 47.0}
                    ]
                }
            ]
        }
        mock_response.raise_for_status = MagicMock()

        with patch.object(forecaster.client, 'get', return_value=mock_response):
            result = await forecaster.fetch_race_aggregation('test-race')

            assert result is not None
            assert 'aggregated_results' in result
            assert len(result['aggregated_results']) > 0

    @pytest.mark.asyncio
    async def test_fetch_race_aggregation_no_polls(self, forecaster):
        """Test handling of race with no polls"""
        mock_response = AsyncMock()
        mock_response.json.return_value = {'polls': []}
        mock_response.raise_for_status = MagicMock()

        with patch.object(forecaster.client, 'get', return_value=mock_response):
            result = await forecaster.fetch_race_aggregation('no-polls-race')

            assert result is None

    @pytest.mark.asyncio
    async def test_fetch_race_aggregation_api_error(self, forecaster):
        """Test handling of API errors"""
        with patch.object(forecaster.client, 'get', side_effect=Exception("API Error")):
            result = await forecaster.fetch_race_aggregation('error-race')

            assert result is None

    @pytest.mark.asyncio
    async def test_forecast_race_complete_structure(self, forecaster):
        """Test complete forecast structure"""
        # Mock the aggregation fetch
        mock_aggregation = {
            'race_slug': 'test-race',
            'aggregated_results': [
                {'candidate_id': 'c1', 'weighted_average': 48.0, 'std_dev': 2.0, 'poll_count': 10},
                {'candidate_id': 'c2', 'weighted_average': 47.0, 'std_dev': 2.5, 'poll_count': 10}
            ],
            'total_polls': 20
        }

        with patch.object(forecaster, 'fetch_race_aggregation', return_value=mock_aggregation):
            forecast = await forecaster.forecast_race('test-race')

            assert forecast is not None
            assert forecast['race_slug'] == 'test-race'
            assert 'forecast_date' in forecast
            assert 'model_version' in forecast
            assert 'simulations' in forecast
            assert 'results' in forecast
            assert 'methodology' in forecast
            assert 'data_quality' in forecast

            # Check results structure
            for result in forecast['results']:
                assert 'candidate_id' in result
                assert 'win_probability' in result
                assert 'mean_vote_share' in result
                assert 'median_vote_share' in result
                assert 'std_dev' in result
                assert 'percentile_5' in result
                assert 'percentile_95' in result

    def test_simulation_consistency(self, forecaster):
        """Test that multiple runs produce consistent statistics"""
        candidates = [
            {'candidate_id': 'c1', 'weighted_average': 48.0, 'std_dev': 2.0, 'poll_count': 10},
            {'candidate_id': 'c2', 'weighted_average': 47.0, 'std_dev': 2.0, 'poll_count': 10}
        ]

        results = []
        for _ in range(5):
            result = forecaster.simulate_election(candidates)
            c1_prob = next(r for r in result['results'] if r['candidate_id'] == 'c1')['win_probability']
            results.append(c1_prob)

        # Standard deviation of win probabilities across runs should be reasonable
        # With 1000 simulations, we expect some variance but not too much
        std_dev = np.std(results)
        assert std_dev < 5.0  # Should be relatively consistent

    def test_extreme_polling_averages(self, forecaster):
        """Test handling of extreme polling values"""
        candidates = [
            {'candidate_id': 'dominant', 'weighted_average': 95.0, 'std_dev': 1.0, 'poll_count': 10},
            {'candidate_id': 'weak', 'weighted_average': 5.0, 'std_dev': 1.0, 'poll_count': 10}
        ]

        result = forecaster.simulate_election(candidates)

        dominant = next(r for r in result['results'] if r['candidate_id'] == 'dominant')
        weak = next(r for r in result['results'] if r['candidate_id'] == 'weak')

        # Dominant candidate should have very high win probability
        assert dominant['win_probability'] > 99.0
        assert weak['win_probability'] < 1.0

    def test_three_way_race(self, forecaster):
        """Test simulation with three candidates"""
        candidates = [
            {'candidate_id': 'c1', 'weighted_average': 40.0, 'std_dev': 2.0, 'poll_count': 10},
            {'candidate_id': 'c2', 'weighted_average': 35.0, 'std_dev': 2.0, 'poll_count': 10},
            {'candidate_id': 'c3', 'weighted_average': 25.0, 'std_dev': 2.0, 'poll_count': 10}
        ]

        result = forecaster.simulate_election(candidates)

        assert len(result['results']) == 3

        # Results should be sorted by win probability
        assert result['results'][0]['win_probability'] >= result['results'][1]['win_probability']
        assert result['results'][1]['win_probability'] >= result['results'][2]['win_probability']

    def test_close_race(self, forecaster):
        """Test very close race produces uncertain outcome"""
        candidates = [
            {'candidate_id': 'c1', 'weighted_average': 50.1, 'std_dev': 2.0, 'poll_count': 10},
            {'candidate_id': 'c2', 'weighted_average': 49.9, 'std_dev': 2.0, 'poll_count': 10}
        ]

        result = forecaster.simulate_election(candidates)

        c1 = next(r for r in result['results'] if r['candidate_id'] == 'c1')
        c2 = next(r for r in result['results'] if r['candidate_id'] == 'c2')

        # In a very close race, probabilities should be near 50/50
        assert 40.0 < c1['win_probability'] < 60.0
        assert 40.0 < c2['win_probability'] < 60.0

    @pytest.mark.asyncio
    async def test_close_forecaster(self, forecaster):
        """Test forecaster cleanup"""
        await forecaster.close()
        # Should not raise an error
        assert True


class TestForecasterEdgeCases:
    """Test edge cases and error handling"""

    @pytest.fixture
    def forecaster(self):
        return MonteCarloForecaster(n_simulations=100)

    def test_empty_candidates_list(self, forecaster):
        """Test handling of empty candidates list"""
        result = forecaster.simulate_election([])

        assert result['results'] == []
        assert result['simulations'] == 100

    def test_negative_polling_average(self, forecaster):
        """Test handling of negative polling values"""
        candidates = [
            {'candidate_id': 'c1', 'weighted_average': -5.0, 'std_dev': 2.0, 'poll_count': 10}
        ]

        result = forecaster.simulate_election(candidates)

        # Negative values should be bounded to 0
        assert all(r['mean_vote_share'] >= 0 for r in result['results'])

    def test_over_100_polling_average(self, forecaster):
        """Test handling of polling values over 100"""
        candidates = [
            {'candidate_id': 'c1', 'weighted_average': 105.0, 'std_dev': 2.0, 'poll_count': 10}
        ]

        result = forecaster.simulate_election(candidates)

        # Values should be bounded to 100
        assert all(r['mean_vote_share'] <= 100 for r in result['results'])

    def test_zero_std_dev(self, forecaster):
        """Test handling of zero standard deviation"""
        candidates = [
            {'candidate_id': 'c1', 'weighted_average': 50.0, 'std_dev': 0.0, 'poll_count': 10}
        ]

        # Should not crash, polling error std should still apply
        result = forecaster.simulate_election(candidates)

        assert result['results'][0]['std_dev'] > 0  # Should have some uncertainty from polling error

    def test_very_large_simulations(self):
        """Test with very large number of simulations"""
        forecaster = MonteCarloForecaster(n_simulations=50000)

        candidates = [
            {'candidate_id': 'c1', 'weighted_average': 52.0, 'std_dev': 2.0, 'poll_count': 10},
            {'candidate_id': 'c2', 'weighted_average': 48.0, 'std_dev': 2.0, 'poll_count': 10}
        ]

        result = forecaster.simulate_election(candidates)

        # With many simulations, results should be stable
        assert result['simulations'] == 50000
        assert len(result['results']) == 2


if __name__ == '__main__':
    pytest.main([__file__, '-v', '--tb=short'])
