#include "MainWindow.h"
#include "../core/Dijkstra.h"
#include "../core/AStar.h"
#include "../core/BellmanFord.h"
#include "../core/Benchmark.h"

#include <QVBoxLayout>
#include <QHBoxLayout>
#include <QGridLayout>
#include <QSplitter>
#include <QGroupBox>
#include <QHeaderView>
#include <QFileDialog>
#include <QMessageBox>
#include <QFileInfo>
#include <QDir>
#include <QUrl>
#include <sstream>
#include <iomanip>

MainWindow::MainWindow(QWidget *parent)
    : QMainWindow(parent),
      m_stopsPath("data/stops.csv"),
      m_routesPath("data/routes.csv"),
      m_shapesPath("data/shapes.json")
{
    // Try local relative path first, fallback to cpp_project/ prefix
    if (!QFileInfo::exists(QString::fromStdString(m_stopsPath))) {
        if (QFileInfo::exists("cpp_project/" + QString::fromStdString(m_stopsPath))) {
            m_stopsPath = "cpp_project/" + m_stopsPath;
            m_routesPath = "cpp_project/" + m_routesPath;
            m_shapesPath = "cpp_project/" + m_shapesPath;
        }
    }

    m_graph.loadFromCSV(m_stopsPath, m_routesPath, m_shapesPath);

    setupUI();
    applyDarkTheme();
    populateStopCombos();
}

