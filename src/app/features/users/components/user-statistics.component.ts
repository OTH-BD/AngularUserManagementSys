import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserStatistics } from '../../../core/models/user.model';

/**
 * User statistics component
 * Displays key metrics and statistics about users
 */
@Component({
  selector: 'app-user-statistics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Statistics Cards -->
    <div class="row g-4 mb-4">
      <!-- Total Users -->
      <div class="col-lg-3 col-md-6">
        <div class="stat-card total-users">
          <div class="stat-icon">
            <i class="bi bi-people-fill"></i>
          </div>
          <div class="stat-content">
            <h3 class="stat-number">{{ displayStats().total }}</h3>
            <p class="stat-label">Total Users</p>
            <div class="stat-trend positive">
              <i class="bi bi-arrow-up"></i>
              <span>+{{ getRecentGrowth() }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Male Users -->
      <div class="col-lg-3 col-md-6">
        <div class="stat-card male-users">
          <div class="stat-icon">
            <i class="bi bi-person-fill"></i>
          </div>
          <div class="stat-content">
            <h3 class="stat-number">{{ displayStats().maleCount }}</h3>
            <p class="stat-label">Male Users</p>
            <div class="stat-percentage">
              {{ getMalePercentage() }}% of total
            </div>
          </div>
        </div>
      </div>

      <!-- Female Users -->
      <div class="col-lg-3 col-md-6">
        <div class="stat-card female-users">
          <div class="stat-icon">
            <i class="bi bi-person-fill"></i>
          </div>
          <div class="stat-content">
            <h3 class="stat-number">{{ displayStats().femaleCount }}</h3>
            <p class="stat-label">Female Users</p>
            <div class="stat-percentage">
              {{ getFemalePercentage() }}% of total
            </div>
          </div>
        </div>
      </div>

      <!-- Average Age -->
      <div class="col-lg-3 col-md-6">
        <div class="stat-card average-age">
          <div class="stat-icon">
            <i class="bi bi-calendar-fill"></i>
          </div>
          <div class="stat-content">
            <h3 class="stat-number">{{ displayStats().averageAge }}</h3>
            <p class="stat-label">Average Age</p>
            <div class="stat-range">
              <small>Range: {{ displayStats().ageRange.min }}-{{ displayStats().ageRange.max }}</small>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Additional Statistics Row -->
    <div class="row g-4 mb-4">
      <!-- Gender Distribution Chart -->
      <div class="col-md-6">
        <div class="chart-card">
          <h5 class="chart-title">
            <i class="bi bi-pie-chart-fill me-2"></i>
            Gender Distribution
          </h5>
          <div class="gender-chart">
            <div class="chart-item male" 
                 [style.width.%]="getMalePercentage()">
              <span>Male ({{ getMalePercentage() }}%)</span>
            </div>
            <div class="chart-item female" 
                 [style.width.%]="getFemalePercentage()">
              <span>Female ({{ getFemalePercentage() }}%)</span>
            </div>
            @if (displayStats().otherCount > 0) {
              <div class="chart-item other" 
                   [style.width.%]="getOtherPercentage()">
                <span>Other ({{ getOtherPercentage() }}%)</span>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Age Distribution -->
      <div class="col-md-6">
        <div class="chart-card">
          <h5 class="chart-title">
            <i class="bi bi-bar-chart-fill me-2"></i>
            Age Statistics
          </h5>
          <div class="age-stats">
            <div class="age-stat-item">
              <div class="age-label">Youngest</div>
              <div class="age-value">{{ displayStats().ageRange.min }} years</div>
            </div>
            <div class="age-stat-item">
              <div class="age-label">Average</div>
              <div class="age-value">{{ displayStats().averageAge }} years</div>
            </div>
            <div class="age-stat-item">
              <div class="age-label">Oldest</div>
              <div class="age-value">{{ displayStats().ageRange.max }} years</div>
            </div>
          </div>
          
          <!-- Age Range Visualization -->
          <div class="age-range-bar">
            <div class="range-marker start">{{ displayStats().ageRange.min }}</div>
            <div class="range-fill"></div>
            <div class="range-marker average" 
                 [style.left.%]="getAveragePosition()">
              {{ displayStats().averageAge }}
            </div>
            <div class="range-marker end">{{ displayStats().ageRange.max }}</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stat-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 15px;
      padding: 1.5rem;
      color: white;
      position: relative;
      overflow: hidden;
      transition: all 0.3s ease;
      height: 160px;
    }

    .stat-card::before {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 50%);
      pointer-events: none;
    }

    .stat-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 15px 35px rgba(102, 126, 234, 0.3);
    }

    .stat-card.male-users {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    }

    .stat-card.female-users {
      background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
    }

    .stat-card.average-age {
      background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
    }

    .stat-icon {
      position: absolute;
      top: 1rem;
      right: 1rem;
      font-size: 2.5rem;
      opacity: 0.3;
    }

    .stat-content {
      position: relative;
      z-index: 2;
    }

    .stat-number {
      font-size: 2.5rem;
      font-weight: 700;
      margin: 0;
      line-height: 1;
    }

    .stat-label {
      font-size: 0.9rem;
      margin: 0.5rem 0 0;
      opacity: 0.9;
    }

    .stat-trend {
      position: absolute;
      bottom: 1rem;
      left: 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .stat-trend.positive {
      color: #4ade80;
    }

    .stat-percentage, .stat-range {
      position: absolute;
      bottom: 1rem;
      left: 1.5rem;
      font-size: 0.8rem;
      opacity: 0.9;
    }

    .chart-card {
      background: white;
      border-radius: 15px;
      padding: 1.5rem;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      transition: all 0.3s ease;
      height: 250px;
    }

    .chart-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 15px 40px rgba(0,0,0,0.15);
    }

    .chart-title {
      color: #2d3748;
      font-weight: 600;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
    }

    .gender-chart {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .chart-item {
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      padding: 0 1rem;
      color: white;
      font-weight: 600;
      font-size: 0.9rem;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    .chart-item.male {
      background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
    }

    .chart-item.female {
      background: linear-gradient(90deg, #ff9a9e 0%, #fecfef 100%);
    }

    .chart-item.other {
      background: linear-gradient(90deg, #a8edea 0%, #fed6e3 100%);
    }

    .chart-item:hover {
      transform: translateX(5px);
      box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    }

    .age-stats {
      display: flex;
      justify-content: space-between;
      margin-bottom: 1.5rem;
    }

    .age-stat-item {
      text-align: center;
    }

    .age-label {
      color: #6b7280;
      font-size: 0.8rem;
      margin-bottom: 0.25rem;
    }

    .age-value {
      color: #1f2937;
      font-size: 1.1rem;
      font-weight: 700;
    }

    .age-range-bar {
      position: relative;
      height: 8px;
      background: #e5e7eb;
      border-radius: 4px;
      margin-top: 1rem;
    }

    .range-fill {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
      border-radius: 4px;
    }

    .range-marker {
      position: absolute;
      top: -20px;
      font-size: 0.8rem;
      color: #6b7280;
      font-weight: 600;
      transform: translateX(-50%);
    }

    .range-marker.start {
      left: 0;
      transform: translateX(0);
    }

    .range-marker.end {
      right: 0;
      transform: translateX(0);
    }

    .range-marker.average {
      color: #667eea;
      font-weight: 700;
    }

    .range-marker.average::after {
      content: '';
      position: absolute;
      top: 26px;
      left: 50%;
      transform: translateX(-50%);
      width: 3px;
      height: 8px;
      background: #667eea;
      border-radius: 2px;
    }

    @media (max-width: 768px) {
      .stat-card {
        height: 140px;
      }
      
      .stat-number {
        font-size: 2rem;
      }
      
      .chart-card {
        height: auto;
        min-height: 200px;
      }
    }
  `]
})
export class UserStatisticsComponent {
  // Input signal for statistics data
  readonly statistics = input<UserStatistics>();

  // Computed property for display statistics with defaults
  readonly displayStats = computed(() => {
    const stats = this.statistics();
    return stats || {
      total: 0,
      maleCount: 0,
      femaleCount: 0,
      otherCount: 0,
      averageAge: 0,
      ageRange: { min: 0, max: 0 }
    };
  });

  /**
   * Calculate male percentage
   * @returns Percentage of male users
   */
  getMalePercentage(): number {
    const stats = this.displayStats();
    return stats.total > 0 ? Math.round((stats.maleCount / stats.total) * 100) : 0;
  }

  /**
   * Calculate female percentage
   * @returns Percentage of female users
   */
  getFemalePercentage(): number {
    const stats = this.displayStats();
    return stats.total > 0 ? Math.round((stats.femaleCount / stats.total) * 100) : 0;
  }

  /**
   * Calculate other gender percentage
   * @returns Percentage of other gender users
   */
  getOtherPercentage(): number {
    const stats = this.displayStats();
    return stats.total > 0 ? Math.round((stats.otherCount / stats.total) * 100) : 0;
  }

  /**
   * Get recent growth percentage (simulated for demo)
   * @returns Growth percentage
   */
  getRecentGrowth(): number {
    // In a real app, this would calculate based on historical data
    const stats = this.displayStats();
    return stats.total > 0 ? Math.floor(Math.random() * 15) + 5 : 0;
  }

  /**
   * Calculate position of average age on the range bar
   * @returns Position percentage
   */
  getAveragePosition(): number {
    const stats = this.displayStats();
    if (stats.ageRange.max === stats.ageRange.min) return 50;
    
    const range = stats.ageRange.max - stats.ageRange.min;
    const position = stats.averageAge - stats.ageRange.min;
    
    return (position / range) * 100;
  }

  /**
   * Check if statistics data is available
   * @returns True if statistics are loaded
   */
  hasStatistics(): boolean {
    const stats = this.statistics();
    return stats !== undefined && stats.total > 0;
  }

  /**
   * Get demographic insight message
   * @returns Insight message based on statistics
   */
  getDemographicInsight(): string {
    const stats = this.displayStats();
    if (stats.total === 0) return 'No users available';
    
    const malePercent = this.getMalePercentage();
    const femalePercent = this.getFemalePercentage();
    
    if (Math.abs(malePercent - femalePercent) <= 10) {
      return 'Well-balanced gender distribution';
    } else if (malePercent > femalePercent) {
      return 'Male-dominant user base';
    } else {
      return 'Female-dominant user base';
    }
  }

  /**
   * Get age group classification
   * @returns Age group description
   */
  getAgeGroupClassification(): string {
    const avgAge = this.displayStats().averageAge;
    
    if (avgAge < 25) return 'Young user base';
    if (avgAge < 40) return 'Adult user base';
    if (avgAge < 60) return 'Mature user base';
    return 'Senior user base';
  }
}
