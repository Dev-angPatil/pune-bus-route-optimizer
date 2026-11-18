#pragma once
#include <QMainWindow>
#include <QComboBox>
#include <QPushButton>
#include <QLabel>
#include <QTableWidget>
#include <QListWidget>
#include <QWebEngineView>
#include <QWebChannel>
#include <QDateTimeEdit>
#include "../core/Graph.h"
#include "../core/RouteResult.h"
#include "../core/TrafficModel.h"
#include "MapBridge.h"

class MainWindow : public QMainWindow {
    Q_OBJECT

public:
    explicit MainWindow(QWidget *parent = nullptr);
    ~MainWindow() override = default;

private slots:
    void onFindRouteClicked();
    void onSwapStopsClicked();
    void onImportMapClicked();
    void onResetMapClicked();
    void onMapStopSelected(const QString& action, const QString& stopId);
    void onWebPageLoaded(bool ok);
    void onBestTimeClicked();

private:
    void setupUI();
    void applyDarkTheme();
    void populateStopCombos();
    void sendNetworkToMap();
    void sendRouteToMap(const RouteResult& res);
    QString resultToJson(const RouteResult& res) const;

    // Traffic prediction helpers
    TrafficMode currentTrafficMode() const;
    DateTime currentDeparture() const;
    bool applyTrafficFromUI();          // returns true if traffic is on (route by time)
    void sendTrafficToMap();
    QString travelTimeText(const RouteResult& res) const;

    Graph m_graph;
    std::string m_stopsPath;
    std::string m_routesPath;
    std::string m_shapesPath;
    TrafficModel m_traffic;

    // UI Widgets
    QComboBox* m_originCombo{nullptr};
    QComboBox* m_destCombo{nullptr};
    QComboBox* m_algoCombo{nullptr};
    QDateTimeEdit* m_departureEdit{nullptr};
    QComboBox* m_trafficCombo{nullptr};
    QPushButton* m_bestTimeBtn{nullptr};
    QLabel* m_trafficLabel{nullptr};
    QPushButton* m_findRouteBtn{nullptr};
    QPushButton* m_swapBtn{nullptr};
    QPushButton* m_importMapBtn{nullptr};
    QPushButton* m_resetMapBtn{nullptr};

    QLabel* m_statusLabel{nullptr};
    QLabel* m_distValLabel{nullptr};
    QLabel* m_timeValLabel{nullptr};
    QLabel* m_execValLabel{nullptr};
    QLabel* m_nodesValLabel{nullptr};
    QLabel* m_complexityLabel{nullptr};
    QLabel* m_notesLabel{nullptr};

    QTableWidget* m_compareTable{nullptr};
    QListWidget* m_itineraryList{nullptr};

    QWebEngineView* m_webView{nullptr};
    QWebChannel* m_webChannel{nullptr};
    MapBridge* m_bridge{nullptr};
};