void MainWindow::setupUI() {
    setWindowTitle("Pune PMPML Bus Route Optimizer - C++ & DAA Project");
    resize(1280, 800);

    auto* centralWidget = new QWidget(this);
    setCentralWidget(centralWidget);

    auto* mainLayout = new QHBoxLayout(centralWidget);
    mainLayout->setContentsMargins(10, 10, 10, 10);
    mainLayout->setSpacing(10);

    auto* splitter = new QSplitter(Qt::Horizontal, centralWidget);
    mainLayout->addWidget(splitter);

    // ================= LEFT PANEL =================
    auto* leftContainer = new QWidget(splitter);
    auto* leftLayout = new QVBoxLayout(leftContainer);
    leftLayout->setContentsMargins(5, 5, 5, 5);
    leftLayout->setSpacing(8);

    // 1. Header Box
    auto* headerBox = new QGroupBox("🚍 Pune Transit Optimizer", leftContainer);
    auto* headerLayout = new QVBoxLayout(headerBox);
    m_statusLabel = new QLabel(QString("Loaded: %1 Stops, %2 Corridors")
                                   .arg(m_graph.getVertexCount())
                                   .arg(m_graph.getEdgeCount() / 2), headerBox);
    m_statusLabel->setStyleSheet("color: #38bdf8; font-weight: bold;");

    auto* mapBtnLayout = new QHBoxLayout();
    m_importMapBtn = new QPushButton("📂 Import Map (CSV)", headerBox);
    m_resetMapBtn = new QPushButton("🔄 Default Pune Map", headerBox);
    mapBtnLayout->addWidget(m_importMapBtn);
    mapBtnLayout->addWidget(m_resetMapBtn);

    headerLayout->addWidget(m_statusLabel);
    headerLayout->addLayout(mapBtnLayout);
    leftLayout->addWidget(headerBox);

    // 2. Routing Controls Box
    auto* routeBox = new QGroupBox("Route Configuration", leftContainer);
    auto* routeLayout = new QGridLayout(routeBox);

    routeLayout->addWidget(new QLabel("Origin Stop:"), 0, 0);
    m_originCombo = new QComboBox(routeBox);
    m_originCombo->setEditable(true);
    routeLayout->addWidget(m_originCombo, 0, 1);

    m_swapBtn = new QPushButton("⇅", routeBox);
    m_swapBtn->setToolTip("Swap Origin & Destination");
    m_swapBtn->setFixedWidth(36);
    routeLayout->addWidget(m_swapBtn, 0, 2);

    routeLayout->addWidget(new QLabel("Destination:"), 1, 0);
    m_destCombo = new QComboBox(routeBox);
    m_destCombo->setEditable(true);
    routeLayout->addWidget(m_destCombo, 1, 1);

    routeLayout->addWidget(new QLabel("Algorithm:"), 2, 0);
    m_algoCombo = new QComboBox(routeBox);
    m_algoCombo->addItem("🟢 Dijkstra's Algorithm (Greedy)");
    m_algoCombo->addItem("🔵 A* Search Algorithm (Haversine Heuristic)");
    m_algoCombo->addItem("🟠 Bellman-Ford (Dynamic Programming)");
    m_algoCombo->addItem("⚡ Compare All 3 (Side-by-Side Benchmark)");
    routeLayout->addWidget(m_algoCombo, 2, 1, 1, 2);

    m_findRouteBtn = new QPushButton("🚀 Find Optimal Route", routeBox);
    m_findRouteBtn->setStyleSheet("background-color: #2563eb; color: white; font-weight: bold; padding: 8px;");
    routeLayout->addWidget(m_findRouteBtn, 3, 0, 1, 3);

    leftLayout->addWidget(routeBox);

    // 3. KPI Metrics Cards
    auto* metricsBox = new QGroupBox("Performance & Viva Metrics", leftContainer);
    auto* metricsLayout = new QGridLayout(metricsBox);

    metricsLayout->addWidget(new QLabel("Distance:"), 0, 0);
    m_distValLabel = new QLabel("-- km", metricsBox);
    m_distValLabel->setStyleSheet("color: #10b981; font-weight: bold; font-size: 14px;");
    metricsLayout->addWidget(m_distValLabel, 0, 1);

    metricsLayout->addWidget(new QLabel("Travel Time:"), 0, 2);
    m_timeValLabel = new QLabel("-- mins", metricsBox);
    m_timeValLabel->setStyleSheet("color: #f59e0b; font-weight: bold; font-size: 14px;");
    metricsLayout->addWidget(m_timeValLabel, 0, 3);

    metricsLayout->addWidget(new QLabel("Exec. Time:"), 1, 0);
    m_execValLabel = new QLabel("-- µs", metricsBox);
    m_execValLabel->setStyleSheet("color: #38bdf8; font-weight: bold; font-size: 14px;");
    metricsLayout->addWidget(m_execValLabel, 1, 1);

    metricsLayout->addWidget(new QLabel("Explored:"), 1, 2);
    m_nodesValLabel = new QLabel("-- nodes", metricsBox);
    m_nodesValLabel->setStyleSheet("color: #a855f7; font-weight: bold; font-size: 14px;");
    metricsLayout->addWidget(m_nodesValLabel, 1, 3);

    m_complexityLabel = new QLabel("Complexity: --", metricsBox);
    m_complexityLabel->setStyleSheet("color: #94a3b8; font-size: 11px;");
    metricsLayout->addWidget(m_complexityLabel, 2, 0, 1, 4);

    m_notesLabel = new QLabel("Select origin and destination to compute route.", metricsBox);
    m_notesLabel->setStyleSheet("color: #cbd5e1; font-size: 11px;");
    m_notesLabel->setWordWrap(true);
    metricsLayout->addWidget(m_notesLabel, 3, 0, 1, 4);

    leftLayout->addWidget(metricsBox);

    // 4. Comparison Table (visible when Compare All is selected)
    m_compareTable = new QTableWidget(4, 4, leftContainer);
    m_compareTable->setHorizontalHeaderLabels({"Metric", "Dijkstra", "A* Search", "Bellman-Ford"});
    m_compareTable->horizontalHeader()->setSectionResizeMode(QHeaderView::Stretch);
    m_compareTable->verticalHeader()->setVisible(false);
    m_compareTable->setFixedHeight(140);
    m_compareTable->hide(); // hidden by default until Compare All is run
    leftLayout->addWidget(m_compareTable);

    // 5. Itinerary List
    auto* itinBox = new QGroupBox("Route Itinerary (Stop Sequence)", leftContainer);
    auto* itinLayout = new QVBoxLayout(itinBox);
    m_itineraryList = new QListWidget(itinBox);
    itinLayout->addWidget(m_itineraryList);
    leftLayout->addWidget(itinBox);

    splitter->addWidget(leftContainer);

    // ================= RIGHT PANEL (WEB MAP) =================
    m_webView = new QWebEngineView(splitter);
    m_webChannel = new QWebChannel(this);
    m_bridge = new MapBridge(this);
    m_webChannel->registerObject("bridge", m_bridge);
    m_webView->page()->setWebChannel(m_webChannel);

    QString htmlPath = QDir::current().filePath("web/map.html");
    if (!QFileInfo::exists(htmlPath)) {
        htmlPath = QDir::current().filePath("cpp_project/web/map.html");
    }
    m_webView->load(QUrl::fromLocalFile(htmlPath));
    splitter->addWidget(m_webView);

    splitter->setStretchFactor(0, 1);
    splitter->setStretchFactor(1, 2);
    splitter->setSizes({430, 850});

    // Connections
    connect(m_findRouteBtn, &QPushButton::clicked, this, &MainWindow::onFindRouteClicked);
    connect(m_swapBtn, &QPushButton::clicked, this, &MainWindow::onSwapStopsClicked);
    connect(m_importMapBtn, &QPushButton::clicked, this, &MainWindow::onImportMapClicked);
    connect(m_resetMapBtn, &QPushButton::clicked, this, &MainWindow::onResetMapClicked);
    connect(m_webView, &QWebEngineView::loadFinished, this, &MainWindow::onWebPageLoaded);
    connect(m_bridge, &MapBridge::stopSelected, this, &MainWindow::onMapStopSelected);
}

