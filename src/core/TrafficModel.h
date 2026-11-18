#pragma once
#include <string>
#include <vector>
#include <map>
#include <unordered_set>

// ---------------------------------------------------------------------------
// A tiny date + time value. Pure C++17, no external date library needed.
// ---------------------------------------------------------------------------
struct DateTime {
    int year{2026}, month{1}, day{1}, hour{9}, minute{0};

    // Parses "YYYY-MM-DD HH:MM" (or just "YYYY-MM-DD", time = 09:00).
    static bool parse(const std::string& text, DateTime& out);

    // 0 = Sunday, 1 = Monday ... 6 = Saturday (Sakamoto's algorithm).
    int dayOfWeek() const;

    std::string dateString() const;   // "2026-11-18"
    std::string toString() const;     // "2026-11-18 09:00"
};

// Which predictor to use when estimating congestion.
enum class TrafficMode {
    Off,                 // no traffic: free-flow times, route by shortest distance
    HistoricalAverage,   // lookup table: mean of past observations
    LinearRegression     // learned model: y = w0 + w1*x1 + ... + wn*xn
};

std::string trafficModeName(TrafficMode mode);

// ---------------------------------------------------------------------------
// TrafficModel
//   Learns "congestion factor" (actual time / free-flow time, always >= 1.0)
//   from data/traffic_history.csv and predicts it for any road type + time.
//
//   Model 1 - Historical Average:
//       factor = average of all past rows with the same
//                (road_type, day_type, hour)
//
//   Model 2 - Linear Regression (trained with Gradient Descent):
//       factor = w . x   where x is a small vector of 0/1 features
//       (is it morning rush? is it an IT corridor? is it monsoon? ...)
// ---------------------------------------------------------------------------
class TrafficModel {
public:
    // Loads holidays + history and trains both models. Returns false on error.
    bool load(const std::string& history_csv, const std::string& holidays_csv);
    bool isLoaded() const { return m_loaded; }

    // Predicted congestion factor (>= 1.0). Returns 1.0 for TrafficMode::Off.
    double predict(TrafficMode mode, const std::string& road_type, const DateTime& when) const;

    // "weekday", "weekend" or "holiday"
    std::string dayType(const DateTime& when) const;
    std::string holidayName(const DateTime& when) const;   // "" if not a holiday

    // ---- For explaining the model (CLI --model-info, GUI tooltip) ----
    static const std::vector<std::string>& featureNames();
    const std::vector<double>& weights() const { return m_weights; }
    size_t trainRows() const { return m_train_rows; }
    size_t testRows() const { return m_test_rows; }
    double maeAverage() const { return m_mae_avg; }      // error on the test set
    double maeRegression() const { return m_mae_lr; }
    double maeNoTraffic() const { return m_mae_off; }    // baseline: always predict 1.0
    double r2Regression() const { return m_r2_lr; }

private:
    struct Sample {
        DateTime when;
        std::string road_type;
        double factor{1.0};
    };

    std::vector<double> features(const std::string& road_type, const DateTime& when) const;
    double averagePrediction(const std::string& road_type, const DateTime& when) const;
    double regressionPrediction(const std::string& road_type, const DateTime& when) const;

    void trainAverage(const std::vector<Sample>& train);
    void trainRegression(const std::vector<Sample>& train);
    void evaluate(const std::vector<Sample>& test);

    bool m_loaded{false};
    std::map<std::string, std::string> m_holidays;          // "2026-11-08" -> "Diwali"
    std::map<std::string, double> m_average_table;          // "it_corridor|weekday|9" -> 2.41
    std::vector<double> m_weights;                          // regression weights

    size_t m_train_rows{0}, m_test_rows{0};
    double m_mae_avg{0}, m_mae_lr{0}, m_mae_off{0}, m_r2_lr{0};
};
