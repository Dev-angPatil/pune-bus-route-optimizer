#pragma once
#include <QWidget>
#include <QPainter>
#include <vector>
#include <cmath>
#include <algorithm>
#include "../core/DeparturePlanner.h"

// Simple bar chart: one bar per 30-minute departure slot, height = travel time.
// The fastest slot is drawn in green, the rest in amber. Painted with QPainter,
// so it needs no extra Qt Charts module.
class DepartureChart : public QWidget {
public:
    DepartureChart(const std::vector<DepartureSlot>& departures, int best, QWidget* parent = nullptr)
        : QWidget(parent), m_slots(departures), m_best(best) {
        setMinimumSize(760, 320);
    }

protected:
    void paintEvent(QPaintEvent*) override {
        QPainter p(this);
        p.setRenderHint(QPainter::Antialiasing);
        p.fillRect(rect(), QColor("#0f172a"));
        if (m_slots.empty()) return;

        const int left = 50, right = 15, top = 20, bottom = 40;
        const int w = width() - left - right;
        const int h = height() - top - bottom;

        double max_time = 0;
        for (const auto& s : m_slots) max_time = std::max(max_time, s.travel_time_mins);
        max_time = std::ceil(max_time / 10.0) * 10.0;   // round axis up to next 10 mins

        // Horizontal grid lines + Y axis labels (minutes)
        p.setFont(QFont(font().family(), 8));
        for (int i = 0; i <= 4; ++i) {
            int y = top + h - i * h / 4;
            p.setPen(QColor("#334155"));
            p.drawLine(left, y, left + w, y);
            p.setPen(QColor("#94a3b8"));
            p.drawText(0, y - 7, left - 6, 14, Qt::AlignRight | Qt::AlignVCenter,
                       QString::number(max_time * i / 4, 'f', 0));
        }

        // Bars
        const double slot_w = static_cast<double>(w) / m_slots.size();
        for (size_t i = 0; i < m_slots.size(); ++i) {
            const auto& s = m_slots[i];
            int bar_h = static_cast<int>(h * s.travel_time_mins / max_time);
            QRectF bar(left + i * slot_w + 1, top + h - bar_h, slot_w - 2, bar_h);
            p.fillRect(bar, static_cast<int>(i) == m_best ? QColor("#10b981") : QColor("#f59e0b"));

            if (s.departure.minute == 0 && s.departure.hour % 2 == 0) {   // label every 2 hours
                p.setPen(QColor("#cbd5e1"));
                p.drawText(QRectF(left + i * slot_w - 15, top + h + 4, 40, 16), Qt::AlignCenter,
                           QString("%1:00").arg(s.departure.hour, 2, 10, QChar('0')));
            }
        }

        p.setPen(QColor("#94a3b8"));
        p.drawText(QRect(left, height() - 18, w, 16), Qt::AlignCenter,
                   "Departure time  (bar height = predicted travel time in minutes)");
    }

private:
    std::vector<DepartureSlot> m_slots;
    int m_best{-1};
};