void MainWindow::applyDarkTheme() {
    setStyleSheet(
        "QMainWindow { background-color: #0f172a; color: #f8fafc; }"
        "QWidget { color: #f8fafc; font-family: 'Segoe UI', system-ui, sans-serif; }"
        "QGroupBox { font-weight: bold; border: 1px solid #334155; border-radius: 8px; margin-top: 10px; padding-top: 12px; }"
        "QGroupBox::title { subcontrol-origin: margin; left: 10px; padding: 0 4px; color: #38bdf8; }"
        "QComboBox { background-color: #1e293b; border: 1px solid #475569; border-radius: 4px; padding: 5px; color: #f8fafc; }"
        "QComboBox QAbstractItemView { background-color: #1e293b; color: #f8fafc; selection-background-color: #2563eb; }"
        "QPushButton { background-color: #334155; border: 1px solid #475569; border-radius: 4px; padding: 6px; color: #f8fafc; }"
        "QPushButton:hover { background-color: #475569; }"
        "QListWidget { background-color: #1e293b; border: 1px solid #334155; border-radius: 6px; padding: 4px; }"
        "QListWidget::item { padding: 4px; border-bottom: 1px solid #334155; }"
        "QTableWidget { background-color: #1e293b; border: 1px solid #334155; gridline-color: #334155; }"
        "QHeaderView::section { background-color: #0f172a; color: #94a3b8; font-weight: bold; border: 1px solid #334155; padding: 4px; }"
    );
}

void MainWindow::populateStopCombos() {
    m_originCombo->clear();
    m_destCombo->clear();

    const auto& stops = m_graph.getAllStops();
    for (const auto& s : stops) {
        QString text = QString("%1 (%2)").arg(QString::fromStdString(s.name)).arg(QString::fromStdString(s.id));
        m_originCombo->addItem(text, QString::fromStdString(s.id));
        m_destCombo->addItem(text, QString::fromStdString(s.id));
    }

    // Default: Swargate -> Hinjewadi Phase 3
    int swargateIdx = m_originCombo->findData("swargate");
    int hinjewadiIdx = m_destCombo->findData("hinjewadi_ph3");
    if (swargateIdx >= 0) m_originCombo->setCurrentIndex(swargateIdx);
    if (hinjewadiIdx >= 0) m_destCombo->setCurrentIndex(hinjewadiIdx);

    m_statusLabel->setText(QString("Loaded: %1 Stops, %2 Corridors")
                               .arg(m_graph.getVertexCount())
                               .arg(m_graph.getEdgeCount() / 2));
}

