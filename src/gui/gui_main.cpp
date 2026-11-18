#include <QApplication>
#include "MainWindow.h"

int main(int argc, char *argv[]) {
    QApplication app(argc, argv);
    app.setApplicationName("Pune Transit Route Optimizer");
    app.setApplicationDisplayName("Pune Transit Route Optimizer - C++ & DAA Project");

    MainWindow window;
    window.show();

    return app.exec();
}
