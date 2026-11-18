#include "TrafficModel.h"
#include <fstream>
#include <sstream>
#include <iomanip>
#include <algorithm>
#include <cmath>
#include <cstdio>

// ============================ DateTime =====================================

bool DateTime::parse(const std::string& text, DateTime& out) {
    DateTime dt;
    int n = std::sscanf(text.c_str(), "%d-%d-%d %d:%d",
                        &dt.year, &dt.month, &dt.day, &dt.hour, &dt.minute);
    if (n == 3) { dt.hour = 9; dt.minute = 0; }
    else if (n != 5) return false;

    if (dt.month < 1 || dt.month > 12 || dt.day < 1 || dt.day > 31 ||
        dt.hour < 0 || dt.hour > 23 || dt.minute < 0 || dt.minute > 59) {
        return false;
    }
    out = dt;
    return true;
}

int DateTime::dayOfWeek() const {
    // Sakamoto's algorithm: 0 = Sunday ... 6 = Saturday
    static const int t[] = {0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4};
    int y = year - (month < 3 ? 1 : 0);
    return (y + y / 4 - y / 100 + y / 400 + t[month - 1] + day) % 7;
}

std::string DateTime::dateString() const {
    char buf[16];
    std::snprintf(buf, sizeof(buf), "%04d-%02d-%02d", year, month, day);
    return buf;
}

std::string DateTime::toString() const {
    char buf[24];
    std::snprintf(buf, sizeof(buf), "%04d-%02d-%02d %02d:%02d", year, month, day, hour, minute);
    return buf;
}

std::string trafficModeName(TrafficMode mode) {
    switch (mode) {
        case TrafficMode::HistoricalAverage: return "Historical Average";
        case TrafficMode::LinearRegression:  return "Linear Regression";
        default:                             return "Off (free-flow)";
    }
}

// ============================ Helpers ======================================

static std::vector<std::string> splitCSV(const std::string& line) {
    std::vector<std::string> out;
    std::stringstream ss(line);
    std::string field;
    while (std::getline(ss, field, ',')) {
        if (!field.empty() && field.back() == '\r') field.pop_back();
        out.push_back(field);
    }
    return out;
}

std::string TrafficModel::dayType(const DateTime& when) const {
    if (m_holidays.count(when.dateString())) return "holiday";
    int dow = when.dayOfWeek();
    return (dow == 0 || dow == 6) ? "weekend" : "weekday";
}

std::string TrafficModel::holidayName(const DateTime& when) const {
    auto it = m_holidays.find(when.dateString());
    return it == m_holidays.end() ? "" : it->second;
}

// ============================ Loading ======================================

bool TrafficModel::load(const std::string& history_csv, const std::string& holidays_csv) {
    m_loaded = false;
    m_holidays.clear();

    // 1. Holidays (optional file)
    std::ifstream hf(holidays_csv);
    std::string line;
    bool header = true;
    while (hf && std::getline(hf, line)) {
        if (header) { header = false; continue; }
        auto f = splitCSV(line);
        if (f.size() >= 2) m_holidays[f[0]] = f[1];
    }

    // 2. Traffic history. Every 5th row goes to the TEST set (80/20 split),
    //    so we can measure how well each model predicts data it has never seen.
    std::ifstream file(history_csv);
    if (!file.is_open()) return false;

    std::vector<Sample> train, test;
    header = true;
    size_t row = 0;
    while (std::getline(file, line)) {
        if (header) { header = false; continue; }
        auto f = splitCSV(line);
        if (f.size() < 4) continue;

        Sample s;
        if (!DateTime::parse(f[0] + " 00:00", s.when)) continue;
        try {
            s.when.hour = std::stoi(f[1]);
            s.factor = std::stod(f[3]);
        } catch (...) { continue; }
        s.road_type = f[2];

        if (row++ % 5 == 4) test.push_back(s);
        else train.push_back(s);
    }
    if (train.empty()) return false;

    m_train_rows = train.size();
    m_test_rows = test.size();

    trainAverage(train);
    trainRegression(train);
    evaluate(test);

    m_loaded = true;
    return true;
}

// ===================== Model 1: Historical Average =========================

void TrafficModel::trainAverage(const std::vector<Sample>& train) {
    // Group rows by (road_type, day_type, hour) and take the mean of each group.
    std::map<std::string, double> sum;
    std::map<std::string, int> count;
    for (const auto& s : train) {
        std::string key = s.road_type + "|" + dayType(s.when) + "|" + std::to_string(s.when.hour);
        sum[key] += s.factor;
        count[key] += 1;
    }
    m_average_table.clear();
    for (const auto& [key, total] : sum) {
        m_average_table[key] = total / count[key];
    }
}

double TrafficModel::averagePrediction(const std::string& road_type, const DateTime& when) const {
    std::string key = road_type + "|" + dayType(when) + "|" + std::to_string(when.hour);
    auto it = m_average_table.find(key);
    return it == m_average_table.end() ? 1.0 : it->second;   // unseen group -> no traffic
}

