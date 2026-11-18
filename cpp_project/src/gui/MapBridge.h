#pragma once
#include <QObject>
#include <QString>

class MapBridge : public QObject {
    Q_OBJECT
public:
    explicit MapBridge(QObject* parent = nullptr) : QObject(parent) {}

public slots:
    void onStopClicked(const QString& action, const QString& stopId) {
        emit stopSelected(action, stopId);
    }

signals:
    void stopSelected(const QString& action, const QString& stopId);
};