void MainWindow::onSwapStopsClicked() {
    int o = m_originCombo->currentIndex();
    int d = m_destCombo->currentIndex();
    m_originCombo->setCurrentIndex(d);
    m_destCombo->setCurrentIndex(o);
}

void MainWindow::onMapStopSelected(const QString& action, const QString& stopId) {
    if (action == "origin") {
        int idx = m_originCombo->findData(stopId);
        if (idx >= 0) m_originCombo->setCurrentIndex(idx);
    } else if (action == "destination") {
        int idx = m_destCombo->findData(stopId);
        if (idx >= 0) m_destCombo->setCurrentIndex(idx);
    }
}

void MainWindow::onWebPageLoaded(bool ok) {
    if (ok) {
        sendNetworkToMap();
    }
}

void MainWindow::sendNetworkToMap() {
    std::ostringstream stops_json;
    stops_json << "[";
    const auto& stops = m_graph.getAllStops();
    for (size_t i = 0; i < stops.size(); ++i) {
        const auto& s = stops[i];
        stops_json << "{\"id\":\"" << s.id
                   << "\",\"name\":\"" << s.name
                   << "\",\"lat\":" << std::fixed << std::setprecision(5) << s.lat
                   << ",\"lon\":" << s.lon
                   << ",\"category\":\"" << s.category << "\"}";
        if (i + 1 < stops.size()) stops_json << ",";
    }
    stops_json << "]";

    std::ostringstream edges_json;
    edges_json << "[";
    const auto& edges = m_graph.getAllEdges();
    for (size_t i = 0; i < edges.size(); ++i) {
        const auto& e = edges[i];
        edges_json << "{\"source\":\"" << e.source_id
                   << "\",\"target\":\"" << e.target_id
                   << "\",\"distance_km\":" << e.distance_km
                   << ",\"road_name\":\"" << e.road_name
                   << "\",\"polyline\":[";
        for (size_t p = 0; p < e.polyline.size(); ++p) {
            edges_json << "[" << e.polyline[p].first << "," << e.polyline[p].second << "]";
            if (p + 1 < e.polyline.size()) edges_json << ",";
        }
        edges_json << "]}";
        if (i + 1 < edges.size()) edges_json << ",";
    }
    edges_json << "]";

    QString js = QString("setTransitNetwork(%1, %2);")
                     .arg(QString::fromStdString(stops_json.str()))
                     .arg(QString::fromStdString(edges_json.str()));
    m_webView->page()->runJavaScript(js);
}

QString MainWindow::resultToJson(const RouteResult& res) const {
    std::ostringstream oss;
    oss << "{"
        << "\"found\":" << (res.found ? "true" : "false")
        << ",\"algorithm_name\":\"" << res.algorithm_name << "\""
        << ",\"total_distance_km\":" << std::fixed << std::setprecision(2) << res.total_distance_km
        << ",\"total_time_mins\":" << res.total_time_mins
        << ",\"execution_time_us\":" << res.execution_time_us
        << ",\"nodes_explored\":" << res.nodes_explored
        << ",\"path_ids\":[";
    for (size_t i = 0; i < res.path_ids.size(); ++i) {
        oss << "\"" << res.path_ids[i] << "\"";
        if (i + 1 < res.path_ids.size()) oss << ",";
    }
    oss << "],\"polyline\":[";
    for (size_t i = 0; i < res.full_polyline.size(); ++i) {
        oss << "[" << res.full_polyline[i].first << "," << res.full_polyline[i].second << "]";
        if (i + 1 < res.full_polyline.size()) oss << ",";
    }
    oss << "]}";
    return QString::fromStdString(oss.str());
}