// ===================== Model 2: Linear Regression ==========================

const std::vector<std::string>& TrafficModel::featureNames() {
    static const std::vector<std::string> names = {
        "bias (always 1)",
        "daytime (6 AM - 10 PM)",
        "weekday morning rush (8-11 AM)",
        "weekday evening rush (5-9 PM)",
        "rush hour AND IT corridor",
        "rush hour AND city centre",
        "rush hour AND highway",
        "city centre road (daytime)",
        "monsoon month (Jun-Sep)"
    };
    return names;
}

std::vector<double> TrafficModel::features(const std::string& road_type, const DateTime& when) const {
    int h = when.hour;
    bool working_day = (dayType(when) == "weekday");
    bool daytime = (h >= 6 && h <= 22);
    bool morning = working_day && h >= 8 && h <= 11;
    bool evening = working_day && h >= 17 && h <= 21;
    bool rush = morning || evening;

    // Each feature is 0 or 1, so every weight reads as
    // "how much this condition adds to the congestion factor".
    return {
        1.0,
        daytime ? 1.0 : 0.0,
        morning ? 1.0 : 0.0,
        evening ? 1.0 : 0.0,
        (rush && road_type == "it_corridor") ? 1.0 : 0.0,
        (rush && road_type == "city_center") ? 1.0 : 0.0,
        (rush && road_type == "highway") ? 1.0 : 0.0,
        (daytime && road_type == "city_center") ? 1.0 : 0.0,
        (when.month >= 6 && when.month <= 9) ? 1.0 : 0.0
    };
}

void TrafficModel::trainRegression(const std::vector<Sample>& train) {
    // Batch Gradient Descent on Mean Squared Error:
    //   prediction = w . x
    //   error      = prediction - actual
    //   gradient_j = average of (error * x_j) over all rows
    //   w_j       -= learning_rate * gradient_j
    const size_t n_features = featureNames().size();
    const double learning_rate = 0.5;
    const int epochs = 1000;

    // Features never change, so compute them once.
    std::vector<std::vector<double>> X;
    X.reserve(train.size());
    for (const auto& s : train) X.push_back(features(s.road_type, s.when));

    m_weights.assign(n_features, 0.0);
    std::vector<double> gradient(n_features);

    for (int epoch = 0; epoch < epochs; ++epoch) {
        std::fill(gradient.begin(), gradient.end(), 0.0);
        for (size_t i = 0; i < train.size(); ++i) {
            double prediction = 0.0;
            for (size_t j = 0; j < n_features; ++j) prediction += m_weights[j] * X[i][j];
            double error = prediction - train[i].factor;
            for (size_t j = 0; j < n_features; ++j) gradient[j] += error * X[i][j];
        }
        for (size_t j = 0; j < n_features; ++j) {
            m_weights[j] -= learning_rate * gradient[j] / train.size();
        }
    }
}

double TrafficModel::regressionPrediction(const std::string& road_type, const DateTime& when) const {
    auto x = features(road_type, when);
    double y = 0.0;
    for (size_t j = 0; j < x.size() && j < m_weights.size(); ++j) y += m_weights[j] * x[j];
    return y;
}

// ============================ Evaluation ===================================

void TrafficModel::evaluate(const std::vector<Sample>& test) {
    if (test.empty()) return;
    double err_avg = 0, err_lr = 0, err_off = 0;
    double mean = 0;
    for (const auto& s : test) mean += s.factor;
    mean /= test.size();

    double ss_res = 0, ss_tot = 0;
    for (const auto& s : test) {
        double lr = regressionPrediction(s.road_type, s.when);
        err_avg += std::abs(averagePrediction(s.road_type, s.when) - s.factor);
        err_lr  += std::abs(lr - s.factor);
        err_off += std::abs(1.0 - s.factor);
        ss_res  += (lr - s.factor) * (lr - s.factor);
        ss_tot  += (s.factor - mean) * (s.factor - mean);
    }
    m_mae_avg = err_avg / test.size();
    m_mae_lr  = err_lr / test.size();
    m_mae_off = err_off / test.size();
    m_r2_lr   = (ss_tot > 0) ? 1.0 - ss_res / ss_tot : 0.0;
}

// ============================ Prediction ===================================

double TrafficModel::predict(TrafficMode mode, const std::string& road_type, const DateTime& when) const {
    if (!m_loaded || mode == TrafficMode::Off) return 1.0;

    double f = (mode == TrafficMode::HistoricalAverage)
                   ? averagePrediction(road_type, when)
                   : regressionPrediction(road_type, when);

    // Clamp to [1.0, 4.0]: traffic can only make a road slower, never faster
    // than free-flow. Keeping factor >= 1 also keeps the A* heuristic admissible.
    return std::clamp(f, 1.0, 4.0);
}
