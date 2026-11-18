# Pune PMPML Transit Route Optimizer - C++ & DAA College Project
# Supports:
# 1. Standalone CLI (Pure Standard C++17 - Zero Dependencies)
# 2. Desktop GUI (Qt6 Widgets + Embedded OpenStreetMap Real Map)

CXX ?= g++
CXXFLAGS = -std=c++17 -Wall -Wextra -O2

CORE_SRCS = src/core/Graph.cpp \
            src/core/Dijkstra.cpp \
            src/core/AStar.cpp \
            src/core/BellmanFord.cpp \
            src/core/Benchmark.cpp \
            src/core/TrafficModel.cpp \
            src/core/DeparturePlanner.cpp

CLI_SRCS = src/cli/cli_main.cpp

.PHONY: all cli gui run run-cli clean help

all: cli gui

help:
	@echo "======================================================================"
	@echo "       Pune Transit Route Optimizer (C++ & DAA College Project)       "
	@echo "======================================================================"
	@echo " Available commands:"
	@echo "   make cli      : Compile standalone CLI tool (Zero dependencies)"
	@echo "   make gui      : Compile Desktop GUI with real interactive map"
	@echo "   make all      : Compile both CLI and GUI"
	@echo "   make run      : Run Desktop GUI application"
	@echo "   make run-cli  : Run Terminal CLI tool in interactive mode"
	@echo "   make clean    : Remove build files and binaries"
	@echo "======================================================================"

# Target 1: Standalone CLI (Pure Standard C++17)
cli: pune_route_cli

pune_route_cli: $(CORE_SRCS) $(CLI_SRCS) src/core/*.h
	@echo "[CXX] Compiling standalone CLI binary (pune_route_cli)..."
	$(CXX) $(CXXFLAGS) $(CORE_SRCS) $(CLI_SRCS) -o pune_route_cli
	@echo "[OK] Built pune_route_cli successfully!"

# Target 2: Desktop GUI with Real Map (Qt6)
gui: pune_route_optimizer

pune_route_optimizer: pune_router.pro $(CORE_SRCS) src/core/*.h src/gui/gui_main.cpp src/gui/MainWindow.cpp src/gui/MainWindow.h src/gui/MapBridge.h
	@echo "[Qt6] Generating Makefile from pune_router.pro..."
	qmake6 pune_router.pro -o Makefile.qt
	@echo "[Qt6] Compiling GUI application..."
	$(MAKE) -f Makefile.qt
	@echo "[OK] Built pune_route_optimizer successfully!"

run: gui
	./pune_route_optimizer

run-cli: cli
	./pune_route_cli

clean:
	@echo "[CLEAN] Cleaning build artifacts..."
	rm -f pune_route_cli pune_route_optimizer
	rm -f *.o moc_*.cpp moc_*.o Makefile.qt .qmake.stash
	@echo "[CLEAN] Complete."