void MainWindow::sendRouteToMap(const RouteResult& res) {
    QString json = resultToJson(res);
    m_webView->page()->runJavaScript(QString("displayRoute(%1);").arg(json));
}

void MainWindow::onFindRouteClicked() {
    std::string src = m_originCombo->currentData().toString().toStdString();
    std::string tgt = m_destCombo->currentData().toString().toStdString();

    if (src.empty() || tgt.empty()) {
        QMessageBox::warning(this, "Input Required", "Please select both Origin and Destination stops.");
        return;
    }

    if (src == tgt) {
        QMessageBox::information(this, "Same Stops", "Origin and Destination are the same stop.");
        return;
    }

    int algoChoice = m_algoCombo->currentIndex();

    if (algoChoice == 3) {
        // Compare All 3 Algorithms
        auto comp = Benchmark::compareAll(m_graph, src, tgt);

        m_compareTable->show();
        m_compareTable->setItem(0, 0, new QTableWidgetItem("Distance (km)"));
        m_compareTable->setItem(0, 1, new QTableWidgetItem(QString::number(comp.dijkstra.total_distance_km, 'f', 2)));
        m_compareTable->setItem(0, 2, new QTableWidgetItem(QString::number(comp.astar.total_distance_km, 'f', 2)));
        m_compareTable->setItem(0, 3, new QTableWidgetItem(QString::number(comp.bellman_ford.total_distance_km, 'f', 2)));

        m_compareTable->setItem(1, 0, new QTableWidgetItem("Time (mins)"));
        m_compareTable->setItem(1, 1, new QTableWidgetItem(QString::number(comp.dijkstra.total_time_mins, 'f', 1)));
        m_compareTable->setItem(1, 2, new QTableWidgetItem(QString::number(comp.astar.total_time_mins, 'f', 1)));
        m_compareTable->setItem(1, 3, new QTableWidgetItem(QString::number(comp.bellman_ford.total_time_mins, 'f', 1)));

        m_compareTable->setItem(2, 0, new QTableWidgetItem("Nodes Visited"));
        m_compareTable->setItem(2, 1, new QTableWidgetItem(QString::number(comp.dijkstra.nodes_explored)));
        m_compareTable->setItem(2, 2, new QTableWidgetItem(QString::number(comp.astar.nodes_explored)));
        m_compareTable->setItem(2, 3, new QTableWidgetItem(QString::number(comp.bellman_ford.nodes_explored)));

        m_compareTable->setItem(3, 0, new QTableWidgetItem("Exec. Time (µs)"));
        m_compareTable->setItem(3, 1, new QTableWidgetItem(QString::number(comp.dijkstra.execution_time_us)));
        m_compareTable->setItem(3, 2, new QTableWidgetItem(QString::number(comp.astar.execution_time_us)));
        m_compareTable->setItem(3, 3, new QTableWidgetItem(QString::number(comp.bellman_ford.execution_time_us)));

        m_distValLabel->setText(QString("%1 km").arg(comp.dijkstra.total_distance_km, 0, 'f', 2));
        m_timeValLabel->setText(QString("%1 mins").arg(comp.dijkstra.total_time_mins, 0, 'f', 1));
        m_execValLabel->setText(QString("%1 / %2 / %3 µs")
                                    .arg(comp.dijkstra.execution_time_us)
                                    .arg(comp.astar.execution_time_us)
                                    .arg(comp.bellman_ford.execution_time_us));
        m_nodesValLabel->setText(QString("A*:%1 < Dij:%2")
                                     .arg(comp.astar.nodes_explored)
                                     .arg(comp.dijkstra.nodes_explored));
        m_complexityLabel->setText("Dijkstra & A*: O((V+E)logV) | Bellman-Ford: O(V*E)");
        m_notesLabel->setText(QString::fromStdString(comp.summary));

        // Populate itinerary list
        m_itineraryList->clear();
        for (size_t i = 0; i < comp.dijkstra.path_stops.size(); ++i) {
            const auto& st = comp.dijkstra.path_stops[i];
            m_itineraryList->addItem(QString("%1. %2 (%3)")
                                         .arg(i + 1)
                                         .arg(QString::fromStdString(st.name))
                                         .arg(QString::fromStdString(st.category)));
        }

        sendRouteToMap(comp.astar); // Highlight route on map
    } else {
        m_compareTable->hide();
        RouteResult res;
        if (algoChoice == 0) {
            res = Dijkstra::findShortestPath(m_graph, src, tgt);
        } else if (algoChoice == 1) {
            res = AStar::findShortestPath(m_graph, src, tgt);
        } else {
            res = BellmanFord::findShortestPath(m_graph, src, tgt);
        }

        if (!res.found) {
            QMessageBox::warning(this, "No Path Found", "Could not find a path connecting the selected stops.");
            return;
        }

        m_distValLabel->setText(QString("%1 km").arg(res.total_distance_km, 0, 'f', 2));
        m_timeValLabel->setText(QString("%1 mins").arg(res.total_time_mins, 0, 'f', 1));
        m_execValLabel->setText(QString("%1 µs").arg(res.execution_time_us));
        m_nodesValLabel->setText(QString("%1 nodes").arg(res.nodes_explored));
        m_complexityLabel->setText(QString("Time: %1 | Space: %2")
                                       .arg(QString::fromStdString(res.time_complexity))
                                       .arg(QString::fromStdString(res.space_complexity)));
        m_notesLabel->setText(QString::fromStdString(res.notes));

        m_itineraryList->clear();
        for (size_t i = 0; i < res.path_stops.size(); ++i) {
            const auto& st = res.path_stops[i];
            m_itineraryList->addItem(QString("%1. %2 (%3)")
                                         .arg(i + 1)
                                         .arg(QString::fromStdString(st.name))
                                         .arg(QString::fromStdString(st.category)));
        }

        sendRouteToMap(res);
    }
}

