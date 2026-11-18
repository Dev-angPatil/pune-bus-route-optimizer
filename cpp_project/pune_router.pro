QT += core gui widgets webenginewidgets webchannel
CONFIG += c++17

TARGET = pune_route_optimizer
TEMPLATE = app

SOURCES += \
    src/core/Graph.cpp \
    src/core/Dijkstra.cpp \
    src/core/AStar.cpp \
    src/core/BellmanFord.cpp \
    src/core/Benchmark.cpp \
    src/gui/gui_main.cpp \
    src/gui/MainWindow.cpp

HEADERS += \
    src/core/Stop.h \
    src/core/Edge.h \
    src/core/RouteResult.h \
    src/core/Graph.h \
    src/core/Dijkstra.h \
    src/core/AStar.h \
    src/core/BellmanFord.h \
    src/core/Benchmark.h \
    src/gui/MapBridge.h \
    src/gui/MainWindow.h