void MainWindow::onImportMapClicked() {
    QString stopsFile = QFileDialog::getOpenFileName(this, "Select Custom Stops CSV", "", "CSV Files (*.csv)");
    if (stopsFile.isEmpty()) return;

    QString routesFile = QFileDialog::getOpenFileName(this, "Select Custom Routes CSV", "", "CSV Files (*.csv)");
    if (routesFile.isEmpty()) return;

    if (m_graph.loadFromCSV(stopsFile.toStdString(), routesFile.toStdString())) {
        m_stopsPath = stopsFile.toStdString();
        m_routesPath = routesFile.toStdString();
        m_shapesPath = "";

        populateStopCombos();
        sendNetworkToMap();

        QMessageBox::information(this, "Import Success",
                                 QString("Custom map imported successfully with %1 stops and %2 routes!")
                                     .arg(m_graph.getVertexCount())
                                     .arg(m_graph.getEdgeCount() / 2));
    } else {
        QMessageBox::critical(this, "Import Failed", "Failed to load the specified CSV files. Please check format.");
    }
}

void MainWindow::onResetMapClicked() {
    m_stopsPath = "data/stops.csv";
    m_routesPath = "data/routes.csv";
    m_shapesPath = "data/shapes.json";

    if (!QFileInfo::exists(QString::fromStdString(m_stopsPath))) {
        if (QFileInfo::exists("cpp_project/" + QString::fromStdString(m_stopsPath))) {
            m_stopsPath = "cpp_project/" + m_stopsPath;
            m_routesPath = "cpp_project/" + m_routesPath;
            m_shapesPath = "cpp_project/" + m_shapesPath;
        }
    }

    if (m_graph.loadFromCSV(m_stopsPath, m_routesPath, m_shapesPath)) {
        populateStopCombos();
        sendNetworkToMap();
        QMessageBox::information(this, "Reset Complete", "Default Pune PMPML transit map restored.");
    }
}
